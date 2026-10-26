import { describe, it, expect } from "vitest";
import { contactSchema, CONTACT_CATEGORIES } from "@/lib/validations/contact";

describe("contact form validation", () => {
  const validPayload = {
    name: "Maya Lin",
    email: "maya@studio.example",
    category: "client_support",
    subject: "Inquiry regarding 3D motion project",
    message: "We are seeking a 3D artist for our upcoming product launch and would like assistance reviewing proposals.",
  };

  it("accepts a well-formed contact payload", () => {
    const res = contactSchema.safeParse(validPayload);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.name).toBe("Maya Lin");
      expect(res.data.category).toBe("client_support");
    }
  });

  it("supports all declared contact categories", () => {
    for (const cat of CONTACT_CATEGORIES) {
      const res = contactSchema.safeParse({
        ...validPayload,
        category: cat.value,
      });
      expect(res.success).toBe(true);
    }
  });

  it("rejects invalid categories", () => {
    const res = contactSchema.safeParse({
      ...validPayload,
      category: "unsupported_category",
    });
    expect(res.success).toBe(false);
  });

  it("rejects malformed emails", () => {
    const res = contactSchema.safeParse({
      ...validPayload,
      email: "not-an-email",
    });
    expect(res.success).toBe(false);
  });

  it("rejects too-short names or subjects or messages", () => {
    expect(contactSchema.safeParse({ ...validPayload, name: "A" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validPayload, subject: "No" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validPayload, message: "Too short" }).success).toBe(false);
  });
});
