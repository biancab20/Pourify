export type PaginatedResponse<TItem> = {
  items: TItem[];
  totalCount: number;
};