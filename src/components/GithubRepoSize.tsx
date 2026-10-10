import { createSignal, Show } from "solid-js";

/** GitHub reports the repository size in kilobytes */
const KIB = 1024;
const UNITS = ["B", "KB", "MB", "GB", "TB"];

interface Repo {
    owner: string;
    name: string;
}

/** Accepts `owner/name` or any GitHub repo URL and returns the owner/name pair */
function parseRepo(input: string): Repo | null {
    const cleaned = input
        .trim()
        .replace(/^https?:\/\/[^/]+\//i, "")
        .replace(/\.git$/i, "")
        .replace(/^\/+|\/+$/g, "");
    const parts = cleaned.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    const [owner, name] = parts;
    const valid = /^[\w.-]+$/;
    if (!valid.test(owner) || !valid.test(name)) return null;

    return { owner, name };
}

/** Turns a size in kilobytes into a short human readable string */
function formatSize(kib: number): string {
    let value = kib * KIB;
    let unit = 0;
    while (value >= KIB && unit < UNITS.length - 1) {
        value /= KIB;
        unit++;
    }
    const decimals = unit === 0 || value >= 100 ? 0 : value >= 10 ? 1 : 2;
    return `${value.toFixed(decimals)} ${UNITS[unit]}`;
}

export default function GithubRepoSize() {
    const [input, setInput] = createSignal("");
    const [loading, setLoading] = createSignal(false);
    const [size, setSize] = createSignal("");
    const [error, setError] = createSignal("");
    const [fullName, setFullName] = createSignal("");
    const [raw, setRaw] = createSignal("");

    // The request only leaves the browser when the button is pressed
    const submit = async (event: SubmitEvent) => {
        event.preventDefault();

        const repo = parseRepo(input());
        if (!repo) {
            setSize("");
            setFullName("");
            setRaw("");
            setError("enter a repository as owner/name");
            return;
        }

        setLoading(true);
        setError("");
        setSize("");
        setFullName(`${repo.owner}/${repo.name}`);
        setRaw("");

        try {
            const response = await fetch(
                `https://api.github.com/repos/${repo.owner}/${repo.name}`,
                {
                    headers: { Accept: "application/vnd.github+json" },
                },
            );
            const text = await response.text();

            // Keep the body even on errors: GitHub explains rate limits there
            setRaw(text);

            const data = JSON.parse(text) as {
                size?: number;
                message?: string;
            };
            if (!response.ok) {
                throw new Error(
                    data.message ?? `request failed with ${response.status}`,
                );
            }

            setSize(
                typeof data.size === "number"
                    ? formatSize(data.size)
                    : "unknown",
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "request failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form class="flex flex-col gap-3" onSubmit={submit}>
            <div class="flex flex-col gap-2 sm:flex-row">
                <input
                    type="text"
                    value={input()}
                    onInput={(event) => setInput(event.currentTarget.value)}
                    placeholder="https://github.com/torvalds/linux"
                    aria-label="GitHub repository"
                    spellcheck={false}
                    autocomplete="off"
                    class="min-w-0 flex-1 rounded-sm border border-surface-border bg-background px-3 py-2 text-sm outline-none placeholder:text-neutral-500 focus:border-highlight"
                />
                <button
                    type="submit"
                    disabled={loading()}
                    class="shrink-0 rounded-sm border border-surface-border px-3 py-2 text-sm transition-colors hover:border-highlight hover:text-highlight focus-visible:border-highlight disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-surface-border disabled:hover:text-foreground"
                >
                    {loading() ? "loading..." : "get size"}
                </button>
            </div>

            <Show when={error()}>
                <p class="m-0 text-sm text-highlight">{error()}</p>
            </Show>

            <Show when={size()}>
                <p class="m-0 flex items-baseline gap-2">
                    <span class="text-xl font-semibold">{size()}</span>
                    <span class="text-xs text-neutral-500">{fullName()}</span>
                </p>
            </Show>

            <Show when={raw()}>
                <details class="text-sm">
                    <summary class="cursor-pointer text-neutral-400 hover:text-highlight">
                        raw response
                    </summary>
                    <pre class="mt-2 max-h-80 overflow-auto rounded-sm border border-surface-border bg-surface p-3 text-xs break-all whitespace-pre-wrap">
                        {(() => {
                            try {
                                return JSON.stringify(JSON.parse(raw()), null, 2);
                            } catch {
                                return raw();
                            }
                        })()}
                    </pre>
                </details>
            </Show>
        </form>
    );
}
