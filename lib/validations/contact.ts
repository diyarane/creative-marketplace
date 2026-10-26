import { z } from "zod";

export const CONTACT_CATEGORIES = [
  { value: "general", label: "General Enquiry" },
  { value: "client_support", label: "Client Support" },
  { value: "creator_support", label: "Creator Support" },
  { value: "partnerships", label: "Partnerships" },
  { value: "careers", label: "Careers & Talent" },
  { value: "trust_safety", label: "Trust & Safety Concern" },
] as const;

export type ContactCategoryValue = (typeof CONTACT_CATEGORIES)[number]["value"];

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),
  category: z.enum([
    "general",
    "client_support",
    "creator_support",
    "partnerships",
    "careers",
    "trust_safety",
  ]),
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(150, "Subject cannot exceed 150 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(3000, "Message cannot exceed 3,000 characters"),
});

export type ContactInput = z.infer<typeof contactSchema>;
