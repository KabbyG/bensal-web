import { cn } from "@/lib/utils";
import {
  Sparkles,
  Bug,
  BugOff,
  Cpu,
  Building2,
  Shield,
  Truck,
  Wrench,
  Leaf,
  HeartHandshake,
  Briefcase,
  Home,
  Users,
  Globe,
  Zap,
  SprayCan,
  type LucideIcon,
} from "lucide-react";

// Bootstrap Icons "bricks" glyph — lucide has no building-materials icon, so
// this is wrapped to match LucideIcon's className/currentColor contract.
function Bricks({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
    >
      <path d="M0 .5A.5.5 0 0 1 .5 0h15a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H14v2h1.5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H14v2h1.5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H.5a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5H2v-2H.5a.5.5 0 0 1-.5-.5v-3A.5.5 0 0 1 .5 6H2V4H.5a.5.5 0 0 1-.5-.5zM3 4v2h4.5V4zm5.5 0v2H13V4zM3 10v2h4.5v-2zm5.5 0v2H13v-2zM1 1v2h3.5V1zm4.5 0v2h5V1zm6 0v2H15V1zM1 7v2h3.5V7zm4.5 0v2h5V7zm6 0v2H15V7zM1 13v2h3.5v-2zm4.5 0v2h5v-2zm6 0v2H15v-2z" />
    </svg>
  );
}

export const iconMap: Record<string, LucideIcon | typeof Bricks> = {
  Sparkles,
  Bug,
  BugOff,
  Cpu,
  Building2,
  Bricks,
  Shield,
  Truck,
  Wrench,
  Leaf,
  HeartHandshake,
  Briefcase,
  Home,
  Users,
  Globe,
  Zap,
  SprayCan,
};

export function getIcon(key: string): LucideIcon | typeof Bricks {
  return iconMap[key] ?? Sparkles;
}

/**
 * Renders a service's icon, preferring an admin-uploaded custom image over
 * the stock Lucide glyph when one is set. The custom image is drawn as a
 * CSS mask filled with `currentColor` (not an <img>) so it automatically
 * inherits whatever accent color and sizing the caller's wrapper applies —
 * the same "just works" behavior the Lucide icons get for free from
 * `currentColor` — regardless of the uploaded file's own colors, as long
 * as it has a transparent background (SVG or PNG).
 */
export function ServiceIcon({
  icon,
  customIconUrl,
  className,
}: {
  icon: string;
  customIconUrl?: string | null;
  className?: string;
}) {
  if (customIconUrl) {
    return (
      <span
        aria-hidden
        className={cn("inline-block shrink-0 bg-current", className)}
        style={{
          WebkitMaskImage: `url(${customIconUrl})`,
          maskImage: `url(${customIconUrl})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
    );
  }

  const Icon = getIcon(icon);
  return <Icon className={className} />;
}
