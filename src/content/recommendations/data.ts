export interface Recommendation {
    name: string;
    type:
        | "TV Series"
        | "Video Game"
        | "Manhwa"
        | "Anime"
        | "Movie"
        | "Book"
        | "Music"
        | "Other";
    year?: number;
    rating?: number;
    description?: string;
    /** External entry page (e.g. IMDb). When set, the whole card links there */
    link?: string;
    /** Image file name inside src/assets/recommendations/, shown as the poster */
    image?: string;
}

export const recommendations: Recommendation[] = [
    {
        name: "Pantheon",
        type: "TV Series",
        year: 2022,
    },
    {
        name: "Outer Wilds",
        type: "Video Game",
        year: 2019,
    },
    {
        name: "Baldur's Gate 3",
        type: "Video Game",
        year: 2023,
    },
    {
        name: "Mookhyang Dark Lady",
        type: "Manhwa",
        year: 2019,
    },
    {
        name: "Omniscient Reader's Viewpoint",
        type: "Manhwa",
    },
    {
        name: "SSS-Class Revival Hunter",
        type: "Manhwa",
    },
    {
        name: "Kino no Tabi: The Beautiful World",
        type: "Anime",
    },
    {
        name: "Serial Experiments Lain",
        type: "Anime",
    },
    {
        name: "There is no Antimemetics Division",
        type: "Book",
    },
];
