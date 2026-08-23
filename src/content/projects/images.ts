import type { ImageMetadata } from "astro";
import { imageFiles } from "./images.gen";

const PREFIX = "../../assets/projects/" as const;

const modules = import.meta.glob<{ default: ImageMetadata }>(
	"../../assets/projects/*.{webp,avif,png,jpg,jpeg,svg}",
	{ eager: true },
);

export type { ImageFile as ProjectImageFile } from "./images.gen";

// Fails the build if the generated list drifts out of sync with disk
for (const file of imageFiles) {
	if (!modules[`${PREFIX}${file}`]) {
		throw new Error(
			`"${file}" is listed in src/content/projects/images.gen.ts but was not found in src/assets/projects/ — run "bun run gen"`,
		);
	}
}

export function getProjectImage(
	fileName: import("./images.gen").ImageFile | undefined,
): ImageMetadata | undefined {
	if (!fileName) return undefined;
	return modules[`${PREFIX}${fileName}`]?.default;
}
