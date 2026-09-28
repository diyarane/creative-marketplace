import { z } from "zod";

export const createProjectSchema = z
  .object({
    title: z.string().trim().min(5, "Title must be at least 5 characters").max(120),
    category: z.string().trim().min(1, "Select a category"),
    description: z.string().trim().min(30, "Description must be at least 30 characters"),
    requirements: z.string().trim().min(10, "Add at least a few requirements"),
    budgetMin: z.coerce.number().positive("Minimum budget must be greater than 0"),
    budgetMax: z.coerce.number().positive("Maximum budget must be greater than 0"),
    deadline: z.coerce.date().refine((d) => d.getTime() > Date.now(), {
      message: "Deadline must be in the future",
    }),
    publish: z.boolean().default(false),
  })
  .refine((data) => data.budgetMax >= data.budgetMin, {
    message: "Maximum budget must be greater than or equal to minimum budget",
    path: ["budgetMax"],
  });
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const createProposalSchema = z.object({
  price: z.coerce.number().positive("Price must be greater than 0"),
  deliveryDays: z.coerce.number().int().positive("Delivery time must be at least 1 day"),
  message: z.string().trim().min(20, "Message must be at least 20 characters"),
  revisionsIncluded: z.coerce.number().int().min(0).max(20),
});
export type CreateProposalInput = z.infer<typeof createProposalSchema>;

export const revisionRequestSchema = z.object({
  description: z.string().trim().min(10, "Describe what needs to change"),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(10, "Comment must be at least 10 characters").max(1000),
});

export const submitWorkSchema = z.object({
  fileName: z.string().trim().min(1),
  note: z.string().trim().max(1000).default(""),
});
