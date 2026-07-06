import React, { useEffect, useState, useMemo } from "react";
import { DataTable } from "../../../common/components/DataTable";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog";
import { attendanceStatusService } from "../services/attendanceStatusService";
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
} from "lucide-react";
import AttendanceStatusForm from "../components/AttendanceStatusForm";
import AttendanceStatusDetails from "../components/AttendanceStatusDetails";
import { useToast } from "../../../common/hooks/use-toast";

const AttendanceStatusPage = () => {
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
      const data = await attendanceStatusService.getAllAttendanceStatuses();
      setStatuses(data.attendance_statuses || []);
    } catch (err) {
      console.error("Failed to fetch attendance statuses:", err);
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
        await attendanceStatusService.deleteAttendanceStatus(statusToDelete);
        fetchStatuses();
        toast({
          title: "Success",
          description: "Attendance status deleted successfully",
          variant: "success",
        });
      } catch (err) {
        console.error("Delete failed:", err);
        toast({
          title: "Error",
          description: err.msg || err.message || "Failed to delete attendance status",
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
        await attendanceStatusService.updateAttendanceStatus(editingStatus.attendance_status_id, data);
      } else {
        await attendanceStatusService.createAttendanceStatus(data);
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

  const columns = useMemo(
    () => [
      {
        accessorKey: "status_name",
        header: "Status Name",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-900">{row.original.status_name}</span>
        ),
      },
      {
        accessorKey: "status_code",
        header: "Status Code",
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded-full border border-slate-200">
            {row.original.status_code}
          </span>
        ),
      },
      {
        accessorKey: "is_present",
        header: "Is Present",
        cell: ({ row }) => {
          const isPresent = row.getValue("is_present");
          return (
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${isPresent ? 'bg-green-500' : 'bg-slate-300'}`} />
              <span className={`text-xs font-bold ${isPresent ? 'text-green-700' : 'text-slate-400'}`}>
                {isPresent ? "Yes" : "No"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "is_absent",
        header: "Is Absent",
        cell: ({ row }) => {
          const isAbsent = row.getValue("is_absent");
          return (
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${isAbsent ? 'bg-red-500' : 'bg-slate-300'}`} />
              <span className={`text-xs font-bold ${isAbsent ? 'text-red-700' : 'text-slate-400'}`}>
                {isAbsent ? "Yes" : "No"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: "Is Active",
        cell: ({ row }) => {
          const isActive = row.getValue("is_active");
          return (
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span className={`text-xs font-bold ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                {isActive ? "Yes" : "No"}
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
                  onClick={() => handleDelete(status.attendance_status_id)}
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
    []
  );

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold tracking-tight text-slate-900 truncate">
            Attendance Status Master
          </h1>
          <p className="text-slate-500 hidden md:block">
            Manage attendance statuses for your organization
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
                {editingStatus ? "Edit Attendance Status" : "New Attendance Status"}
              </SheetTitle>
              <SheetDescription>
                Only Status Name and Status Code are required
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6">
              <AttendanceStatusForm
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
          <DataTable columns={columns} data={statuses} filterColumn="status_name" />
        )}
      </div>

      <AttendanceStatusDetails
        status={viewingStatus}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Attendance Status?"
        description="This action cannot be undone. This might affect attendance records using this status."
        variant="destructive"
      />
    </div>
  );
};

export default AttendanceStatusPage;
