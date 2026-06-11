import React from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "../../../../common/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../common/components/ui/dialog";

const DeleteTaskDialog = ({ open, onOpenChange, taskToDelete, isSaving, onConfirm, onCancel }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm rounded-2xl p-0 overflow-hidden gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <DialogTitle className="text-lg font-semibold text-slate-800">Delete Task</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-800">{taskToDelete?.title}</span>? This action
            cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isSaving}
            className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            ) : (
              <Trash2 className="h-3.5 w-3.5 mr-1" />
            )}
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTaskDialog;