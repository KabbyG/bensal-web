import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-gradient px-6 text-center text-white">
      <Image src="/brand/icon.png" alt="Bensal Investment Co. Ltd." width={96} height={96} className="h-20 w-20" />
      <h1 className="mt-8 font-display text-6xl font-extrabold text-accent">404</h1>
      <p className="mt-3 text-xl font-semibold">Page not found</p>
      <p className="mt-2 max-w-sm text-white/70">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Button asChild variant="accent" size="lg" className="mt-8">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </Button>
    </div>
  );
}
