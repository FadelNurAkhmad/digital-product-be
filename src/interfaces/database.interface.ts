export interface IPagination {
  count: number; // Total seluruh data dalam database
  pageSize: number; // Jumlah data per halaman
  page: number; // Halaman saat ini yang sedang dibuka
  data: any; // Data (array) yang diambil dari database
}

export interface IQueryParams {
  limit: number;
  page: number;
  query: string;
  category?: number;
  level?: string;
  price?: number;
  rating?: number;
  type_code?: string;
  column?: string;
  sort?: 'ASC' | 'DESC';
}
