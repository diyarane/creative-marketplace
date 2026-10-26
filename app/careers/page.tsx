import type { Metadata } from "next";
import { CareersView } from "./careers-view";

export const metadata: Metadata = {
  title: "Careers — Reelcraft",
  description:
    "Explore career philosophy, engineering culture, and future opportunities at Reelcraft, where we build tools and platforms for world-class motion designers and 3D artists.",
};

export default function CareersPage() {
  return <CareersView />;
}
