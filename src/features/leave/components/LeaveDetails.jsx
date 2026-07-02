import React, { useState, useEffect } from "react";
import { Button } from "../../../common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../common/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../common/components/ui/alert-dialog";
import { leaveService } from "../services/leaveService";
import { Loader2, CheckCircle2, XCircle, Calendar, Clock, User } from "lucide-react";
import { useAuth } from "../../auth/contexts/AuthContext";
import { getFullAvatarUrl, formatDate } from "../../../core/utils/utils";
import { useToast } from "../../../common/hooks/use-toast";

const LeaveDetails = ({ leave, open, onOpenChange, onUpdate }) => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Pending</span>;
      case "approved":
        return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Approved</span>;
      case "rejected":
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Rejected</span>;
      case "cancelled":
        return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Cancelled</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{status}</span>;
    }
  };

  const getTypeDisplay = (type, subtype) => {
    if (type === "leave") {
      return subtype === "full_day" ? "Full Day Leave" : "Half Day Leave";
    }
    return "Permission";
  };

  const canReview = () => {
    if (!leave) return false;
    if (user?.role === "superadmin") return true;
    if (["admin", "scrum"].includes(user?.role) && ["worker", "team_leader"].includes(leave.role)) return true;
    return false;
  };

  const handleReview = async (status) => {
    setPendingAction(null);
    setIsReviewing(true);
    try {
      const result = await leaveService.reviewLeave(leave.id, {
        status,
        review_comment: reviewComment || null,
      });
      if (result.status === 1) {
        toast({
          title: "Success",
          description: result.msg || "Request updated successfully",
          variant: "success"
        });
        if (onUpdate) onUpdate();
        onOpenChange(false);
      }
    } catch (err) {
      console.error("Error reviewing leave:", err);
      toast({
        title: "Error",
        description: err.msg || err.error || err.message || "Failed to review request",
        variant: "destructive"
      });
    } finally {
      setIsReviewing(false);
    }
  };

  if (!leave) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Request Details</DialogTitle>
            {getStatusBadge(leave.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Requester Info */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              {leave.person?.first_name?.charAt(0) || "?"}
              {leave.person?.last_name?.charAt(0) || ""}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">
                {leave.person?.first_name} {leave.person?.last_name}
              </h3>
              <p className="text-sm text-slate-500 capitalize">
                {leave.role?.replace("_", " ")}
              </p>
            </div>
          </div>

          {/* Request Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg">
              <p className="text-sm font-medium text-slate-500 mb-1">Request Type</p>
              <p className="font-semibold text-slate-900">{getTypeDisplay(leave.type, leave.leave_subtype)}</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <p className="text-sm font-medium text-slate-500 mb-1">Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">
                    {formatDate(leave.start_date)}
                    {leave.start_date !== leave.end_date && (
                      <> - {formatDate(leave.end_date)}</>
                    )}
                  </span>
                  {leave.start_time && (
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {leave.start_time} - {leave.end_time}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="p-4 border border-slate-200 rounded-lg">
            <p className="text-sm font-medium text-slate-500 mb-2">Reason</p>
            <p className="text-slate-900 leading-relaxed">{leave.reason}</p>
          </div>

          {/* Attachment */}
          {leave.attachment_path && (
            <div className="p-4 border border-slate-200 rounded-lg">
              <p className="text-sm font-medium text-slate-500 mb-2">Attachment</p>
              <a
                href={getFullAvatarUrl(leave.attachment_path)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                View Attachment
              </a>
            </div>
          )}

          {/* Remark */}
          {leave.remark && (
            <div className="p-4 border border-slate-200 rounded-lg">
              <p className="text-sm font-medium text-slate-500 mb-2">Remark</p>
              <p className="text-slate-900">{leave.remark}</p>
            </div>
          )}

          {/* Review Info */}
          {leave.reviewed_by_person && (
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
              <p className="text-sm font-medium text-slate-500 mb-3">
                {leave.status === "approved" ? "Approved By" : "Rejected By"}
              </p>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-semibold text-slate-900">
                    {leave.reviewed_by_person?.first_name} {leave.reviewed_by_person?.last_name}
                  </p>
                  <p className="text-sm text-slate-500">{formatDate(leave.reviewed_at)}</p>
                </div>
              </div>
              {leave.review_comment && (
                <p className="mt-3 p-3 bg-white border border-slate-200 rounded-lg text-slate-700">
                  {leave.review_comment}
                </p>
              )}
            </div>
          )}

          {/* Audit Log */}
          {leave.audit_logs && leave.audit_logs.length > 0 && (
            <div className="p-4 border border-slate-200 rounded-lg">
              <p className="text-sm font-medium text-slate-500 mb-4">History</p>
              <div className="space-y-3">
                {leave.audit_logs.map((log, index) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-slate-400 mt-2" />
                    <div className="flex-1 pb-3 border-b border-slate-100 last:border-b-0">
                      <p className="font-medium text-slate-900 capitalize">{log.action}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        By {log.performed_by?.first_name} {log.performed_by?.last_name} • {formatDate(log.performed_at)}
                      </p>
                      {log.comment && (
                        <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded">{log.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Actions */}
          {canReview() && leave.status === "pending" && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Comment (Optional)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent min-h-[80px] resize-vertical"
                  placeholder="Add a comment..."
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={isReviewing}
                      className="flex-1 bg-red-600 text-white hover:bg-red-700"
                    >
                      {isReviewing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject Request</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reject this request?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleReview("rejected")}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isReviewing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Reject
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={isReviewing}
                      className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      {isReviewing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Approve Request</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to approve this request?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleReview("approved")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {isReviewing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Approve
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveDetails;
