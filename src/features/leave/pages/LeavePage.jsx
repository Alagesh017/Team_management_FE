import React, { useEffect, useState, useMemo } from "react";
import { DataTable } from "../../../common/components/DataTable";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog";
import { leaveService } from "../services/leaveService";
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
import { MoreHorizontal, Plus, Eye, CheckCircle2, XCircle, Loader2, Calendar, Clock, Trash2, Clock3 } from "lucide-react";
import LeaveForm from "../components/LeaveForm";
import LeaveDetails from "../components/LeaveDetails";
import { getFullAvatarUrl, formatDate } from "../../../core/utils/utils";
import { useToast } from "../../../common/hooks/use-toast";
import { useAuth } from "../../auth/contexts/AuthContext";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../common/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../../../common/components/ui/card";

const UserAvatar = ({ url, email, firstName, className = "h-10 w-10" }) => {
  const fullUrl = getFullAvatarUrl(url);
  if (fullUrl) {
    return (
      <img 
        src={fullUrl}
        alt="Avatar" 
        className={`${className} rounded-full border-2 border-slate-100 shadow-sm object-cover`} 
      />
    );
  }
  const initial = (firstName?.[0] || email?.[0] || "?").toUpperCase();
  return (
    <div className={`${className} rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm border-2 border-slate-100 shadow-sm`}>
      {initial}
    </div>
  );
};

const getStatusBadge = (status) => {
  switch (status) {
    case "pending":
      return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Pending</span>;
    case "approved":
      return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Approved</span>;
    case "rejected":
      return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Rejected</span>;
    case "cancelled":
      return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Cancelled</span>;
    default:
      return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">{status}</span>;
  }
};

const getTypeDisplay = (type, subtype) => {
  if (type === "leave") {
    return subtype === "full_day" ? "Full Day Leave" : "Half Day Leave";
  }
  return "Permission";
};

const LeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingLeave, setViewingLeave] = useState(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [leaveToCancel, setLeaveToCancel] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("my");
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      let result;
      if (activeTab === "my") {
        result = await leaveService.getMyLeaves();
      } else {
        result = await leaveService.getAllLeaves();
      }
      if (result.status === 1) {
        setLeaves(result.leaves || []);
      }
    } catch (err) {
      console.error("Failed to fetch leave requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [activeTab]);

  const handleView = (leave) => {
    setViewingLeave(leave);
    setIsViewDialogOpen(true);
  };

  const handleCancel = (leave) => {
    setLeaveToCancel(leave);
    setIsCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (leaveToCancel) {
      try {
        await leaveService.cancelLeave(leaveToCancel.id);
        fetchLeaves();
        toast({
          title: "Success",
          description: "Request cancelled successfully",
          variant: "success"
        });
      } catch (err) {
        console.error("Cancel failed:", err);
        toast({
          title: "Error",
          description: err.msg || err.error || err.message || "Failed to cancel request",
          variant: "destructive"
        });
      } finally {
        setIsCancelDialogOpen(false);
        setLeaveToCancel(null);
      }
    }
  };

  const handleDelete = (leave) => {
    setLeaveToDelete(leave);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (leaveToDelete) {
      try {
        await leaveService.deleteLeave(leaveToDelete.id);
        fetchLeaves();
        toast({
          title: "Success",
          description: "Request deleted successfully",
          variant: "success"
        });
      } catch (err) {
        console.error("Delete failed:", err);
        toast({
          title: "Error",
          description: err.msg || err.error || err.message || "Failed to delete request",
          variant: "destructive"
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setLeaveToDelete(null);
      }
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      const result = await leaveService.createLeave(data);
      if (result.status === 1) {
        setIsSheetOpen(false);
        fetchLeaves();
        toast({
          title: "Success",
          description: result.msg || "Request created successfully",
          variant: "success"
        });
      }
    } catch (err) {
      setError(err.msg || err.error || "Operation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canViewAll = () => {
    return ["superadmin", "admin", "scrum"].includes(user?.role);
  };

  const canCancel = (leave) => {
    return leave.status === "pending" && 
           leave.role === user?.role && 
           leave.role_id === user?.roleId;
  };

  const canDelete = (leave) => {
    const isOwnRequest = leave.role === user?.role && leave.role_id === user?.roleId;
    const isSuperAdmin = user?.role === "superadmin";
    const isPending = leave.status === "pending";
    const isApproved = leave.status === "approved";
    
    if (isOwnRequest) {
      if (isSuperAdmin) {
        return isPending || isApproved;
      }
      return isPending;
    }
    return false;
  };

  const stats = useMemo(() => {
    const counts = {
      total: leaves.length,
      pending: leaves.filter(l => l.status === "pending").length,
      approved: leaves.filter(l => l.status === "approved").length,
      rejected: leaves.filter(l => l.status === "rejected").length,
      leaves: leaves.filter(l => l.type === "leave").length,
      permissions: leaves.filter(l => l.type === "permission").length
    };
    return counts;
  }, [leaves]);

  const columns = useMemo(() => [
    {
      accessorKey: "person",
      header: "Requested By",
      cell: ({ row }) => {
        const person = row.getValue("person");
        return (
          <div className="flex items-center gap-3">
            <UserAvatar 
              url={person?.avatar_url} 
              email={person?.email} 
              firstName={person?.first_name}
              className="h-8 w-8" 
            />
            <div>
              <div className="font-medium text-slate-900">
                {person?.first_name} {person?.last_name}
              </div>
              <div className="text-xs text-slate-500 capitalize">
                {row.original.role?.replace("_", " ")}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        return getTypeDisplay(row.original.type, row.original.leave_subtype);
      }
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => {
        const reason = row.getValue("reason");
        return (
          <span className="max-w-xs truncate" title={reason}>
            {reason}
          </span>
        );
      },
    },
    {
      accessorKey: "start_date",
      header: "From",
      cell: ({ row }) => {
        const leave = row.original;
        return (
          <div className="flex flex-col">
            <span className="text-slate-900">{formatDate(leave.start_date)}</span>
            {leave.start_time && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {leave.start_time}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "end_date",
      header: "To",
      cell: ({ row }) => {
        const leave = row.original;
        return (
          <div className="flex flex-col">
            <span className="text-slate-900">{formatDate(leave.end_date)}</span>
            {leave.end_time && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {leave.end_time}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return getStatusBadge(row.getValue("status"));
      }
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => formatDate(row.getValue("created_at")),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const leave = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleView(leave)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              {canCancel(leave) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleCancel(leave)} className="text-yellow-600 focus:text-yellow-600 focus:bg-yellow-50">
                    <XCircle className="mr-2 h-4 w-4" /> Cancel Request
                  </DropdownMenuItem>
                </>
              )}
              {canDelete(leave) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDelete(leave)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Request
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [user]);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold tracking-tight text-slate-900">Leave &amp; Permission Management</h1>
          <p className="text-slate-500 hidden md:block">Manage leave and permission requests for the Company.</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) {
            setError("");
          }
        }}>
          <SheetTrigger asChild>
            <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all active:scale-95">
              <Plus className="mr-2 h-4 w-4" /> New Request
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[450px] md:max-w-[500px] border-l shadow-2xl p-0 flex flex-col">
            <SheetHeader className="border-b pb-6 px-6 pt-6">
              <SheetTitle className="text-2xl font-bold">New Request</SheetTitle>
              <SheetDescription>Create a new leave or permission request.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <LeaveForm 
                onSubmit={onSubmit} 
                submitting={submitting}
                error={error}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500">Total</CardTitle>
            <Calendar className="h-3 w-3 text-slate-500" />
          </CardHeader>
          <CardContent className="p-2 pt-1">
            <div className="text-lg font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="p-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-1">
            <CardTitle className="text-xs font-medium text-yellow-700">Pending</CardTitle>
            <Clock3 className="h-3 w-3 text-yellow-600" />
          </CardHeader>
          <CardContent className="p-2 pt-1">
            <div className="text-lg font-bold text-yellow-700">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="p-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-1">
            <CardTitle className="text-xs font-medium text-emerald-700">Approved</CardTitle>
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          </CardHeader>
          <CardContent className="p-2 pt-1">
            <div className="text-lg font-bold text-emerald-700">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card className="p-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-1">
            <CardTitle className="text-xs font-medium text-red-700">Rejected</CardTitle>
            <XCircle className="h-3 w-3 text-red-600" />
          </CardHeader>
          <CardContent className="p-2 pt-1">
            <div className="text-lg font-bold text-red-700">{stats.rejected}</div>
          </CardContent>
        </Card>
        <Card className="p-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-1">
            <CardTitle className="text-xs font-medium text-slate-700">Leaves</CardTitle>
            <Calendar className="h-3 w-3 text-slate-600" />
          </CardHeader>
          <CardContent className="p-2 pt-1">
            <div className="text-lg font-bold text-slate-700">{stats.leaves}</div>
          </CardContent>
        </Card>
        <Card className="p-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-1">
            <CardTitle className="text-xs font-medium text-blue-700">Permissions</CardTitle>
            <Clock className="h-3 w-3 text-blue-600" />
          </CardHeader>
          <CardContent className="p-2 pt-1">
            <div className="text-lg font-bold text-blue-700">{stats.permissions}</div>
          </CardContent>
        </Card>
      </div>

      {canViewAll() && (
        <Tabs defaultValue="my" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="my">My Requests</TabsTrigger>
            <TabsTrigger value="all">All Requests</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        {loading ? (
          <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
        ) : (
          <DataTable columns={columns} data={leaves} filterColumn="reason" />
        )}
      </div>

      <LeaveDetails 
        leave={viewingLeave} 
        open={isViewDialogOpen} 
        onOpenChange={setIsViewDialogOpen}
        onUpdate={fetchLeaves}
      />

      <ConfirmDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onConfirm={confirmCancel}
        title="Cancel Request?"
        description="Are you sure you want to cancel this request? This action cannot be undone."
        confirmText="Cancel Request"
        variant="destructive"
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Request?"
        description="Are you sure you want to delete this request? This action cannot be undone."
        confirmText="Delete Request"
        variant="destructive"
      />
    </div>
  );
};

export default LeavePage;
