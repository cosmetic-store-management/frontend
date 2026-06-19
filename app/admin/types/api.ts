/** Generic API response wrapper từ backend */
export interface ApiResponse<T> {
  message?: string;
  data?: T;
}

/** Response khi backend trả về danh sách có phân trang */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
