import type { ImageMetadata } from "astro";

const PREFIX = "../../assets/projects/" as const;

const modules = import.meta.glob<{ default: ImageMetadata }>(
	"../../assets/projects/*.{webp,avif,png,jpg,jpeg,svg}",
	{ eager: true },
);

/**
 * Card images are currently disabled. To re-enable:
 *   1. add files to src/assets/projects/
 *   2. run "bun run gen" (writes images.gen.ts listing them)
 *   3. uncomment the next line and delete the placeholder below
 */
// import { imageFiles } from "./images.gen";
const imageFiles = [] as const;

export type ProjectImageFile = (typeof imageFiles)[number];

// Fails the build if the list drifts out of sync with disk
for (const file of imageFiles) {
	if (!modules[`${PREFIX}${file}`]) {
		throw new Error(
			`"${file}" is listed in src/content/projects/images.ts but was not found in src/assets/projects/`,
		);
	}
}

export function getProjectImage(
	fileName: ProjectImageFile | undefined,
): ImageMetadata | undefined {
	if (!fileName) return undefined;
	return modules[`${PREFIX}${fileName}`]?.default;
}
