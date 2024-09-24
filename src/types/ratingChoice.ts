interface RatingChoiceResponseSchema {
    id: string;
    items: string[];
    stage: number;
    round: number;
    prev: string | null;
    next: string | null;
    winner_id: string | null;
}

interface ChooseResponseSchema {
    ended: boolean;
    next_choice: RatingChoiceResponseSchema;
}

export type { RatingChoiceResponseSchema, ChooseResponseSchema }