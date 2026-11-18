import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { DataTable } from "../../../common/components/DataTable";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog";
import { leaveService } from "../services/leaveService";
import { Button } from "../../../common/components/ui/button";
import { FormSheet } from "../../../common/components/FormSheet";
import { ListPageShell, DataTableCard } from "../../../common/components/PageLayout";
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
import LeaveDashboardPanel from "../components/LeaveDashboardPanel";
import { Link } from "react-router-dom";
import LeaveMailComposeDialog from "../components/LeaveMailComposeDialog";
import { getFullAvatarUrl, formatDate } from "../../../core/utils/utils";
import { useToast } from "../../../common/hooks/use-toast";
import { useAuth } from "../../auth/contexts/AuthContext";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../common/components/ui/tabs";
import { LayoutGrid, List } from "lucide-react";
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

const getTypeDisplay = (type, subtype, category) => {
  if (type === "leave") {
    const base =
      subtype === "full_day" ? "Full Day Leave" : "Half Day Leave";
    return category === "religious" ? `Religious · ${base}` : base;
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
  const [mailComposeOpen, setMailComposeOpen] = useState(false);
  const [leaveDraft, setLeaveDraft] = useState(null);
  const [composeLoading, setComposeLoading] = useState(false);
  const [initialCompose, setInitialCompose] = useState(null);
  const [pageTab, setPageTab] = useState("dashboard");
  const [requestTab, setRequestTab] = useState("my");
  const [dashYear, setDashYear] = useState(() => new Date().getFullYear());
  const [dashMonth, setDashMonth] = useState(() => new Date().getMonth() + 1);
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  const fetchDashboard = useCallback(
    async (year, month) => {
      if (!user?.accessToken) return;
      const y = year ?? dashYear;
      const m = month ?? dashMonth;
      try {
        setDashboardLoading(true);
        const res = await leaveService.getDashboard({ year: y, month: m });
        if (res.status === 1) {
          setDashboard(res);
          setDashYear(res.year);
          setDashMonth(res.month);
        }
      } catch (err) {
        console.error("Leave dashboard:", err);
      } finally {
        setDashboardLoading(false);
      }
    },
    [user?.accessToken, dashYear, dashMonth]
  );

  const fetchLeaves = useCallback(async () => {
    if (!user?.accessToken) {
      return;
    }
    try {
      setLoading(true);
      const result =
        requestTab === "my"
          ? await leaveService.getMyLeaves()
          : await leaveService.getAllLeaves();
      if (result?.status === 1) {
        setLeaves(result.leaves || []);
      } else {
        setLeaves([]);
        toast({
          title: "Could not load leave requests",
          description: result?.msg || result?.error || "Unexpected server response",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Failed to fetch leave requests:", err);
      setLeaves([]);
      toast({
        title: "Could not load leave requests",
        description:
          err?.msg || err?.error || err?.message || "Check that the API is running on port 5050",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [requestTab, user?.accessToken, toast]);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }
    if (!location.pathname.endsWith("/leave") && location.pathname !== "/leave") {
      return;
    }
    if (pageTab === "requests") {
      fetchLeaves();
    }
    if (pageTab === "dashboard") {
      fetchDashboard();
    }
  }, [
    authLoading,
    user,
    location.pathname,
    location.key,
    pageTab,
    requestTab,
    fetchLeaves,
    fetchDashboard,
  ]);

  const handleView = async (leave) => {
    try {
      const res = await leaveService.getLeaveById(leave.id);
      if (res.status === 1 && res.leave) {
        setViewingLeave(res.leave);
      } else {
        setViewingLeave(leave);
      }
    } catch {
      setViewingLeave(leave);
    }
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

  const buildFallbackCompose = (draft, admins = []) => {
    const typeLabel =
      draft.type === "permission"
        ? "Permission"
        : draft.leave_subtype === "half_day"
          ? "Half Day Leave"
          : "Full Day Leave";
    const dates =
      draft.start_date === draft.end_date
        ? draft.start_date
        : `${draft.start_date} to ${draft.end_date}`;
    return {
      status: 1,
      admins,
      subject: `Leave / Permission Request — (${typeLabel})`,
      body: [
        "Dear Sir/Madam,",
        "",
        `I would like to submit a ${typeLabel} request for your approval.`,
        "",
        `Request type: ${typeLabel}`,
        `Date / time: ${dates}`,
        `Reason: ${draft.reason || ""}`,
        draft.remark ? `Remark: ${draft.remark}` : null,
        "",
        "Please review this request in Dce Task Manager (Leave & Permissions).",
        "",
        "Regards,",
      ]
        .filter(Boolean)
        .join("\n"),
      uses_saved_template: false,
    };
  };

  const handleOpenCompose = async (draft) => {
    if (!draft?.reason?.trim()) {
      toast({
        title: "Reason required",
        description: "Enter a reason before composing the email.",
        variant: "destructive",
      });
      return;
    }
    setComposeLoading(true);
    setLeaveDraft(draft);
    setInitialCompose(null);
    setIsSheetOpen(false);
    try {
      const res = await leaveService.composeMail(draft);
      if (res.status === 1) {
        setInitialCompose(res);
      } else {
        const rec = await leaveService.getMailRecipients().catch(() => ({ admins: [] }));
        setInitialCompose(buildFallbackCompose(draft, rec.admins || []));
        toast({
          title: "Using default email template",
          description: res.msg || res.error || "Could not load saved template from server",
          variant: "default",
        });
      }
    } catch (err) {
      try {
        const rec = await leaveService.getMailRecipients();
        setInitialCompose(buildFallbackCompose(draft, rec.admins || []));
        toast({
          title: "Using default email template",
          description:
            err?.msg || err?.error || err?.message || "Compose API unavailable — check Flask is restarted",
          variant: "default",
        });
      } catch {
        toast({
          title: "Could not open email",
          description:
            err?.msg || err?.error || err?.message || "Check API is running and leave routes are deployed",
          variant: "destructive",
        });
        setComposeLoading(false);
        setIsSheetOpen(true);
        return;
      }
    }
    setMailComposeOpen(true);
    setComposeLoading(false);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      const result = await leaveService.createLeave(data);
      if (result.status === 1) {
        setIsSheetOpen(false);
        setMailComposeOpen(false);
        setLeaveDraft(null);
        setInitialCompose(null);
        fetchLeaves();
        fetchDashboard();
        const quotaNotes = result.quota_warnings?.length
          ? result.quota_warnings.join(" ")
          : null;

        if (result.mail_warning) {
          toast({
            title: "Request saved — email not sent",
            description: [result.mail_warning, quotaNotes].filter(Boolean).join(" "),
            variant: "destructive",
          });
        } else if (quotaNotes) {
          toast({
            title: "Request submitted",
            description: quotaNotes,
            variant: "default",
          });
        } else {
          toast({
            title: "Success",
            description: result.msg || "Request created successfully",
            variant: "success",
          });
        }
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
        return getTypeDisplay(
          row.original.type,
          row.original.leave_subtype,
          row.original.leave_category
        );
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
      id: "approved_by",
      header: "Approved by",
      cell: ({ row }) => {
        const leave = row.original;
        if (leave.status !== "approved" || !leave.reviewed_by_person) {
          return <span className="text-slate-400 text-xs">—</span>;
        }
        const p = leave.reviewed_by_person;
        return (
          <span className="text-sm text-slate-800">
            {p.first_name} {p.last_name}
          </span>
        );
      },
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
    <ListPageShell
      title="Leave & Permission Management"
      description="Manage leave and permission requests for the Company."
      action={
        <FormSheet
          open={isSheetOpen}
          onOpenChange={(open) => {
            setIsSheetOpen(open);
            if (!open) setError("");
          }}
          icon={Calendar}
          title="New Request"
          description="Fill in request details, then compose the email in the popup."
          trigger={
            <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all active:scale-95">
              <Plus className="mr-2 h-4 w-4" /> New Request
            </Button>
          }
        >
          <LeaveForm
            onSubmit={onSubmit}
            onOpenCompose={handleOpenCompose}
            composeLoading={composeLoading}
            submitting={submitting}
            error={error}
          />
        </FormSheet>
      }
    >
      <LeaveMailComposeDialog
        open={mailComposeOpen}
        onOpenChange={(v) => {
          setMailComposeOpen(v);
          if (!v) {
            setInitialCompose(null);
            if (!submitting) {
              setLeaveDraft(null);
              setIsSheetOpen(true);
            }
          }
        }}
        formData={leaveDraft}
        initialCompose={initialCompose}
        onSend={onSubmit}
        submitting={submitting}
      />

      <Tabs value={pageTab} onValueChange={setPageTab} className="min-h-0 flex flex-col gap-4">
        <TabsList className="shrink-0 w-fit rounded-lg border border-slate-200 bg-slate-50/80 p-1">
          <TabsTrigger value="dashboard" className="gap-1.5 rounded-md px-4 data-[active]:bg-white">
            <LayoutGrid className="h-3.5 w-3.5" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-1.5 rounded-md px-4 data-[active]:bg-white">
            <List className="h-3.5 w-3.5" />
            Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0 min-h-0">
          <LeaveDashboardPanel
            dashboard={dashboard}
            loading={dashboardLoading}
            year={dashYear}
            month={dashMonth}
            onMonthChange={(y, m) => fetchDashboard(y, m)}
            personLabel={[user?.first_name || user?.firstName, user?.last_name || user?.lastName]
              .filter(Boolean)
              .join(" ")}
            adminPolicyLink={
              ["superadmin", "admin", "scrum"].includes(user?.role) ? (
                <p className="text-xs text-slate-500 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-3 py-2.5">
                  Configure quota &amp; holidays in{" "}
                  <Link to="/leave-policy" className="font-semibold text-indigo-600 hover:underline">
                    Leave policy master
                  </Link>
                </p>
              ) : null
            }
          />
        </TabsContent>

        <TabsContent value="requests" className="mt-0 flex min-h-0 flex-col gap-4">
          {canViewAll() ? (
            <Tabs value={requestTab} onValueChange={setRequestTab}>
              <TabsList className="w-fit">
                <TabsTrigger value="my">My Requests</TabsTrigger>
                <TabsTrigger value="all">All Requests</TabsTrigger>
              </TabsList>
            </Tabs>
          ) : (
            <p className="text-sm font-semibold text-slate-800">My requests</p>
          )}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
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

          <DataTableCard loading={loading} className="min-h-0 flex-1">
            <DataTable
              columns={columns}
              data={leaves}
              filterColumn="reason"
              filterPlaceholder="Search by reason…"
              embedded
            />
          </DataTableCard>
        </TabsContent>
      </Tabs>

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
    </ListPageShell>
  );
};

export default LeavePage;
