/** Standard DRF PageNumberPagination envelope — matches apps/core/pagination.py
 * on the backend (StandardPagination / paginate_queryset()). */
export interface PaginatedResult<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
