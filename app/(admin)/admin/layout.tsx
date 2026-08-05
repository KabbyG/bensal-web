import type { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getCompany } from "@/lib/queries";
import { AdminSidebar, AdminMobileNav } from "@/components/admin/sidebar";
import { SignOutButton } from "@/components/admin/sign-out-button";

export default async function AdminAreaLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const company = await getCompany();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar companyName={company.name} />
      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <AdminMobileNav companyName={company.name} />
            <p className="hidden text-sm text-muted-foreground sm:block">
              Signed in as {session.user?.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-accent"
            >
              View site
            </Link>
            <SignOutButton />
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
