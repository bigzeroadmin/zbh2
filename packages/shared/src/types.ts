export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'disabled';
export type ContentStatus = 'draft' | 'published' | 'archived';
export type ActivationCodeStatus = 'available' | 'granted' | 'revoked';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
