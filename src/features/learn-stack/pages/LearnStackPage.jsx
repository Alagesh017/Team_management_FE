import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Plus, Search, Settings2 } from "lucide-react";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { ListPageShell, DataTableCard } from "../../../common/components/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../common/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../common/components/ui/select";
import { learnStackService } from "../services/learnStackService";
import GuidesList from "../components/GuidesList";
import { useToast } from "../../../common/hooks/use-toast";
import { useAuth } from "../../auth/contexts/AuthContext";
import { isAdminRole } from "../../tasks/utils/projectPermissions";
import LearnStackMastersPanel from "../components/LearnStackMastersPanel";
export default function LearnStackPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.role);
  const [tab, setTab] = useState("browse");
  const [cards, setCards] = useState([]);
  const [domains, setDomains] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [domainId, setDomainId] = useState("all");
  const [technologyId, setTechnologyId] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadMasters = useCallback(async () => {
    const [dRes, tRes] = await Promise.all([
      learnStackService.getDomains(),
      learnStackService.getTechnologies(),
    ]);
    setDomains(dRes.domains || []);
    setTechnologies(tRes.technologies || []);
  }, []);

  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      const params = { q: search.trim() || undefined };
      if (domainId !== "all") params.domain_id = domainId;
      if (technologyId !== "all") params.technology_id = technologyId;
      if (tab === "mine") params.mine = "1";
      const res = await learnStackService.getCards(params);
      setCards(res.cards || []);
    } catch (e) {
      toast({ variant: "destructive", title: e?.msg || "Failed to load guides" });
    } finally {
      setLoading(false);
    }
  }, [domainId, technologyId, search, tab, toast]);

  useEffect(() => {
    loadMasters().catch(() => {});
  }, [loadMasters]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const filteredTechOptions = useMemo(() => {
    if (domainId === "all") return technologies;
    return technologies.filter((t) => String(t.domain_id) === domainId);
  }, [technologies, domainId]);

  const emptyHint =
    domains.length === 0 && isAdmin
      ? "Add domains and technologies under the Masters tab first."
      : "No guides yet — create one and help your team learn your stack.";

  const filterBar = (
    <div className="flex w-full flex-col gap-2 border-b border-slate-100 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          className="h-9 pl-8 text-sm"
          placeholder="Search guides…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Select value={domainId} onValueChange={(v) => { setDomainId(v); setTechnologyId("all"); }}>
        <SelectTrigger className="h-9 w-full sm:w-[160px] text-sm">
          <SelectValue placeholder="Domain" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All domains</SelectItem>
          {domains.map((d) => (
            <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={technologyId} onValueChange={setTechnologyId}>
        <SelectTrigger className="h-9 w-full sm:w-[160px] text-sm">
          <SelectValue placeholder="Stack" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All stacks</SelectItem>
          {filteredTechOptions.map((t) => (
            <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="flex w-full min-w-0 flex-col">
      <ListPageShell
        className="w-full"
        title={
          <span className="inline-flex items-center gap-2 text-lg font-bold md:text-xl">
            <BookOpen className="h-5 w-5 text-violet-600" />
            Learn Stack
          </span>
        }
        description="Company standards and stack guides by domain and technology."
        action={
          <Button size="sm" className="h-9 gap-1.5 bg-slate-900 hover:bg-slate-800" onClick={() => navigate("/learn-stack/new")}>
            <Plus className="h-4 w-4" /> New guide
          </Button>
        }
      >
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="h-9">
            <TabsTrigger value="browse" className="text-xs sm:text-sm">All guides</TabsTrigger>
            <TabsTrigger value="mine" className="text-xs sm:text-sm">My guides</TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="masters" className="inline-flex items-center gap-1.5 text-xs sm:text-sm">
                <Settings2 className="h-3.5 w-3.5 shrink-0" />
                Masters
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="browse" className="mt-3 w-full space-y-0">
            <DataTableCard loading={false} className="overflow-hidden">
              {filterBar}
              <GuidesList
                cards={cards}
                loading={loading}
                emptyHint={emptyHint}
                onOpen={(id) => navigate(`/learn-stack/${id}`)}
              />
            </DataTableCard>
          </TabsContent>

          <TabsContent value="mine" className="mt-3 w-full">
            <DataTableCard>
              <GuidesList
                cards={cards}
                loading={loading}
                emptyHint="You haven't published any guides yet."
                onOpen={(id) => navigate(`/learn-stack/${id}`)}
              />
            </DataTableCard>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="masters" className="mt-3 w-full">
              <LearnStackMastersPanel />
            </TabsContent>
          )}
        </Tabs>
      </ListPageShell>
    </div>
  );
}
