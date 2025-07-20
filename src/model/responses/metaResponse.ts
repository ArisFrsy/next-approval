export interface MetaResponse<T> {
  success: boolean;
  message: string;
  data: T;
  page?: number;
  perPage?: number;
  total?: number;
  error?: string;
}
