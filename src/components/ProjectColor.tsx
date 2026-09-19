import { COLOR_HEX } from "@/lib/constants";
import { cn } from "@/utils";

export default function ProjectKey({
  projectKey, color, size = "md", className,
}: {
  projectKey: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const bg = COLOR_HEX[color] ?? COLOR_HEX.blue;
  const dims = size === "lg" ? { width: 58, height: 58, fontSize: 15, borderRadius: 18 }
    : size === "sm" ? { width: 30, height: 30, fontSize: 10, borderRadius: 9 }
    : { width: 42, height: 42, fontSize: 12, borderRadius: 13 };
  return (
    <span
      className={cn("proj-key", className)}
      style={{ ...dims, background: `linear-gradient(135deg, ${bg}, ${bg}cc)` }}
    >
      {projectKey}
    </span>
  );
}
