import { PaginatedResponse } from "./base";

interface NewCompetitionItemSchema {
    title: string;
    description: string;
    category: string;
    videoId: string;
}
interface CompetitionItemSchema extends NewCompetitionItemSchema {
    id: string;
}

type CompetitionItemPaginatedResponseSchema = PaginatedResponse<CompetitionItemSchema>;

export type { CompetitionItemSchema, CompetitionItemPaginatedResponseSchema, NewCompetitionItemSchema }