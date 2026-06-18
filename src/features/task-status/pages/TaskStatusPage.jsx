import React, { useEffect, useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
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

/**
 * DraggableRow
 *
 * @hello-pangea/dnd gives us a `provided` object per Draggable item with:
 *   - provided.innerRef / provided.draggableProps -> goes on the row itself
 *   - provided.dragHandleProps -> goes ONLY on whatever you want to be
 *     the grip; everything else in the row stays a normal, unaffected
 *     click target.
 *
 * Same principle as before: only the grip button gets the drag
 * handle props. The <tr> itself never gets drag listeners, so clicks
 * on the dropdown, text, badges, etc. are always plain clicks —
 * never racing against a drag gesture.
 *
 * snapshot.isDragging is this library's equivalent of dnd-kit's
 * isDragging — it's true for exactly the row currently being
 * dragged, and is what drives the "picked up" visual state.
 */
const DraggableRow = ({ children, id, index }) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <tr
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            // @hello-pangea/dnd positions the dragged row with inline
            // transforms already; we only add visual extras on top.
            zIndex: snapshot.isDragging ? 50 : "auto",
          }}
          className={`select-none ${
            snapshot.isDragging
              ? "bg-blue-50 shadow-lg ring-2 ring-blue-400 ring-inset"
              : "hover:bg-slate-50 transition-colors"
          }`}
        >
          <td className="w-10 px-2 align-middle">
            <button
              type="button"
              aria-label="Drag to reorder"
              aria-pressed={snapshot.isDragging}
              {...provided.dragHandleProps}
              onClick={(e) => e.preventDefault()}
              className={`flex h-8 w-8 items-center justify-center rounded-md touch-none transition-all duration-150 ${
                snapshot.isDragging
                  ? "scale-110 bg-blue-100 text-blue-600 ring-2 ring-blue-400 shadow-md cursor-grabbing"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-grab active:scale-110 active:bg-blue-100 active:text-blue-600 active:cursor-grabbing"
              }`}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          </td>
          {children}
        </tr>
      )}
    </Draggable>
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
  const { toast } = useToast();

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
  // @hello-pangea/dnd's onDragEnd gives `source`/`destination` *indices*
  // directly — no need to look up ids and compute indices ourselves like
  // dnd-kit required. `destination` is null if the item was dropped
  // outside any valid droppable area (e.g. dragged off the table), so we
  // guard against that.
  const handleDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination || source.index === destination.index) {
      return;
    }

    // Optimistic UI update — simple splice-based reorder
    const previousStatuses = statuses;
    const newStatuses = Array.from(statuses);
    const [moved] = newStatuses.splice(source.index, 1);
    newStatuses.splice(destination.index, 0, moved);
    setStatuses(newStatuses);

    // Prepare data for backend (update sort_order based on index)
    const reorderedStatuses = newStatuses.map((status, index) => ({
      id: status.id,
      sort_order: index,
    }));

    try {
      await taskStatusService.reorderTaskStatuses(reorderedStatuses);
      toast({
        title: "Success",
        description: "Task statuses reordered successfully",
        variant: "success",
      });
    } catch (err) {
      console.error("Reorder failed:", err);
      // Revert on error instead of refetching, so the UI doesn't flash
      // back to a stale state while the network request is in flight.
      setStatuses(previousStatuses);
      toast({
        title: "Error",
        description: "Failed to reorder task statuses",
        variant: "destructive",
      });
    }
  };

  const columns = useMemo(
    () => [
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
                <DropdownMenuItem
                  onClick={() => handleDelete(status.id)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [statuses]
  );

  // Custom table component to wrap DataTable with drag and drop.
  // Note: this is defined inside the parent render, but does not need to
  // be — pulling it to module scope would be a further improvement, since
  // redefining a component function on every render can cause React to
  // remount internals unnecessarily. Left inline here to keep the diff
  // minimal and focused on the actual DnD bug.
  const CustomDataTable = () => {
    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="task-statuses">
          {(droppableProvided) => (
            <DataTable
              columns={columns}
              data={statuses}
              filterColumn="name"
              // tbodyRef/tbodyProps (added to DataTable.jsx) let us attach
              // the Droppable's ref and droppableProps directly to the
              // real <tbody> DOM node, which @hello-pangea/dnd requires
              // for measuring drop targets correctly.
              tbodyRef={droppableProvided.innerRef}
              tbodyProps={droppableProvided.droppableProps}
              rowComponent={(props) => {
                const status = props.row.original;
                return (
                  <DraggableRow id={String(status.id)} index={props.index}>
                    {props.children}
                  </DraggableRow>
                );
              }}
            />
          )}
        </Droppable>
      </DragDropContext>
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