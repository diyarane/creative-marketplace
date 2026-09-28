"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/fetcher";
import type { CreatorProfileDTO } from "@/types";

export function HireCta({ creator }: { creator: CreatorProfileDTO }) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  async function handleMessage() {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      await apiFetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({ receiverId: creator.userId, content: `Hi ${creator.user.name.split(" ")[0]}, I'd love to talk about a potential project.` }),
      });
      toast({ variant: "success", title: "Message sent" });
      router.push(`/messages?with=${creator.userId}`);
    } catch {
      toast({ variant: "error", title: "Could not send message" });
    }
  }

  return (
    <Card className="border-ink/10 shadow-sm">
      <CardContent className="space-y-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Starting at</p>
          <p className="mt-1 text-3xl font-semibold text-ink">${creator.hourlyRate}/hr</p>
        </div>
        {user?.role !== "CREATOR" && user?.role !== "ADMIN" ? (
          <Button asChild className="w-full" size="lg">
            <Link href={`/project/new?creatorId=${creator.id}`}>Start a project</Link>
          </Button>
        ) : (
          <Button className="w-full" size="lg" disabled>
            Sign in as a client to hire
          </Button>
        )}
        <Button variant="outline" className="w-full" onClick={handleMessage}>
          <MessageCircle className="size-4" /> Message {creator.user.name.split(" ")[0]}
        </Button>
        <div className="space-y-2 border-t border-ink/8 pt-4 text-sm text-ink/70">
          <div className="flex justify-between">
            <span>Response time</span>
            <span className="font-medium text-ink">Usually within a day</span>
          </div>
          <div className="flex justify-between">
            <span>Experience</span>
            <span className="font-medium text-ink">{creator.experience} years</span>
          </div>
          <div className="flex justify-between">
            <span>Location</span>
            <span className="font-medium text-ink">{creator.location}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
