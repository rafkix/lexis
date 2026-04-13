export type DailyWord = {
    id: number;
    word: string;
    uzTranslate: string;
    level: string;
};

export type CreateDailyWordPayload = {
    word: string;
    uzTranslate: string;
    level: string;
};

