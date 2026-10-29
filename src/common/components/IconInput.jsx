import React from "react";
import { cn } from "../../core/utils/utils";

export const IconInput = React.forwardRef(
  ({ icon: Icon, className, inputClassName, ...props }, ref) => (
    <div
      className={cn(
        "flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/15",
        className
      )}
    >
      <div className="flex w-11 shrink-0 items-center justify-center border-r border-slate-200 bg-[#f8fafc]">
        {Icon ? <Icon className="h-4 w-4 text-slate-400" strokeWidth={2} /> : null}
      </div>
      <input
        ref={ref}
        className={cn(
          "h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50",
          inputClassName
        )}
        {...props}
      />
    </div>
  )
);

IconInput.displayName = "IconInput";
