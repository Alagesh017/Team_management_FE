import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../common/components/ui/dialog";
import { Button } from "../../../common/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../common/components/ui/table";
import { Loader2, AlertTriangle } from "lucide-react";

const StartSprintConfirmDialog = ({
  isOpen,
  onClose,
  currentActiveSprint,
  newSprint,
  tasks,
  onConfirm,
  isLoading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] md:max-w-[1000px] lg:max-w-[1200px] max-h-[95vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-4 pb-3 border-b bg-amber-50 shrink-0">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <div>
              <DialogTitle className="text-lg font-bold text-amber-900">
                Active Sprint Already Running
              </DialogTitle>
              <DialogDescription className="text-amber-700 font-medium text-sm mt-0.5">
                Tasks from <span className="font-semibold">{currentActiveSprint?.sprint_name}</span> will be moved to <span className="font-semibold">{newSprint?.sprint_name}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Sprint Info (compact) */}
        <div className="px-6 py-3 border-b bg-slate-50 shrink-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">From:</span>
              <span className="font-semibold text-red-700">{currentActiveSprint?.sprint_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To:</span>
              <span className="font-semibold text-emerald-700">{newSprint?.sprint_name}</span>
            </div>
          </div>
        </div>

        {/* Tasks Table (priority area) */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 py-3 flex items-center justify-between border-b shrink-0">
            <h3 className="text-lg font-bold text-slate-900">Tasks to Move</h3>
            <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {tasks?.length || 0} task{tasks?.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex-1 overflow-auto px-6 pb-0">
            {tasks?.length === 0 ? (
              <div className="h-full flex items-center justify-center p-12 text-center">
                <div className="bg-slate-50 rounded-lg border border-dashed border-slate-200 p-8">
                  <p className="text-slate-500 font-medium">No non-completed tasks to move</p>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden my-4">
                <Table>
                  <TableHeader className="bg-slate-50 sticky top-0">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-700">Task Title</TableHead>
                      <TableHead className="font-semibold text-slate-700 w-[180px]">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700 w-[120px]">Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-slate-900 py-3">
                          {task.title}
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {task.status_name || "No status"}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.priority === 'high' || task.priority === 'critical' 
                              ? 'bg-red-100 text-red-700' 
                              : task.priority === 'medium' 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-slate-100 text-slate-700'
                          }`}>
                            {task.priority || "N/A"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-slate-50 gap-3 shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="font-medium">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Start New Sprint &amp; Move Tasks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StartSprintConfirmDialog;
