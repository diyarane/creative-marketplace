import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-red-50">
        <ShieldAlert className="size-7 text-red-600" />
      </div>
      <h1 className="mt-6 font-display text-2xl font-semibold text-ink">You do not have permission to access this page</h1>
      <p className="mt-2 text-sm text-muted">
        This area is restricted to a different account role. If you think this is a mistake, try signing in with the right account.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild>
          <Link href="/login">Switch account</Link>
        </Button>
      </div>
    </div>
  );
}
