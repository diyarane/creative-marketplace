import { db } from "@/lib/db";
import { projectFiles } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireUser } from "@/lib/auth/guards";
import { assertProjectAccess } from "@/lib/services/project-access";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const uploadSchema = z.object({
  fileName: z.string().trim().min(1).max(200),
  fileType: z.string().trim().min(1).max(40),
  fileSize: z.coerce.number().int().min(1).max(50_000_000),
  kind: z.enum(["REFERENCE", "SUBMISSION"]),
  note: z.string().trim().max(1000).default(""),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireUser();
    const { id } = await params;
    await assertProjectAccess(id, session.userId, session.role);

    return db.query.projectFiles.findMany({
      where: eq(projectFiles.projectId, id),
      with: { uploader: true },
      orderBy: [desc(projectFiles.createdAt)],
    });
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireUser();
    const { id } = await params;
    const project = await assertProjectAccess(id, session.userId, session.role);
    const body = uploadSchema.parse(await req.json());

    if (body.kind === "REFERENCE" && session.userId !== project.clientId) {
      throw new AppError("Only the client can upload reference files.", 403);
    }
    if (body.kind === "SUBMISSION" && session.userId !== project.creator?.userId) {
      throw new AppError("Only the assigned creator can upload work submissions.", 403);
    }

    // Local/mock storage: we don't persist real bytes, only realistic metadata,
    // so no cloud credentials are required. Swap this for a real object-storage
    // write (S3, R2...) later while keeping the same ProjectFile record shape.
    const [file] = await db
      .insert(projectFiles)
      .values({
        projectId: id,
        uploadedBy: session.userId,
        fileName: body.fileName,
        fileUrl: `/mock-storage/${id}/${encodeURIComponent(body.fileName)}`,
        fileType: body.fileType,
        fileSize: body.fileSize,
        kind: body.kind,
        note: body.note,
      })
      .returning();

    return file;
  });
}
