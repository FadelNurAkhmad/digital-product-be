/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { awsConstant } from '../constants/aws.constant';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { IAWSEnvironment } from 'src/interfaces/aws.interface';

@Injectable()
export class AwsUtil {
  private logger: Logger = new Logger(AwsUtil.name);
  private readonly s3Client: S3Client;
  private readonly ssmClient: SSMClient;

  constructor() {
    // Inisialisasi parameter koneksi AWS menggunakan konstanta yang ada
    const params: any = {
      region: awsConstant.REGION_AWS,
      credentials: {
        accessKeyId: awsConstant.ACCESS_KEY_AWS,
        secretAccessKey: awsConstant.SECRET_ACCESS_KEY_AWS,
      },
    };

    // Membuat instance client untuk S3 dan SSM
    this.s3Client = new S3Client(params);
    this.ssmClient = new SSMClient(params);
  }

  /**
   * Mengunggah file ke bucket S3
   * @param params - Berisi key (path), body (data file), dan contentType
   * @returns URL publik dari file yang diunggah
   */
  public async uploadFileToS3(params: {
    key: string;
    body: Buffer | Uint8Array | Blob | string;
    contentType?: string;
  }): Promise<string> {
    try {
      // Mengirim perintah PutObject ke S3
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: awsConstant.BUCKET_NAME_AWS,
          Key: params.key,
          Body: params.body,
          ContentType: params.contentType,
        }),
      );

      // Mengembalikan URL lengkap file yang baru saja diunggah
      return this.getUrlS3(params.key);
    } catch (error) {
      // Logging jika terjadi error saat upload
      this.logger.error(`Error uploadFileToS3`, (error as Error)?.stack);
      throw error;
    }
  }

  /**
   * Menghasilkan URL S3 secara manual berdasarkan region dan bucket
   * @param key - Path/Nama file di S3
   */
  private getUrlS3(key: string): string {
    return `https://s3.${awsConstant.REGION_AWS}.amazonaws.com/${awsConstant.BUCKET_NAME_AWS}/${encodeURIComponent(key)}`;
  }

  /**
   * Membuat nama file (key) sementara yang unik untuk menghindari tabrakan nama file
   * @param userUuid - ID pengguna untuk folder path
   * @param originalName - Nama asli file
   */
  public makeTempKey(userUuid: string, originalName: string): string {
    // Mengambil ekstensi file atau default ke .bin
    const ext: string = path.extname(originalName || '') || '.bin';

    // Membersihkan nama file: huruf kecil, ganti karakter non-alfanumerik dengan '-', potong max 50 karakter
    const safeBase: string = (path.basename(originalName, ext) || 'file')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 50);

    // Format hasil: temp/{userUuid}/{random-uuid}-{nama-aman}.{ekstensi}
    return `temp/${userUuid}/${randomUUID()}-${safeBase}${ext}`;
  }

  /**
   * Membuat URL khusus (Pre-signed URL) agar client bisa upload langsung ke S3
   * @param key - Lokasi penyimpanan file di S3
   * @param contentType - Tipe file (misal: image/jpeg)
   */
  public async createPresignedPutUrl(
    key: string,
    contentType: string,
  ): Promise<{ url: string; key: string }> {
    const cmd = new PutObjectCommand({
      Bucket: awsConstant.BUCKET_NAME_AWS,
      Key: key,
      ContentType: contentType,
      Tagging: 'stage=temp', // Ditandai sebagai file sementara
      ACL: 'private',
    });

    // Membuat URL yang berlaku selama 5 menit (60 detik * 5)
    const url: string = await getSignedUrl(this.s3Client, cmd, {
      expiresIn: 60 * 5,
    });
    return { url, key };
  }

  /**
   * Memindahkan file dari folder 'temp' ke lokasi permanen
   * @param tempKey - Key file asal
   * @param finalKey - Key tujuan file
   */
  public async finalizeObjectFromTemp(
    tempKey: string,
    finalKey: string,
  ): Promise<string> {
    // 1. Pastikan file asal (temp) memang ada
    await this.s3Client.send(
      new HeadObjectCommand({
        Bucket: awsConstant.BUCKET_NAME_AWS,
        Key: tempKey,
      }),
    );

    // 2. Salin file ke lokasi baru dengan metadata permanen
    await this.s3Client.send(
      new CopyObjectCommand({
        Bucket: awsConstant.BUCKET_NAME_AWS,
        CopySource: `${awsConstant.BUCKET_NAME_AWS}/${encodeURIComponent(tempKey)}`,
        Key: finalKey,
        MetadataDirective: 'REPLACE',
        TaggingDirective: 'REPLACE',
        Tagging: 'stage=permanent', // Ubah tag menjadi permanen
        ACL: 'private',
      }),
    );

    // 3. Hapus file lama di folder temp
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: awsConstant.BUCKET_NAME_AWS,
          Key: tempKey,
        }),
      );
    } catch (error) {
      // Jika gagal menghapus temp, beri peringatan tapi jangan hentikan proses
      this.logger.warn(
        `Failed to delete temp object ${tempKey}: ${(error as Error)?.stack}`,
      );
    }

    // Mengembalikan URL permanen
    return this.getUrlS3(finalKey);
  }

  /**
   * Membuat key khusus untuk foto user (sama seperti makeTempKey di gambar sebelumnya)
   */
  public makeUserPhotoKey(userUuid: string, originalName: string): string {
    const ext: string = path.extname(originalName || '') || '.bin';
    const safeBase: string = (path.basename(originalName, ext) || 'file')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 50);

    return `temp/${userUuid}/${randomUUID()}-${safeBase}${ext}`;
  }

  /**
   * Mengambil nilai konfigurasi dari AWS Parameter Store (SSM)
   * Mengasumsikan nilai yang disimpan adalah format JSON string
   */
  public async getParameterStoreValue(): Promise<IAWSEnvironment> {
    try {
      const parameterNames: string = awsConstant.PARAMETER_STORE_NAMES;
      let splitParameterNames: string[] = [];

      // Parsing nama-nama parameter yang dipisahkan koma
      if (parameterNames) {
        if (parameterNames.includes(',')) {
          splitParameterNames = parameterNames
            .split(',')
            .map((p: string) => p.trim())
            .filter(Boolean);
        } else {
          splitParameterNames = [parameterNames.trim()];
        }
      } else {
        splitParameterNames = [];
      }

      let result: IAWSEnvironment = {} as IAWSEnvironment;

      // Ambil nilai setiap parameter dari AWS SSM secara berurutan
      for (const parameterName of splitParameterNames) {
        const response: any = await this.ssmClient.send(
          new GetParameterCommand({
            Name: parameterName,
            WithDecryption: true, // Dekripsi jika parameter bertipe SecureString
          }),
        );

        // Parse isi parameter (asumsi isi value adalah JSON) dan gabungkan ke object result
        const dataName: any = JSON.parse(response.Parameter.Value);
        result = { ...result, ...dataName };
      }

      return result;
    } catch (error) {
      this.logger.error(
        'Error getParameterStoreValue',
        (error as Error)?.stack,
      );
      throw error;
    }
  }
}
