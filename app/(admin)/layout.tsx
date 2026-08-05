import { SessionProvider } from "@/components/session-provider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-surface-muted">{children}</div>
    </SessionProvider>
  );
}
