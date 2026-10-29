import React from "react";
import { Loader2, Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { cn } from "../../core/utils/utils";

export function FormSheet({
  open,
  onOpenChange,
  trigger,
  icon: Icon,
  iconClassName,
  title,
  description,
  children,
  footer,
  contentClassName,
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
      <SheetContent
        className={cn(
          "w-full sm:max-w-[520px] border-l border-slate-200/80 p-0 flex flex-col bg-[#f4f7fb] shadow-2xl gap-0",
          contentClassName
        )}
      >
        <div className="shrink-0 border-b border-slate-200/80 bg-white px-6 pb-5 pt-6 pr-14">
          <div className="flex items-start gap-4">
            {Icon ? (
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100",
                  iconClassName
                )}
              >
                <Icon className="h-5 w-5 text-emerald-600" strokeWidth={2.25} />
              </div>
            ) : null}
            <div className="min-w-0 space-y-1.5 pt-0.5">
              <SheetTitle className="text-left text-xl font-bold tracking-tight text-[#0f2744]">
                {title}
              </SheetTitle>
              {description ? (
                <SheetDescription className="text-left text-sm font-medium leading-snug text-[#5b7c99]">
                  {description}
                </SheetDescription>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">{children}</div>

        {footer}
      </SheetContent>
    </Sheet>
  );
}

export function FormSheetBody({ className, children }) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-6 py-6", className)}>{children}</div>
  );
}

export function FormSheetSection({ icon: Icon, title, children, className }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#dbeafe]/90 bg-white p-5 shadow-[0_1px_3px_rgba(15,39,68,0.06)]",
        className
      )}
    >
      <div className="mb-5 flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-[#1e4976]" strokeWidth={2.25} /> : null}
        <h3 className="text-sm font-bold text-[#0f2744]">{title}</h3>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

export function FormSheetFooter({ className, children }) {
  return (
    <div
      className={cn(
        "flex shrink-0 justify-end gap-3 border-t border-slate-200/80 bg-white px-6 py-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export const FormSheetField = ({ label, required, error, children, className }) => (
  <div className={cn("space-y-2", className)}>
    {label ? (
      <label className="flex items-center gap-0.5 text-sm font-semibold text-[#0f2744]">
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </label>
    ) : null}
    {children}
    {error ? <p className="text-xs font-medium text-red-500">{error}</p> : null}
  </div>
);

export function FormSheetActions({
  submitting,
  submitLabel,
  editSubmitLabel,
  isEdit,
  submitIcon: SubmitIcon,
}) {
  const Icon = SubmitIcon || Plus;
  const label = isEdit ? editSubmitLabel : submitLabel;

  return (
    <>
      <SheetClose asChild>
        <Button
          type="button"
          variant="ghost"
          className="font-semibold text-[#5b7c99] hover:bg-slate-100 hover:text-[#0f2744]"
        >
          Cancel
        </Button>
      </SheetClose>
      <Button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-[#3b82f6] px-5 font-semibold text-white shadow-md hover:bg-[#2563eb]"
      >
        {submitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icon className="mr-2 h-4 w-4" />
        )}
        {label}
      </Button>
    </>
  );
}
