import type { Metadata } from "next";
import { AboutView } from "./about-view";

export const metadata: Metadata = {
  title: "About Reelcraft — The Creative Marketplace for Motion & Visual Craft",
  description:
    "Learn about Reelcraft's mission to connect visionary clients with world-class animators, 3D artists, VFX specialists, and video editors through structured, high-trust production workflows.",
};

export default function AboutPage() {
  return <AboutView />;
}
