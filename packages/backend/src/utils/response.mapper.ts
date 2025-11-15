/**
 * Response Mapper Utilities
 * Transform database documents to UI-friendly responses
 */

/**
 * Generic mapper interface
 */
export interface ResponseMapper<TInput, TOutput> {
  (input: TInput): TOutput;
}

/**
 * Example: Map array of documents
 */
export function mapToListResponse<TInput, TOutput>(
  items: TInput[],
  mapper: ResponseMapper<TInput, TOutput>
): TOutput[] {
  return items.map(mapper);
}

/**
 * Example: Add pagination metadata
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}
