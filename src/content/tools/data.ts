export interface Tool {
    /** Slug used in the /tools/<slug>/ URL */
    slug: string;
    name: string;
    description: string;
    /** Iconify icon id (e.g. "mdi:github"), shown next to the name */
    icon?: string;
}

export const tools: Tool[] = [
    {
        slug: "github-repo-size",
        name: "GitHub repo size",
        description: "repository size straight from the GitHub API",
        icon: "mdi:github",
    },
];
