interface NewRatingSchema {
    competition_id: string
    user_id: string
    stage: number
    choices: string[]
    ended: boolean
    is_refreshed: boolean
}

interface RatingSchema extends NewRatingSchema {
    id: string
}

export type { NewRatingSchema, RatingSchema }