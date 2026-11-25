/**
 * Single source of truth for creator portfolio artwork mapping.
 * Each of the eight creative specializations has three dedicated visual samples in /pics/.
 */

export const SPECIALIZATION_PORTFOLIO_IMAGES: Record<string, [string, string, string]> = {
  "Motion Designer": [
    "/pics/motiondesigner1.png",
    "/pics/motiondesigner2.png",
    "/pics/motiondesigner3.png",
  ],
  "3D Artist": [
    "/pics/3dartist1.png",
    "/pics/3dartist2.png",
    "/pics/3dartist3.png",
  ],
  "VFX Artist": [
    "/pics/vfx1.png",
    "/pics/vfx2.png",
    "/pics/vfx3.png",
  ],
  "Video Editor": [
    "/pics/videoeditor1.png",
    "/pics/videoeditor2.png",
    "/pics/videoeditor3.png",
  ],
  "Character Animator": [
    "/pics/characteranimator1.png",
    "/pics/characteranimator2.png",
    "/pics/characteranimator3.png",
  ],
  "Product Animator": [
    "/pics/productanimator1.png",
    "/pics/productanimator2.png",
    "/pics/productanimator3.png",
  ],
  "CGI Artist": [
    "/pics/cgiartist1.png",
    "/pics/cgiartist2.png",
    "/pics/cgiartist3.png",
  ],
  "Compositor": [
    "/pics/compositor1.png",
    "/pics/compositor2.png",
    "/pics/compositor3.png",
  ],
};

/**
 * Safely normalizes specialization variations (e.g. "VFX", "Visual Effects", "Motion Design")
 * to the canonical specialization key.
 */
export function normalizeSpecialization(input?: string | null): string {
  if (!input) return "Motion Designer";
  const s = input.trim().toLowerCase();

  if (s.includes("vfx") || s.includes("visual effect")) {
    return "VFX Artist";
  }
  if (s.includes("character")) {
    return "Character Animator";
  }
  if (s.includes("product")) {
    return "Product Animator";
  }
  if (s.includes("cgi")) {
    return "CGI Artist";
  }
  if (s.includes("composit")) {
    return "Compositor";
  }
  if (s.includes("motion")) {
    return "Motion Designer";
  }
  if (s.includes("video") || s.includes("edit")) {
    return "Video Editor";
  }
  if (s.includes("3d")) {
    return "3D Artist";
  }

  for (const key of Object.keys(SPECIALIZATION_PORTFOLIO_IMAGES)) {
    if (key.toLowerCase() === s) return key;
  }

  return "Motion Designer";
}

/**
 * Returns the 3 portfolio images for a given specialization.
 */
export function getSpecializationPortfolioImages(
  specialization?: string | null
): [string, string, string] {
  const canonical = normalizeSpecialization(specialization);
  return (
    SPECIALIZATION_PORTFOLIO_IMAGES[canonical] ||
    SPECIALIZATION_PORTFOLIO_IMAGES["Motion Designer"]
  );
}

/**
 * Returns a single portfolio image URL by index (0, 1, 2) for a given specialization.
 */
export function getPortfolioImageUrl(
  specialization?: string | null,
  index = 0
): string {
  const images = getSpecializationPortfolioImages(specialization);
  const normalizedIndex = Math.abs(index) % images.length;
  return images[normalizedIndex];
}

/**
 * Resolves a portfolio item's image URL.
 * Checks for an existing /pics/ path in thumbnailUrl or mediaUrl first,
 * then falls back to the specialization image mapping.
 */
export function resolvePortfolioItemImage(
  item?: {
    thumbnailUrl?: string | null;
    mediaUrl?: string | null;
    category?: string | null;
    gradient?: string | null;
  } | null,
  fallbackSpecialization?: string | null,
  index = 0
): string {
  if (item?.thumbnailUrl && item.thumbnailUrl.startsWith("/pics/")) {
    return item.thumbnailUrl;
  }
  if (item?.mediaUrl && item.mediaUrl.startsWith("/pics/")) {
    return item.mediaUrl;
  }
  return getPortfolioImageUrl(item?.category || fallbackSpecialization, index);
}

/**
 * Returns the three portfolio images to display on a creator card.
 * Uses the creator's portfolioItems images if available, otherwise maps from their specialization.
 */
export function getCreatorCardImages(creator: {
  specialization?: string | null;
  portfolioItems?: {
    thumbnailUrl?: string | null;
    mediaUrl?: string | null;
    gradient?: string | null;
  }[];
}): [string, string, string] {
  const specImages = getSpecializationPortfolioImages(creator.specialization);
  const items = creator.portfolioItems || [];

  return [
    resolvePortfolioItemImage(items[0], creator.specialization, 0) || specImages[0],
    resolvePortfolioItemImage(items[1], creator.specialization, 1) || specImages[1],
    resolvePortfolioItemImage(items[2], creator.specialization, 2) || specImages[2],
  ];
}
