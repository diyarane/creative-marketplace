"use client";
import * as React from "react";
import { apiFetch } from "@/lib/fetcher";
import type { ProjectDTO, ProjectFileDTO, RevisionDTO } from "@/types";

export function useProject(id: string) {
  const [project, setProject] = React.useState<ProjectDTO | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<ProjectDTO>(`/api/projects/${id}`);
      setProject(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  return { project, loading, error, reload };
}

export function useProjectFiles(id: string) {
  const [files, setFiles] = React.useState<ProjectFileDTO[] | null>(null);
  const reload = React.useCallback(async () => {
    const data = await apiFetch<ProjectFileDTO[]>(`/api/projects/${id}/files`);
    setFiles(data);
  }, [id]);
  React.useEffect(() => {
    reload();
  }, [reload]);
  return { files, reload };
}

export function useProjectRevisions(id: string) {
  const [revisions, setRevisions] = React.useState<RevisionDTO[] | null>(null);
  const reload = React.useCallback(async () => {
    const data = await apiFetch<RevisionDTO[]>(`/api/projects/${id}/revisions`);
    setRevisions(data);
  }, [id]);
  React.useEffect(() => {
    reload();
  }, [reload]);
  return { revisions, reload };
}
