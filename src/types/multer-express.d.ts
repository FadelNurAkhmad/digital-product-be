/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { File as MulterFile } from 'multer';

// Untuk menambahkan type MulterFile ke dalam namespace Express.Multer.File
declare global {
  namespace Express {
    namespace Multer {
      interface File extends MulterFile {}
    }
  }
}
