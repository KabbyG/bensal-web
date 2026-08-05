import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportButtons({ entity }: { entity: string }) {
  return (
    <div className="flex gap-2">
      {(["csv", "xlsx", "pdf"] as const).map((format) => (
        <Button key={format} asChild variant="outline" size="sm">
          <a href={`/api/admin/export?entity=${entity}&format=${format}`}>
            <Download className="h-3.5 w-3.5" /> {format.toUpperCase()}
          </a>
        </Button>
      ))}
    </div>
  );
}
