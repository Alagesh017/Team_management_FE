import React, { useEffect, useState, useMemo } from "react";
import { DataTable } from "../../../common/components/DataTable";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog";
import { taskStatusService } from "../services/taskStatusService";
import { Button } from "../../../common/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../common/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../common/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown, Plus, Pencil, Trash2, Loader2, Eye } from "lucide-react";
import TaskStatusForm from "../components/TaskStatusForm";
import TaskStatusDetails from "../components/TaskStatusDetails";

const TaskStatusPage = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [viewingStatus, setViewingStatus] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const data = await taskStatusService.getAllTaskStatuses();
      setStatuses(data.task_statuses || []);
    } catch (err) {
      console.error("Failed to fetch task statuses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleEdit = (status) => {
    setEditingStatus(status);
    setIsSheetOpen(true);
  };

  const handleView = (status) => {
    setViewingStatus(status);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (id) => {
    setStatusToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (statusToDelete) {
      try {
        await taskStatusService.deleteTaskStatus(statusToDelete);
        fetchStatuses();
      } catch (err) {
        console.error("Delete failed:", err);
      } finally {
        setIsDeleteDialogOpen(false);
        setStatusToDelete(null);
      }
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      if (editingStatus) {
        await taskStatusService.updateTaskStatus(editingStatus.id, data);
      } else {
        await taskStatusService.createTaskStatus(data);
      }
      
      setIsSheetOpen(false);
      setEditingStatus(null);
      fetchStatuses();
    } catch (err) {
      setError(err.msg || err.error || "Operation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Status Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const name = row.getValue("name");
        return (
          <div className="flex items-center gap-3">
            <div 
              className="h-2 w-2 rounded-full" 
              style={{ backgroundColor: row.original.color || "#000000" }} 
            />
            <span className="font-bold text-slate-900">{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "color",
      header: "Color Code",
      cell: ({ row }) => {
        const color = row.getValue("color") || "#000000";
        return (
          <code className="bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-100 text-[10px] font-mono uppercase font-bold">
            {color}
          </code>
        );
      },
    },
    {
      accessorKey: "sort_order",
      header: "Priority / Order",
      cell: ({ row }) => (
        <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border border-blue-100">
          Order {row.getValue("sort_order")}
        </span>
      ),
    },
    {
      accessorKey: "remark",
      header: "Remark",
      cell: ({ row }) => (
        <span className="text-slate-500 text-xs font-medium truncate max-w-[150px] block">
          {row.getValue("remark") || <span className="text-slate-300 italic">No remark</span>}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: () => (
        <div className="flex items-center gap-1.5 capitalize font-semibold text-emerald-600">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          ACTIVE
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const status = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleView(status)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(status)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(status.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], []);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Task Status Master</h1>
          <p className="text-slate-500">Configure global workflow stages for professional task management.</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) {
            setEditingStatus(null);
            setError("");
          }
        }}>
          <SheetTrigger asChild>
            <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all active:scale-95">
              <Plus className="mr-2 h-4 w-4" /> New Status
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[500px] overflow-y-auto border-l shadow-2xl">
            <SheetHeader className="border-b pb-6">
              <SheetTitle className="text-2xl font-bold">
                {editingStatus ? "Edit Task Status" : "New Task Status"}
              </SheetTitle>
              <SheetDescription>
                Only Status Name is mandatory. All other fields are optional.
              </SheetDescription>
            </SheetHeader>
            
            <TaskStatusForm 
              onSubmit={onSubmit} 
              initialData={editingStatus}
              submitting={submitting}
              error={error}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <DataTable 
          columns={columns} 
          data={statuses} 
          loading={loading}
          searchPlaceholder="Search statuses..."
          searchColumn="name"
        />
      </div>

      <TaskStatusDetails 
        status={viewingStatus} 
        open={isViewDialogOpen} 
        onOpenChange={setIsViewDialogOpen} 
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Task Status?"
        description="This action cannot be undone. This might affect tasks currently using this status."
        variant="destructive"
      />
    </div>
  );
};

export default TaskStatusPage;
