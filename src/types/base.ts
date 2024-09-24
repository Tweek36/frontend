interface PaginatedResponse<T> {
    data: T[];
    max_per_page: number;
    page: number;
    total: number;
}

export type { PaginatedResponse }