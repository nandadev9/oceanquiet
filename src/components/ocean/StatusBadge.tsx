import { STATUS_META } from "@/lib/ocean/constants";
import type { TaskStatus } from "@/lib/ocean/types";

export default function StatusBadge({ status }: { status: TaskStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
