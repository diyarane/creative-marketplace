import { db } from "@/lib/db";
import { platformSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const DEFAULT_SETTINGS = {
  platformFeeRate: "0.10",
  allowRegistrations: "true",
  platformName: "Reelcraft",
};
export type SettingKey = keyof typeof DEFAULT_SETTINGS;

export async function getSettings(): Promise<Record<SettingKey, string>> {
  const rows = await db.select().from(platformSettings);
  const out: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const r of rows) out[r.key] = r.value;
  return out as Record<SettingKey, string>;
}

export async function setSetting(key: SettingKey, value: string) {
  const existing = await db.query.platformSettings.findFirst({ where: eq(platformSettings.key, key) });
  if (existing) await db.update(platformSettings).set({ value }).where(eq(platformSettings.key, key));
  else await db.insert(platformSettings).values({ key, value });
}
