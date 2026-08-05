"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      toast.error("Invalid email or password.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-gradient px-6">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl dark:bg-card">
        <div className="flex justify-center">
          <Image src="/brand/logo.png" alt="Bensal Investment Co. Ltd." width={160} height={38} className="h-9 w-auto" />
        </div>
        <h1 className="mt-6 text-center font-display text-xl font-semibold">Admin Sign In</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Sign in to manage your website content.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="username" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <Button type="submit" variant="accent" className="w-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
