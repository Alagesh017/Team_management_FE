import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../core/utils/utils";

/** Standard list/master page shell — tight spacing aligned with MainLayout padding. */
export function ListPageShell({ title, description, action, children, className }) {
  return (
    <div className={cn("flex min-h-0 flex-col gap-3", className)}>
      <div className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          {title ? (
            typeof title === "string" ? (
              <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 md:text-2xl">
                {title}
              </h1>
            ) : (
              title
            )
          ) : null}
          {description ? (
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}

/** White card wrapper for embedded DataTable. */
export function DataTableCard({ children, loading, className, loadingClassName }) {
  return (
    <div
      className={cn(
        "min-h-0 rounded-xl border border-slate-200 bg-white shadow-sm",
        className
      )}
    >
      {loading ? (
        <div
          className={cn(
            "flex h-52 items-center justify-center",
            loadingClassName
          )}
        >
          <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

/** Generic page shell for non-table views (dashboard, reports, etc.). */
export function PageShell({ title, description, action, children, className }) {
  return (
    <ListPageShell
      title={title}
      description={description}
      action={action}
      className={className}
    >
      {children}
    </ListPageShell>
  );
}
