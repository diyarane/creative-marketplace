import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  SPECIALIZATION_PORTFOLIO_IMAGES,
  CATEGORY_HERO_IMAGES,
  getCategoryHeroImage,
  normalizeSpecialization,
  getSpecializationPortfolioImages,
  resolvePortfolioItemImage,
  getCreatorCardImages,
  getImagePresentation,
} from "@/lib/portfolio-images";

describe("portfolio images mapping", () => {
  const specializations = [
    "Motion Designer",
    "3D Artist",
    "VFX Artist",
    "Video Editor",
    "Character Animator",
    "Product Animator",
    "CGI Artist",
    "Compositor",
  ];

  it("contains exactly 8 specializations with 3 images each", () => {
    expect(Object.keys(SPECIALIZATION_PORTFOLIO_IMAGES)).toHaveLength(8);
    for (const spec of specializations) {
      const images = SPECIALIZATION_PORTFOLIO_IMAGES[spec];
      expect(images).toBeDefined();
      expect(images).toHaveLength(3);
      for (const img of images) {
        expect(img.startsWith("/pics/")).toBe(true);
        expect(img.endsWith(".png")).toBe(true);
      }
    }
  });

  it("maps categories correctly according to exact requirements", () => {
    expect(getCategoryHeroImage("Motion Designer")).toBe("/pics/motiondesigner1.png");
    expect(getCategoryHeroImage("3D Artist")).toBe("/pics/3dartist1.png");
    expect(getCategoryHeroImage("VFX Artist")).toBe("/pics/vfx1.png");
    expect(getCategoryHeroImage("Video Editor")).toBe("/pics/videoeditor1.png");
    expect(getCategoryHeroImage("Character Animator")).toBe("/pics/characteranimator1.png");
    expect(getCategoryHeroImage("Product Animator")).toBe("/pics/productanimator1.png");
    expect(getCategoryHeroImage("CGI Artist")).toBe("/pics/cgiartist1.png");
    expect(getCategoryHeroImage("Compositor")).toBe("/pics/compositor1.png");

    for (const spec of specializations) {
      const hero = CATEGORY_HERO_IMAGES[spec];
      const localPath = path.join(process.cwd(), "public", hero.replace(/^\//, ""));
      expect(fs.existsSync(localPath), `Hero ${hero} must exist`).toBe(true);
    }
  });

  it("provides appropriate fitting and presentation rules for all 24 images", () => {
    for (const images of Object.values(SPECIALIZATION_PORTFOLIO_IMAGES)) {
      for (const img of images) {
        const pres = getImagePresentation(img);
        expect(pres).toBeDefined();
        expect(["cover", "contain"]).toContain(pres.fit);
        expect(typeof pres.position).toBe("string");
        expect(typeof pres.useAmbientBackdrop).toBe("boolean");
      }
    }

    // Character animator images require contain + ambient backdrop
    expect(getImagePresentation("/pics/characteranimator1.png").fit).toBe("contain");
    expect(getImagePresentation("/pics/characteranimator1.png").useAmbientBackdrop).toBe(true);

    // Product animator images require contain + ambient backdrop
    expect(getImagePresentation("/pics/productanimator1.png").fit).toBe("contain");
    expect(getImagePresentation("/pics/productanimator1.png").useAmbientBackdrop).toBe(true);
  });

  it("all 24 referenced image files exist in public/pics/", () => {
    for (const [spec, images] of Object.entries(SPECIALIZATION_PORTFOLIO_IMAGES)) {
      for (const imgPath of images) {
        const localPath = path.join(process.cwd(), "public", imgPath.replace(/^\//, ""));
        expect(fs.existsSync(localPath), `File ${imgPath} for ${spec} must exist`).toBe(true);
      }
    }
  });

  it("normalizes variations in specialization naming safely", () => {
    expect(normalizeSpecialization("VFX")).toBe("VFX Artist");
    expect(normalizeSpecialization("VFX Artist")).toBe("VFX Artist");
    expect(normalizeSpecialization("Visual Effects")).toBe("VFX Artist");

    expect(normalizeSpecialization("Motion Design")).toBe("Motion Designer");
    expect(normalizeSpecialization("Motion Graphics")).toBe("Motion Designer");
    expect(normalizeSpecialization("Motion Designer")).toBe("Motion Designer");

    expect(normalizeSpecialization("3D")).toBe("3D Artist");
    expect(normalizeSpecialization("3D Art")).toBe("3D Artist");
    expect(normalizeSpecialization("3D Animation")).toBe("3D Artist");
    expect(normalizeSpecialization("3D Artist")).toBe("3D Artist");

    expect(normalizeSpecialization("Video Editing")).toBe("Video Editor");
    expect(normalizeSpecialization("Video Editor")).toBe("Video Editor");

    expect(normalizeSpecialization("Character Animation")).toBe("Character Animator");
    expect(normalizeSpecialization("Character Animator")).toBe("Character Animator");

    expect(normalizeSpecialization("Product Animation")).toBe("Product Animator");
    expect(normalizeSpecialization("Product Visualization")).toBe("Product Animator");

    expect(normalizeSpecialization("CGI")).toBe("CGI Artist");
    expect(normalizeSpecialization("CGI & Rendering")).toBe("CGI Artist");

    expect(normalizeSpecialization("Compositing")).toBe("Compositor");
    expect(normalizeSpecialization("Compositor")).toBe("Compositor");

    expect(normalizeSpecialization(undefined)).toBe("Motion Designer");
    expect(normalizeSpecialization("")).toBe("Motion Designer");
  });

  it("returns appropriate 3 images for each specialization", () => {
    expect(getSpecializationPortfolioImages("Motion Designer")).toEqual([
      "/pics/motiondesigner1.png",
      "/pics/motiondesigner2.png",
      "/pics/motiondesigner3.png",
    ]);

    expect(getSpecializationPortfolioImages("3D Artist")).toEqual([
      "/pics/3dartist1.png",
      "/pics/3dartist2.png",
      "/pics/3dartist3.png",
    ]);

    expect(getSpecializationPortfolioImages("VFX Artist")).toEqual([
      "/pics/vfx1.png",
      "/pics/vfx2.png",
      "/pics/vfx3.png",
    ]);

    expect(getSpecializationPortfolioImages("Video Editor")).toEqual([
      "/pics/videoeditor1.png",
      "/pics/videoeditor2.png",
      "/pics/videoeditor3.png",
    ]);

    expect(getSpecializationPortfolioImages("Character Animator")).toEqual([
      "/pics/characteranimator1.png",
      "/pics/characteranimator2.png",
      "/pics/characteranimator3.png",
    ]);

    expect(getSpecializationPortfolioImages("Product Animator")).toEqual([
      "/pics/productanimator1.png",
      "/pics/productanimator2.png",
      "/pics/productanimator3.png",
    ]);

    expect(getSpecializationPortfolioImages("CGI Artist")).toEqual([
      "/pics/cgiartist1.png",
      "/pics/cgiartist2.png",
      "/pics/cgiartist3.png",
    ]);

    expect(getSpecializationPortfolioImages("Compositor")).toEqual([
      "/pics/compositor1.png",
      "/pics/compositor2.png",
      "/pics/compositor3.png",
    ]);
  });

  it("resolves portfolio item images correctly with fallback", () => {
    expect(
      resolvePortfolioItemImage(
        { thumbnailUrl: "/pics/vfx1.png", mediaUrl: "/pics/vfx1.png" },
        "VFX Artist",
        0
      )
    ).toBe("/pics/vfx1.png");

    expect(
      resolvePortfolioItemImage(
        { thumbnailUrl: "/media/gradient-1", mediaUrl: "/media/gradient-1" },
        "VFX Artist",
        1
      )
    ).toBe("/pics/vfx2.png");
  });

  it("provides 3 distinct images for creator cards", () => {
    const cardImages = getCreatorCardImages({
      specialization: "Motion Designer",
      portfolioItems: [],
    });
    expect(cardImages).toEqual([
      "/pics/motiondesigner1.png",
      "/pics/motiondesigner2.png",
      "/pics/motiondesigner3.png",
    ]);
  });
});
