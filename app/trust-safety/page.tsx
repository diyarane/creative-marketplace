import type { Metadata } from "next";
import { TrustSafetyView } from "./trust-safety-view";

export const metadata: Metadata = {
  title: "Trust & Safety — Reelcraft",
  description:
    "Learn how Reelcraft supports safe, transparent collaboration between clients and creators through clear scoping, documented agreements, and direct support.",
};

export default function TrustSafetyPage() {
  return <TrustSafetyView />;
}
