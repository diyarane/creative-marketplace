"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAV_LINKS_CLIENT, NAV_LINKS_CREATOR, NAV_LINKS_ADMIN } from "@/lib/constants";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { LogOut, LayoutDashboard, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = user?.role === "ADMIN" ? NAV_LINKS_ADMIN : user?.role === "CREATOR" ? NAV_LINKS_CREATOR : user?.role === "CLIENT" ? NAV_LINKS_CLIENT : [];

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink/8 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-ink">
          <span className="flex size-8 items-center justify-center rounded-lg bg-ink text-paper text-sm font-bold">R</span>
          Reelcraft
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {(links.length ? links : [{ href: "/explore", label: "Explore" }, { href: "/#how-it-works", label: "How it works" }, { href: "/subscription", label: "Pricing" }]).map(
            (link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink",
                  pathname === link.href && "bg-ink/6 text-ink"
                )}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          {!loading && user && (
            <>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/30">
                  <Avatar name={user.name} gradient={user.avatar} size="sm" />
                  <span className="hidden text-sm font-medium sm:block">{user.name.split(" ")[0]}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={user.role === "ADMIN" ? "/admin" : user.role === "CREATOR" ? "/dashboard/creator" : "/dashboard/client"}>
                      <LayoutDashboard className="size-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "CREATOR" && (
                    <DropdownMenuItem asChild>
                      <Link href="/creator/profile">
                        <User className="size-4" /> My Profile
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout} className="text-red-600">
                    <LogOut className="size-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          {!loading && !user && (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button variant="primary" size="sm" asChild>
                <Link href="/register">Get started</Link>
              </Button>
            </div>
          )}
          <button
            className="rounded-full p-2 hover:bg-ink/5 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-ink/8 bg-paper px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {(links.length ? links : [{ href: "/explore", label: "Explore" }, { href: "/subscription", label: "Pricing" }]).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-ink/5"
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="mt-2 flex flex-col gap-2 border-t border-ink/8 pt-3">
                <Button variant="outline" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button variant="primary" asChild>
                  <Link href="/register">Get started</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
