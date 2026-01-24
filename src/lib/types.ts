export type ContentType = "walk" | "image" | "video" | "blog";

export type ContentItem = {
    slug: string;
    type?: string;
    title?: string;
    date?: string;
    cover?: string;
    poster?: string;
    src?: string;
    equipment?: string;
    location?: string | string[];
    duration?: string;
    category?: string;
    updatedAt?: string;
    views?: number;
    content: string;
};

export type BlogCategory = {
    key: string;
    title: string;
    description: string;
    count: number;
    variant: "overview" | "tracks" | "city" | "scenery";
};
