import { Download } from "lucide-react";
import { Button } from "../../../common/components/ui/button";

export function DesktopUpdateTopBar({ state, onDownload, downloading }) {
  if (state.phase !== "available" && state.phase !== "downloading" && state.phase !== "ready") {
    return null;
  }

  const label =
    state.phase === "available"
      ? `Update available${state.availableVersion ? ` · v${state.availableVersion}` : ""}`
      : state.phase === "ready"
        ? "Update ready — installing…"
        : "Downloading update…";

  return (
    <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-900">
      <span className="font-semibold whitespace-nowrap">{label}</span>
      {state.phase === "available" && (
        <Button
          type="button"
          size="sm"
          className="h-7 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 px-3"
          onClick={onDownload}
          disabled={downloading}
        >
          <Download className="h-3.5 w-3.5" />
          Update
        </Button>
      )}
    </div>
  );
}
