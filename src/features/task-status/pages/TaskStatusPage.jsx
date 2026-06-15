import React, { useEffect, useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import {
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  GripVertical,
} from "lucide-react";
import TaskStatusForm from "../components/TaskStatusForm";
import TaskStatusDetails from "../components/TaskStatusDetails";
import { useToast } from "../../../common/hooks/use-toast";

// Sortable Row Wrapper for DataTable
const SortableRow = ({ children, status, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: status.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease", // Add smooth transition
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 9999 : "auto",
    backgroundColor: isDragging ? "#f8fafc" : "transparent",
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing select-none ${isDragging ? "bg-slate-100 shadow-lg" : "hover:bg-slate-50 transition-colors"}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </tr>
  );
};

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
  const [activeId, setActiveId] = useState(null);
  const { toast } = useToast();

  // DND Sensors - make drag and drop very easy and smooth
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1, // Very low activation distance
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
        toast({
          title: "Success",
          description: "Task status deleted successfully",
          variant: "success",
        });
      } catch (err) {
        console.error("Delete failed:", err);
        toast({
          title: "Error",
          description: err.msg || err.message || "Failed to delete task status",
          variant: "destructive",
        });
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
      console.error("Error submitting:", err);
      setError(err.msg || err.error || "Operation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Drag & Drop Handler
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = statuses.findIndex((s) => s.id === active.id);
      const newIndex = statuses.findIndex((s) => s.id === over.id);

      // Optimistic UI update
      const newStatuses = arrayMove(statuses, oldIndex, newIndex);
      setStatuses(newStatuses);

      // Prepare data for backend (update sort_order based on index)
      const reorderedStatuses = newStatuses.map((status, index) => ({
        id: status.id,
        sort_order: index,
      }));

      try {
        // Call backend to save new order
        await taskStatusService.reorderTaskStatuses(reorderedStatuses);
        toast({
          title: "Success",
          description: "Task statuses reordered successfully",
          variant: "success",
        });
      } catch (err) {
        console.error("Reorder failed:", err);
        // Revert on error
        fetchStatuses();
        toast({
          title: "Error",
          description: "Failed to reorder task statuses",
          variant: "destructive",
        });
      }
    }
    setActiveId(null);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: "Status Name",
      cell: ({ row }) => {
        const status = row.original;
        return (
          <div className="flex items-center gap-3">
            <div
              className="h-3 w-3 rounded-full shadow-sm"
              style={{ backgroundColor: status.color || "#000000" }}
            />
            <span className="font-semibold text-slate-900">{status.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "sort_order",
      header: "Order",
      cell: ({ row }) => {
        const index = statuses.findIndex((s) => s.id === row.original.id);
        return (
          <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded-full border border-slate-200">
            {index + 1}
          </span>
        );
      },
    },
    {
      accessorKey: "remark",
      header: "Remark",
      cell: ({ row }) => {
        const remark = row.getValue("remark");
        return (
          <span className="text-slate-500 text-sm truncate max-w-[200px] block">
            {remark || <span className="italic text-slate-300">No remark</span>}
          </span>
        );
      },
    },
    {
      accessorKey: "is_confidential",
      header: "Confidential",
      cell: ({ row }) => {
        const isConfidential = row.getValue("is_confidential");
        return (
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isConfidential ? "bg-red-500" : "bg-slate-300"
              }`}
            />
            <span
              className={`text-xs font-bold ${
                isConfidential ? "text-red-600" : "text-slate-400"
              }`}
            >
              {isConfidential ? "YES" : "NO"}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const status = row.original;
        // Stop propagation on the dropdown to prevent drag
        const stopDrag = (e) => {
          e.stopPropagation();
        };
        
        return (
          <div onClick={stopDrag}>
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
                <DropdownMenuItem
                  onClick={() => handleDelete(status.id)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [statuses]);

  // Custom table component to wrap DataTable with drag and drop
  const CustomDataTable = () => {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <SortableContext
          items={statuses.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <DataTable
            columns={columns}
            data={statuses}
            filterColumn="name"
            rowComponent={(props) => {
              const status = props.row.original;
              return (
                <SortableRow
                  status={status}
                  index={props.index}
                >
                  {props.children}
                </SortableRow>
              );
            }}
          />
        </SortableContext>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
          {activeId ? (
            <div className="bg-white p-6 rounded-xl shadow-2xl border-2 border-blue-500/30 opacity-100 min-w-[400px]">
              {(() => {
                const status = statuses.find((s) => s.id === activeId);
                const index = statuses.findIndex((s) => s.id === activeId);
                return status ? (
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-4 w-4 rounded-full shadow-md"
                        style={{ backgroundColor: status.color || "#000000" }}
                      />
                      <span className="font-bold text-slate-900 text-lg">
                        {status.name}
                      </span>
                    </div>
                    <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                      #{index + 1}
                    </span>
                  </div>
                ) : null;
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold tracking-tight text-slate-900 truncate">
            Task Status Master
          </h1>
          <p className="text-slate-500 hidden md:block">
            Manage task statuses and drag to reorder
          </p>
        </div>
        <Sheet
          open={isSheetOpen}
          onOpenChange={(open) => {
            setIsSheetOpen(open);
            if (!open) {
              setEditingStatus(null);
              setError("");
            }
          }}
        >
          <SheetTrigger asChild>
            <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all active:scale-95">
              <Plus className="mr-2 h-4 w-4" /> New Status
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[450px] md:max-w-[550px] lg:max-w-[650px] border-l shadow-2xl p-0 flex flex-col">
            <SheetHeader className="border-b pb-6 px-6 pt-6">
              <SheetTitle className="text-2xl font-bold">
                {editingStatus ? "Edit Task Status" : "New Task Status"}
              </SheetTitle>
              <SheetDescription>
                Only Status Name is required. All other fields are optional.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6">
              <TaskStatusForm
                onSubmit={onSubmit}
                initialData={editingStatus}
                submitting={submitting}
                error={error}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <CustomDataTable />
        )}
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
