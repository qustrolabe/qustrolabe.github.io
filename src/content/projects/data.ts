export interface Project {
    name: string;
    /** GitHub repository link */
    repoUrl: string;
    description: string;
    /** Live hosted version. When set, the whole card links here instead of the repo */
    demoUrl?: string;
    /** Image file name inside src/assets/projects/, shown at the top of the card */
    image?: string;
    /** Iconify icon id (e.g. "simple-icons:rust"), shown next to the name when there is no image */
    icon?: string;
}

export const projects: Project[] = [
    {
        name: "chrome-tags-extension",
        repoUrl: "https://github.com/qustrolabe/chrome-tags-extension",
        description: "Chrome extension for bookmarks management",
    },
    {
        name: "zoxide-notes",
        repoUrl: "https://github.com/qustrolabe/zoxide-notes",
        description: "zoxide for Obsidian, sort notes by usage frequency",
    },
    {
        name: "search-bangs",
        repoUrl: "https://github.com/qustrolabe/search-bangs",
        description: "search engine router script that supports !bangs",
    },
    {
        name: "prompt-manager",
        repoUrl: "https://github.com/qustrolabe/prompt-manager",
        description: "prompt manager with tags (intended for image generation prompts)",
    },
    {
        name: "chant",
        repoUrl: "https://github.com/qustrolabe/chant",
        description: "albums and artists aware music tags editor",
    },
    {
        name: "loom",
        repoUrl: "https://github.com/qustrolabe/loom",
        description: "tree branching interface for LLMs",
    },
    {
        name: "steam-unwrapper-extension",
        repoUrl: "https://github.com/qustrolabe/steam-unwrapper-extension",
        description:
            "simple browser extension to one-click ignore/wishlist games on Steam curator pages",
    },
    {
        name: "imgvec",
        repoUrl: "https://github.com/qustrolabe/imgvec",
        description: "CLI image similarity indexing tool built in Rust",
    },
];
