import React, { useState } from "react";
import { useToast } from "../../../common/hooks/use-toast";
import { clearDesktopAppData } from "../desktopAppData";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../common/components/ui/alert-dialog";

export function DesktopClearCacheDialog({ open, onOpenChange }) {
  const { toast } = useToast();
  const [clearing, setClearing] = useState(false);

  const handleConfirm = async () => {
    setClearing(true);
    try {
      const result = await clearDesktopAppData();
      if (result?.ok === false && result?.error) {
        toast({
          title: "Could not clear data",
          description: result.error,
          variant: "destructive",
        });
        setClearing(false);
        onOpenChange(false);
      }
    } catch (e) {
      toast({
        title: "Could not clear data",
        description: e?.message || "Try again",
        variant: "destructive",
      });
      setClearing(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear cache & cookies?</AlertDialogTitle>
          <AlertDialogDescription>
            This clears stored cache, cookies, and login data for Dce task manager, then reloads the app
            like a fresh start. You will need to sign in again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={clearing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={clearing}
            className="bg-amber-600 hover:bg-amber-700"
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
          >
            {clearing ? "Clearing…" : "Clear and reload"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
