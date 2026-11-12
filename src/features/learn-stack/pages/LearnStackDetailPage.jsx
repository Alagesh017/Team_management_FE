import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Heart,
  Loader2,
  MessageCircle,
  Pencil,
  Send,
  Trash2,
} from "lucide-react";
import { Button } from "../../../common/components/ui/button";
import { Badge } from "../../../common/components/ui/badge";
import { Input } from "../../../common/components/ui/input";
import { learnStackService } from "../services/learnStackService";
import { useToast } from "../../../common/hooks/use-toast";
import { useAuth } from "../../auth/contexts/AuthContext";
import { isAdminRole } from "../../tasks/utils/projectPermissions";
import LearnStackReaderRow from "../components/LearnStackReaderRow";
import LearnStackStepViewer from "../components/LearnStackStepViewer";
import { getFullAvatarUrl } from "../../../core/utils/utils";
import { UserAvatar } from "../../../common/components/UserAvatar";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog";

export default function LearnStackDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [card, setCard] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isAuthor =
    card &&
    String(card.author?.role_id) === String(user?.roleId ?? user?.role_id) &&
    (card.author?.role || "") === (user?.role || "");

  const canEdit = isAuthor || isAdminRole(user?.role);

  const refreshComments = useCallback(async () => {
    const res = await learnStackService.getComments(id);
    setComments(res.comments || []);
  }, [id]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await learnStackService.getCard(id);
      setCard(res.card);
      await learnStackService.recordView(id);
      const viewed = await learnStackService.getCard(id);
      setCard(viewed.card);
      await refreshComments();
    } catch (e) {
      toast({ variant: "destructive", title: e?.msg || "Not found" });
      navigate("/learn-stack");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, refreshComments, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleLike = async () => {
    try {
      const res = await learnStackService.toggleLike(id);
      setCard((c) => (c ? { ...c, liked_by_me: res.liked, like_count: res.like_count } : c));
    } catch (e) {
      toast({ variant: "destructive", title: e?.msg });
    }
  };

  const postComment = async () => {
    const body = commentText.trim();
    if (!body) return;
    setSending(true);
    try {
      const res = await learnStackService.addComment(id, body);
      setComments((prev) => [...prev, res.comment]);
      setCommentText("");
      setCard((c) => (c ? { ...c, comment_count: (c.comment_count || 0) + 1 } : c));
    } catch (e) {
      toast({ variant: "destructive", title: e?.msg });
    } finally {
      setSending(false);
    }
  };

  const removeComment = async (commentId) => {
    try {
      await learnStackService.deleteComment(id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCard((c) => (c ? { ...c, comment_count: Math.max(0, (c.comment_count || 1) - 1) } : c));
    } catch (e) {
      toast({ variant: "destructive", title: e?.msg });
    }
  };

  const removeCard = async () => {
    try {
      await learnStackService.deleteCard(id);
      toast({ title: "Guide deleted" });
      navigate("/learn-stack");
    } catch (e) {
      toast({ variant: "destructive", title: e?.msg });
    }
  };

  if (loading || !card) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const authorName =
    [card.author?.first_name, card.author?.last_name].filter(Boolean).join(" ") || "Team member";

  return (
    <div className="w-full min-w-0 space-y-4 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-slate-600" onClick={() => navigate("/learn-stack")}>
          <ArrowLeft className="h-4 w-4" /> Back to library
        </Button>
        {canEdit && (
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => navigate(`/learn-stack/${id}/edit`)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1 text-red-600" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start">
        <div className="min-w-0 space-y-4">
          <header className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <div className="mb-2 flex flex-wrap gap-1.5">
              <Badge className="h-6 bg-violet-600 text-xs font-normal hover:bg-violet-600">
                {card.domain_name}
              </Badge>
              <Badge variant="outline" className="h-6 text-xs font-normal">
                {card.technology_name}
              </Badge>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">{card.title}</h1>
            <p className="mt-1 text-xs text-slate-500">By {authorName}</p>
            {card.description && (
              <p className="mt-3 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{card.description}</p>
            )}
            {card.overview_document_url && (
              <a
                href={getFullAvatarUrl(card.overview_document_url)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-violet-700 hover:underline"
              >
                <FileText className="h-4 w-4" /> Full document
              </a>
            )}
          </header>

          {card.steps?.length > 0 && <LearnStackStepViewer steps={card.steps} />}
        </div>

        <aside className="space-y-3 lg:sticky lg:top-4">
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm space-y-3">
            <Button
              variant={card.liked_by_me ? "default" : "outline"}
              size="sm"
              className={`h-8 w-full gap-1.5 text-xs ${card.liked_by_me ? "bg-violet-600 hover:bg-violet-700" : ""}`}
              onClick={toggleLike}
            >
              <Heart className={`h-3.5 w-3.5 ${card.liked_by_me ? "fill-current" : ""}`} />
              {card.like_count} likes
            </Button>
            <p className="flex items-center justify-center gap-1 text-xs text-slate-500">
              <MessageCircle className="h-3.5 w-3.5" /> {card.comment_count} comments
            </p>
            <LearnStackReaderRow readers={card.readers || []} />
          </div>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-2.5">
              <h2 className="text-sm font-semibold text-slate-900">Comments</h2>
            </div>
            <div className="space-y-3 p-3">
              <div className="flex gap-2">
                <Input
                  className="h-9 text-sm"
                  placeholder="Add a comment…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && postComment()}
                />
                <Button size="sm" className="h-9 w-9 shrink-0 p-0" onClick={postComment} disabled={sending}>
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
              <ul className="max-h-[min(420px,50vh)] space-y-2 overflow-y-auto">
                {comments.map((c) => {
                  const name =
                    [c.author?.first_name, c.author?.last_name].filter(Boolean).join(" ") || "User";
                  return (
                    <li key={c.id} className="flex gap-2 rounded-md bg-slate-50 p-2">
                      <UserAvatar
                        url={c.author?.avatar_url}
                        email={c.author?.email}
                        firstName={c.author?.first_name}
                        lastName={c.author?.last_name}
                        className="h-7 w-7 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800">{name}</p>
                        <p className="text-xs text-slate-600 whitespace-pre-wrap">{c.body}</p>
                      </div>
                      {(c.is_mine || isAdminRole(user?.role)) && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeComment(c.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      )}
                    </li>
                  );
                })}
                {comments.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-2">No comments yet.</p>
                )}
              </ul>
            </div>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this guide?"
        description="This cannot be undone."
        variant="destructive"
        confirmText="Delete"
        onConfirm={removeCard}
      />
    </div>
  );
}
