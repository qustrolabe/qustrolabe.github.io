import type { ImageMetadata } from "astro";
import { imageFiles } from "./images.gen";

const PREFIX = "../../assets/recommendations/" as const;

const modules = import.meta.glob<{ default: ImageMetadata }>(
	"../../assets/recommendations/*.{webp,avif,png,jpg,jpeg,svg}",
	{ eager: true },
);

export type { ImageFile as RecommendationImageFile } from "./images.gen";

// Fails the build if the generated list drifts out of sync with disk
for (const file of imageFiles) {
	if (!modules[`${PREFIX}${file}`]) {
		throw new Error(
			`"${file}" is listed in src/content/recommendations/images.gen.ts but was not found in src/assets/recommendations/ — run "bun run gen"`,
		);
	}
}

export function getRecommendationImage(
	fileName: import("./images.gen").ImageFile | undefined,
): ImageMetadata | undefined {
	if (!fileName) return undefined;
	return modules[`${PREFIX}${fileName}`]?.default;
}
