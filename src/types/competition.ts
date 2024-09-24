import { PaginatedResponse } from "./base";

interface CompetitionResponseSchema {
    id: string;
    user_id: string;
    title: string;
    description: string;
    category: string;
    image: string;
    published: boolean;
}

type CompetitionPaginatedResponseSchema = PaginatedResponse<CompetitionResponseSchema>;

export type { CompetitionResponseSchema, CompetitionPaginatedResponseSchema }