import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { cn } from "@/lib/utils";

const SOCIAL_ICONS: Record<string, typeof FaFacebookF> = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  twitter: FaXTwitter,
};

export function SocialLinks({
  socials,
  variant = "dark",
  className,
}: {
  socials: Record<string, string> | null | undefined;
  variant?: "dark" | "light";
  className?: string;
}) {
  const active = Object.entries(socials ?? {}).filter(([, url]) => Boolean(url));
  if (active.length === 0) return null;

  return (
    <div className={cn("flex gap-3", className)}>
      {active.map(([key, url]) => {
        const Icon = SOCIAL_ICONS[key];
        if (!Icon) return null;
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
              variant === "dark"
                ? "bg-white/10 hover:bg-accent"
                : "bg-surface-muted text-foreground hover:bg-accent hover:text-white"
            )}
            aria-label={key}
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}
