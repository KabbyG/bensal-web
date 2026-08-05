import {
  Sparkles,
  Bug,
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
  type LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  Bug,
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
};

export function getIcon(key: string): LucideIcon {
  return iconMap[key] ?? Sparkles;
}
