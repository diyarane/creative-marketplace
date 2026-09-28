import { z } from "zod";

export const creatorProfileSchema = z.object({
  headline: z.string().trim().min(5).max(100),
  bio: z.string().trim().min(30).max(2000),
  specialization: z.string().trim().min(1),
  location: z.string().trim().min(1),
  experience: z.coerce.number().int().min(0).max(60),
  hourlyRate: z.coerce.number().positive(),
  availability: z.enum(["AVAILABLE", "BUSY", "UNAVAILABLE"]),
});

export const serviceSchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(20).max(2000),
  category: z.string().trim().min(1),
  price: z.coerce.number().positive(),
  deliveryDays: z.coerce.number().int().positive(),
  revisionsIncluded: z.coerce.number().int().min(0).max(20),
});

export const portfolioItemSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(1000),
  category: z.string().trim().min(1),
  mediaType: z.enum(["IMAGE", "VIDEO"]),
  gradient: z.string().trim().min(1),
});

export const messageSchema = z.object({
  receiverId: z.string().trim().min(1),
  projectId: z.string().trim().optional(),
  content: z.string().trim().min(1).max(4000),
});
