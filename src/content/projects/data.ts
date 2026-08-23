export interface Project {
    name: string;
    url: string;
    description: string;
}

export const projects: Project[] = [
    {
        name: "chrome-tags-extension",
        url: "https://github.com/qustrolabe/chrome-tags-extension",
        description: "Chrome extension for bookmarks management",
    },
    {
        name: "zoxide-notes",
        url: "https://github.com/qustrolabe/zoxide-notes",
        description: "zoxide for Obsidian, sort notes by usage frequency",
    },
    {
        name: "search-bangs",
        url: "https://github.com/qustrolabe/search-bangs",
        description: "search engine router script that supports !bangs",
    },
    {
        name: "prompt-manager",
        url: "https://github.com/qustrolabe/prompt-manager",
        description:
            "prompt manager with tags (intended for image generation prompts)",
    },
    {
        name: "chant",
        url: "https://github.com/qustrolabe/chant",
        description: "albums and artists aware music tags editor",
    },
    {
        name: "loom",
        url: "https://github.com/qustrolabe/loom",
        description: "tree branching interface for LLMs",
    },
    {
        name: "steam-unwrapper-extension",
        url: "https://github.com/qustrolabe/steam-unwrapper-extension",
        description:
            "simple browser extension to one-click ignore/wishlist games on Steam curator pages",
    },
    {
        name: "imgvec",
        url: "https://github.com/qustrolabe/imgvec",
        description: "CLI image similarity indexing tool built in Rust",
    },
];
