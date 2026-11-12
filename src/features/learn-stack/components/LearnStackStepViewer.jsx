import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Button } from "../../../common/components/ui/button";
import { getFullAvatarUrl } from "../../../core/utils/utils";

export default function LearnStackStepViewer({ steps = [] }) {
  const [index, setIndex] = useState(0);
  const total = steps.length;

  useEffect(() => {
    setIndex(0);
  }, [steps]);

  if (!total) return null;

  const step = steps[index];
  const atStart = index === 0;
  const atEnd = index === total - 1;

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-slate-900">Steps</h2>
        <span className="text-xs font-medium text-slate-500">
          Step {index + 1} of {total}
        </span>
      </div>

      <div className="flex gap-1 border-b border-slate-100 px-4 py-2">
        {steps.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i === index ? "bg-violet-600" : i < index ? "bg-violet-300" : "bg-slate-200"
            }`}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>

      <div className="px-4 py-4">
        <div className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
            {step.body && (
              <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">{step.body}</p>
            )}
            <div className="flex flex-wrap items-start gap-3 pt-1">
              {step.image_url && (
                <img
                  src={getFullAvatarUrl(step.image_url)}
                  alt=""
                  className="max-h-52 w-full max-w-md rounded-md border border-slate-200 object-cover"
                />
              )}
              {step.document_url && (
                <a
                  href={getFullAvatarUrl(step.document_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:underline"
                >
                  <FileText className="h-3.5 w-3.5" /> Open attachment
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          disabled={atStart}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          size="sm"
          className={`h-8 gap-1 ${atEnd ? "bg-slate-700 hover:bg-slate-800" : "bg-violet-600 hover:bg-violet-700"}`}
          disabled={atEnd}
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
