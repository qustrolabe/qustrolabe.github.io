import { createEffect, createSignal, For, onMount, Show } from "solid-js";

const KIB = 1024;
const UNITS = ["B", "KB", "MB", "GB", "TB"];
const STORAGE_KEY = "tools:github-repo-size";
/** How many checks to remember */
const MAX_HISTORY = 20;
/** Recursive tree listings can be tens of megabytes of JSON, which is a lot to
 *  hand to the DOM, so the raw view shows only the head of it past this size */
const RAW_DISPLAY_LIMIT = 100_000;
/** Shared frame for the tool card and the checked list below it */
const CARD = "rounded-lg border border-surface-border p-4";

interface Repo {
    owner: string;
    name: string;
    /** branch or tag, when the input points at one */
    ref?: string;
}

interface HistoryEntry {
    id: string;
    owner: string;
    name: string;
    ref?: string;
    bytes: number;
    /** ISO timestamp of the check */
    checkedAt: string;
    /** size summed over the branch tree instead of taken from repo metadata */
    branch: boolean;
    /** GitHub cut the tree listing short, so the sum is only partial */
    truncated: boolean;
}

/**
 * Accepts `owner/repo`, `owner/repo@branch`, `git@host:owner/repo` or a GitHub
 * URL, including the `/tree/<branch>` and `/blob/<branch>/<file>` forms.
 */
function parseRepo(input: string): Repo | null {
    const cleaned = input
        .trim()
        .replace(/^https?:\/\/[^/]+\//i, "")
        .replace(/^git@[^:]+:/i, "")
        .replace(/\.git$/i, "")
        .replace(/^\/+|\/+$/g, "");

    const segments = cleaned.split("/").filter(Boolean);
    if (segments.length < 2) return null;

    const owner = segments[0];
    let name = segments[1];
    let ref: string | undefined;

    const at = name.indexOf("@");
    if (at > 0) {
        // owner/repo@branch, where a branch name may also have slashes
        ref = [name.slice(at + 1), ...segments.slice(2)].join("/");
        name = name.slice(0, at);
    } else if (segments[2] === "tree") {
        // a tree URL keeps the whole rest of the path, branch names may have slashes
        ref = segments.slice(3).join("/");
    } else if (segments[2] === "blob") {
        // in a blob URL the branch is one segment and the rest is the file path
        ref = segments[3];
    }

    const valid = /^[\w.-]+$/;
    if (!valid.test(owner) || !valid.test(name)) return null;
    if (ref !== undefined && ref.length === 0) return null;

    return { owner, name, ref };
}

/** Turns a size in bytes into a short human readable string */
function formatBytes(bytes: number): string {
    let value = bytes;
    let unit = 0;
    while (value >= KIB && unit < UNITS.length - 1) {
        value /= KIB;
        unit++;
    }
    const decimals = unit === 0 || value >= 100 ? 0 : value >= 10 ? 1 : 2;
    return `${value.toFixed(decimals)} ${UNITS[unit]}`;
}

/** Pretty prints an API body, cutting off anything past the display limit */
function formatRaw(text: string): string {
    let body = text;
    try {
        body = JSON.stringify(JSON.parse(text), null, 2);
    } catch {
        // not JSON, show it as it arrived
    }
    if (body.length <= RAW_DISPLAY_LIMIT) return body;
    return `${body.slice(
        0,
        RAW_DISPLAY_LIMIT,
    )}\n\n... truncated for display, ${body.length} characters in total`;
}

/** Branch names may contain slashes, which stay slashes in the URL */
const encodeRef = (ref: string) => ref.split("/").map(encodeURIComponent).join("/");

const repoLink = (owner: string, name: string, ref?: string) =>
    ref
        ? `https://github.com/${owner}/${name}/tree/${encodeRef(ref)}`
        : `https://github.com/${owner}/${name}`;

const label = (entry: Pick<HistoryEntry, "owner" | "name" | "ref">) =>
    `${entry.owner}/${entry.name}${entry.ref ? `@${entry.ref}` : ""}`;

function formatCheckedAt(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate(),
    )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function GithubRepoSize() {
    const [input, setInput] = createSignal("");
    const [loading, setLoading] = createSignal(false);
    const [size, setSize] = createSignal("");
    const [note, setNote] = createSignal("");
    const [error, setError] = createSignal("");
    const [target, setTarget] = createSignal("");
    const [raw, setRaw] = createSignal("");
    const [history, setHistory] = createSignal<HistoryEntry[]>([]);
    const [restored, setRestored] = createSignal(false);

    let inputElement: HTMLInputElement | undefined;

    onMount(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed: unknown = JSON.parse(stored);
                if (Array.isArray(parsed)) setHistory(parsed as HistoryEntry[]);
            }
        } catch {
            // unreadable or blocked storage, start from an empty list
        }
        setRestored(true);
    });

    createEffect(() => {
        // wait for the stored list to land, otherwise the first run wipes it
        if (!restored()) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history()));
        } catch {
            // storage full or blocked, the list just won't survive a reload
        }
    });

    const remember = (repo: Repo, bytes: number, truncated: boolean) => {
        const entry: HistoryEntry = {
            id: label(repo).toLowerCase(),
            owner: repo.owner,
            name: repo.name,
            ref: repo.ref,
            bytes,
            checkedAt: new Date().toISOString(),
            branch: Boolean(repo.ref),
            truncated,
        };
        // re-checking a repo moves it to the top instead of listing it twice
        setHistory((prev) =>
            [entry, ...prev.filter((item) => item.id !== entry.id)].slice(0, MAX_HISTORY),
        );
    };

    // The request only leaves the browser when the button is pressed
    const submit = async (event: SubmitEvent) => {
        event.preventDefault();

        const repo = parseRepo(input());
        if (!repo) {
            setSize("");
            setNote("");
            setTarget("");
            setRaw("");
            setError("enter a repository as owner/name or owner/name@branch");
            return;
        }

        setLoading(true);
        setError("");
        setSize("");
        setNote("");
        setRaw("");
        setTarget(label(repo));

        // GitHub reports no per branch size, so a branch is measured by summing
        // the files in its tree instead: the checkout size, no .git history.
        const url = repo.ref
            ? `https://api.github.com/repos/${repo.owner}/${repo.name}/git/trees/${encodeRef(
                  repo.ref,
              )}?recursive=1`
            : `https://api.github.com/repos/${repo.owner}/${repo.name}`;

        try {
            const response = await fetch(url, {
                headers: { Accept: "application/vnd.github+json" },
            });
            const text = await response.text();

            // Keep the body even on errors: GitHub explains rate limits there
            setRaw(text);

            const data = JSON.parse(text) as {
                size?: number;
                truncated?: boolean;
                message?: string;
                tree?: { type?: string; size?: number }[];
            };
            if (!response.ok) {
                throw new Error(data.message ?? `request failed with ${response.status}`);
            }

            let bytes: number;
            let truncated = false;

            if (repo.ref) {
                const blobs = (data.tree ?? []).filter(
                    (item) => item.type === "blob" && typeof item.size === "number",
                );
                bytes = blobs.reduce((total, item) => total + (item.size ?? 0), 0);
                truncated = data.truncated === true;
                setNote(
                    truncated
                        ? "branch files only, GitHub cut the listing short so this is a partial sum"
                        : "branch files only, git history not included",
                );
            } else {
                bytes = (data.size ?? 0) * KIB;
                setNote("");
            }

            setSize(formatBytes(bytes));
            remember(repo, bytes, truncated);
        } catch (err) {
            setError(err instanceof Error ? err.message : "request failed");
        } finally {
            setLoading(false);
        }
    };

    const refill = (entry: HistoryEntry) => {
        setInput(repoLink(entry.owner, entry.name, entry.ref));
        inputElement?.focus();
    };

    return (
        <div class="flex flex-col gap-4">
            <form class={`${CARD} flex flex-col gap-3`} onSubmit={submit}>
                <div class="flex flex-col gap-2 sm:flex-row">
                    <input
                        ref={inputElement}
                        type="text"
                        value={input()}
                        onInput={(event) => setInput(event.currentTarget.value)}
                        placeholder="https://github.com/qustrolabe/qustrolabe.github.io"
                        aria-label="GitHub repository"
                        spellcheck={false}
                        autocomplete="off"
                        class="min-w-0 flex-1 rounded-sm border border-surface-border bg-background px-3 py-2 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-400"
                    />
                    <button
                        type="submit"
                        disabled={loading()}
                        class="shrink-0 rounded-sm border border-surface-border px-3 py-2 text-sm transition-colors hover:border-neutral-500 hover:bg-surface focus-visible:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-surface-border disabled:hover:bg-transparent"
                    >
                        {loading() ? "loading..." : "get size"}
                    </button>
                </div>
                <p class="m-0 text-xs text-neutral-500">
                    owner/repo, owner/repo@branch or a GitHub url
                </p>

                <Show when={error()}>
                    <p class="m-0 text-sm text-highlight">{error()}</p>
                </Show>

                <Show when={size()}>
                    <p class="m-0 flex items-baseline gap-2">
                        <span class="text-xl font-semibold">{size()}</span>
                        <span class="text-xs break-all text-neutral-500">{target()}</span>
                    </p>
                </Show>

                <Show when={note()}>
                    <p class="m-0 text-xs text-neutral-500">{note()}</p>
                </Show>

                <Show when={raw()}>
                    <details class="text-sm">
                        <summary class="cursor-pointer text-neutral-400 hover:text-neutral-200">
                            raw response
                        </summary>
                        <pre class="mt-2 max-h-80 overflow-auto rounded-sm border border-surface-border bg-surface p-3 text-xs break-all whitespace-pre-wrap">
                            {formatRaw(raw())}
                        </pre>
                    </details>
                </Show>
            </form>

            <div class={`${CARD} flex flex-col gap-2`}>
                <span class="text-xs tracking-wide text-neutral-500 uppercase">log</span>
                <Show
                    when={history().length > 0}
                    fallback={<p class="m-0 text-sm text-neutral-500">nothing logged yet</p>}
                >
                    <ul class="m-0! flex list-none! flex-col gap-1 p-0!">
                        <For each={history()}>
                            {(entry) => (
                                <li class="flex items-center gap-2 rounded-sm border border-surface-border px-2 py-1 text-sm">
                                    <a
                                        href={repoLink(entry.owner, entry.name, entry.ref)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={label(entry)}
                                        class="min-w-0 flex-1 truncate no-underline!"
                                    >
                                        {repoLink(entry.owner, entry.name, entry.ref)}
                                    </a>
                                    <span
                                        class="shrink-0 text-xs text-neutral-400"
                                        title={
                                            entry.truncated
                                                ? "partial sum, GitHub cut the tree listing short"
                                                : undefined
                                        }
                                    >
                                        {formatBytes(entry.bytes)}
                                    </span>
                                    <span class="shrink-0 text-xs whitespace-nowrap text-neutral-500">
                                        {formatCheckedAt(entry.checkedAt)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => refill(entry)}
                                        title="Put this repo back in the input"
                                        class="shrink-0 text-xs text-neutral-400 hover:text-neutral-200"
                                    >
                                        use
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setHistory((prev) =>
                                                prev.filter((item) => item.id !== entry.id),
                                            )
                                        }
                                        aria-label={`Remove ${label(entry)}`}
                                        title="Remove"
                                        class="shrink-0 text-xs text-neutral-400 hover:text-neutral-200"
                                    >
                                        ×
                                    </button>
                                </li>
                            )}
                        </For>
                    </ul>
                </Show>
            </div>
        </div>
    );
}
