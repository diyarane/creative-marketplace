import type { Metadata } from "next";
import { ContactView } from "./contact-view";

export const metadata: Metadata = {
  title: "Contact Us — Reelcraft",
  description:
    "Get in touch with the Reelcraft team for client support, creator portfolio assistance, platform safety escalations, or business inquiries.",
};

export default function ContactPage() {
  return <ContactView />;
}
