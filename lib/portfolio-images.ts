/**
 * Single source of truth for Reelcraft creator portfolio and category artwork.
 * Each of the eight creative specializations has three dedicated visual samples in /pics/.
 */

export const CATEGORY_HERO_IMAGES: Record<string, string> = {
  "Motion Designer": "/pics/motiondesigner1.png",
  "3D Artist": "/pics/3dartist1.png",
  "VFX Artist": "/pics/vfx1.png",
  "Video Editor": "/pics/videoeditor1.png",
  "Character Animator": "/pics/characteranimator1.png",
  "Product Animator": "/pics/productanimator1.png",
  "CGI Artist": "/pics/cgiartist1.png",
  "Compositor": "/pics/compositor1.png",
};

export const SPECIALIZATION_PORTFOLIO_IMAGES: Record<
  string,
  [string, string, string]
> = {
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

export interface ImagePresentation {
  fit: "cover" | "contain";
  position: string;
  useAmbientBackdrop: boolean;
}

/**
 * Tailored fitting rules for landscape (16:9) displays.
 * Character portraits, tight product renders, and UI timelines that cannot tolerate
 * aggressive 16:9 vertical cropping use `contain` with an ambient blurred backdrop.
 * Landscape scenes and abstract motion graphics use `cover` with fine-tuned `position`.
 */
export const IMAGE_PRESENTATIONS: Record<string, ImagePresentation> = {
  // Motion Designer
  "/pics/motiondesigner1.png": { fit: "contain", position: "center", useAmbientBackdrop: true },
  "/pics/motiondesigner2.png": { fit: "cover", position: "center", useAmbientBackdrop: false },
  "/pics/motiondesigner3.png": { fit: "cover", position: "center", useAmbientBackdrop: false },

  // 3D Artist
  "/pics/3dartist1.png": { fit: "cover", position: "center 42%", useAmbientBackdrop: false },
  "/pics/3dartist2.png": { fit: "cover", position: "center", useAmbientBackdrop: false },
  "/pics/3dartist3.png": { fit: "cover", position: "center 45%", useAmbientBackdrop: false },

  // VFX Artist
  "/pics/vfx1.png": { fit: "cover", position: "center 45%", useAmbientBackdrop: false },
  "/pics/vfx2.png": { fit: "contain", position: "center", useAmbientBackdrop: true },
  "/pics/vfx3.png": { fit: "cover", position: "center 42%", useAmbientBackdrop: false },

  // Video Editor
  "/pics/videoeditor1.png": { fit: "cover", position: "center 45%", useAmbientBackdrop: false },
  "/pics/videoeditor2.png": { fit: "contain", position: "center", useAmbientBackdrop: true },
  "/pics/videoeditor3.png": { fit: "cover", position: "center 42%", useAmbientBackdrop: false },

  // Character Animator (Portraits require contain to avoid clipping foreheads/chins in 16:9)
  "/pics/characteranimator1.png": { fit: "contain", position: "center", useAmbientBackdrop: true },
  "/pics/characteranimator2.png": { fit: "contain", position: "center", useAmbientBackdrop: true },
  "/pics/characteranimator3.png": { fit: "contain", position: "center", useAmbientBackdrop: true },

  // Product Animator (Hero products require contain to avoid cutting off headbands/bottles/straps)
  "/pics/productanimator1.png": { fit: "contain", position: "center", useAmbientBackdrop: true },
  "/pics/productanimator2.png": { fit: "contain", position: "center", useAmbientBackdrop: true },
  "/pics/productanimator3.png": { fit: "contain", position: "center", useAmbientBackdrop: true },

  // CGI Artist
  "/pics/cgiartist1.png": { fit: "cover", position: "center 40%", useAmbientBackdrop: false },
  "/pics/cgiartist2.png": { fit: "cover", position: "center 45%", useAmbientBackdrop: false },
  "/pics/cgiartist3.png": { fit: "contain", position: "center", useAmbientBackdrop: true },

  // Compositor
  "/pics/compositor1.png": { fit: "contain", position: "center", useAmbientBackdrop: true },
  "/pics/compositor2.png": { fit: "contain", position: "center", useAmbientBackdrop: true },
  "/pics/compositor3.png": { fit: "cover", position: "center 45%", useAmbientBackdrop: false },
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
 * Returns the hero category image for a given specialization.
 */
export function getCategoryHeroImage(specialization?: string | null): string {
  const canonical = normalizeSpecialization(specialization);
  return CATEGORY_HERO_IMAGES[canonical] || "/pics/motiondesigner1.png";
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

/**
 * Returns presentation instructions (fit, position, ambient backdrop) for a given image.
 */
export function getImagePresentation(imagePath?: string | null): ImagePresentation {
  if (imagePath && IMAGE_PRESENTATIONS[imagePath]) {
    return IMAGE_PRESENTATIONS[imagePath];
  }
  return { fit: "cover", position: "center", useAmbientBackdrop: false };
}
