import React, { useMemo, useState } from "react";
import {
  Briefcase,
  ChevronRight,
  MapPin,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "../../../common/components/ui/button";
import { useProfile } from "../contexts/ProfileContext";
import { useAuth } from "../../auth/contexts/AuthContext";
import { cn } from "../../../core/utils/utils";
import { useToast } from "../../../common/hooks/use-toast";
import { CircularProgress } from "./CircularProgress";
import { pickStepPayload, isWorkerSideRole } from "../config/profileFieldConfig";
import { ProfileAdminFields } from "./ProfileAdminFields";
import { ProfileWorkerFields } from "./ProfileWorkerFields";

const STEPS = [
  { id: 1, title: "Profile", subtitle: "Photo & identity", icon: User },
  { id: 2, title: "Work details", subtitle: "Job & workplace", icon: Briefcase },
  { id: 3, title: "Links & address", subtitle: "GitHub, LinkedIn, location", icon: MapPin },
];

function WaveTop() {
  return (
    <svg
      className="pointer-events-none absolute top-0 left-0 w-full text-slate-100/90"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M0,48 C360,96 720,0 1080,48 C1260,72 1380,64 1440,56 L1440,0 L0,0 Z"
      />
      <path
        fill="currentColor"
        fillOpacity="0.5"
        d="M0,72 C480,24 960,96 1440,40 L1440,0 L0,0 Z"
      />
    </svg>
  );
}

function WaveBottom() {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 left-0 w-full text-slate-50"
      viewBox="0 0 1440 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M0,64 C320,96 640,32 960,64 C1200,88 1320,72 1440,80 L1440,100 L0,100 Z"
      />
    </svg>
  );
}

function FloatingBubbles() {
  const bubbles = [
    { size: 120, top: "12%", left: "8%", delay: "0s", duration: "8s" },
    { size: 64, top: "28%", left: "85%", delay: "1.2s", duration: "9s" },
    { size: 96, top: "55%", left: "5%", delay: "0.6s", duration: "7s" },
    { size: 48, top: "70%", left: "78%", delay: "2s", duration: "10s" },
    { size: 160, top: "78%", left: "42%", delay: "0.3s", duration: "11s" },
    { size: 36, top: "18%", left: "52%", delay: "1.8s", duration: "6s" },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="profile-onboarding-bubble absolute rounded-full border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
          style={{
            width: b.size,
            height: b.size,
            top: b.top,
            left: b.left,
            animationDelay: b.delay,
            animationDuration: b.duration,
          }}
        />
      ))}
    </div>
  );
}

const ProfileOnboardingWizard = () => {
  const {
    profile,
    completion,
    saveProfile,
    skipOnboarding,
    finishOnboarding,
    closeOnboarding,
    showOnboarding,
    onboardingMode,
  } = useProfile();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [direction, setDirection] = useState(1);
  const wizardOpenedRef = React.useRef(false);
  const initStepRef = React.useRef(0);

  const isWorkerSide = useMemo(
    () => isWorkerSideRole(user, profile),
    [user, profile]
  );

  React.useEffect(() => {
    if (!showOnboarding) {
      wizardOpenedRef.current = false;
      return;
    }
    if (!profile || wizardOpenedRef.current) return;
    wizardOpenedRef.current = true;
    setForm({
      country: "India",
      status: "ACTIVE",
      work_mode: "OFFICE",
      employment_type: "FULL_TIME",
      ...profile,
    });
    const firstIncomplete = (completion?.steps || []).findIndex((s) => s.percent < 100);
    initStepRef.current = firstIncomplete >= 0 ? firstIncomplete : 0;
    setStep(initStepRef.current);
  }, [profile, showOnboarding]);

  React.useEffect(() => {
    if (!showOnboarding) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showOnboarding]);

  const set = React.useCallback((key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
  }, []);

  if (!showOnboarding) return null;

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => set("avatar_url", reader.result);
    reader.readAsDataURL(file);
  };

  const persistStep = async (stepIndex = step) => {
    setSaving(true);
    try {
      const payload = pickStepPayload(form, stepIndex, isWorkerSide);
      const data = await saveProfile(payload);
      if (data?.profile) {
        setForm((prev) => ({
          ...prev,
          ...data.profile,
          country: data.profile.country || prev.country || "India",
          status: data.profile.status || prev.status || "ACTIVE",
          work_mode: data.profile.work_mode || prev.work_mode || "OFFICE",
          employment_type: data.profile.employment_type || prev.employment_type || "FULL_TIME",
        }));
      }
      return data;
    } catch (e) {
      toast({
        title: "Could not save",
        description: e?.response?.data?.msg || e?.message || "Try again.",
        variant: "destructive",
      });
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const goToStep = (targetStep) => {
    if (targetStep === step || saving) return;
    setDirection(targetStep > step ? 1 : -1);
    setStep(targetStep);
  };

  const goNext = async () => {
    const data = await persistStep(step);
    const percent = data?.completion?.percent ?? completion?.percent ?? 0;

    if (step < 2) {
      setDirection(1);
      setStep((s) => s + 1);
      toast({
        title: "Saved",
        description: "You can update other steps anytime from your profile.",
        variant: "success",
      });
      return;
    }

    if (percent >= 100) {
      await finishOnboarding();
      toast({ title: "Profile complete", description: "All details saved.", variant: "success" });
    } else {
      closeOnboarding();
      toast({
        title: "Progress saved",
        description: "Come back anytime from the profile menu to fill the rest.",
        variant: "success",
      });
    }
  };

  const handleSaveAndClose = async () => {
    await persistStep(step);
    closeOnboarding();
    toast({
      title: "Saved",
      description: "Your changes were saved. Continue later from the profile menu.",
      variant: "success",
    });
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const handleSkip = async () => {
    if (onboardingMode === "manual") {
      await handleSaveAndClose();
      return;
    }
    await skipOnboarding();
  };

  const isManual = onboardingMode === "manual";
  const completionPercent = completion?.percent ?? 0;

  const stepMeta = STEPS[step];
  const StepIcon = stepMeta.icon;

  return (
    <div className="fixed inset-0 z-[200] flex min-h-0 flex-col bg-white animate-in fade-in duration-300">
      <WaveTop />
      <WaveBottom />
      <FloatingBubbles />

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-[18%] -right-16 h-56 w-56 rounded-full border border-slate-100 bg-slate-50/40" />
        <div className="absolute top-[40%] -left-8 h-32 w-32 rounded-full bg-slate-50" />
      </div>

      <header className="relative z-10 shrink-0 border-b border-slate-100 bg-white/90 backdrop-blur-sm px-4 py-3 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Complete your profile
            </p>
            <h1 className="text-lg font-bold text-slate-900 md:text-xl">Profile setup</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:bg-slate-50"
            onClick={handleSkip}
            disabled={saving}
          >
            {isManual ? "Close" : "Skip for now"}
          </Button>
        </div>
      </header>

      {/* Whole page scrolls here */}
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 pb-10 md:px-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12 lg:py-10">
          {/* Left — circular progress + step picker */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <CircularProgress value={completionPercent} size={132} strokeWidth={8}>
                  <span className="text-lg font-bold text-slate-800">{Math.round(completionPercent)}%</span>
                </CircularProgress>
                <p className="mt-4 text-sm font-semibold text-slate-900">Profile completion</p>
                <p className="mt-1 text-xs text-slate-500">
                  Pick any section — update what you need
                </p>
              </div>

              <nav className="mt-8 space-y-2" aria-label="Profile steps">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const active = i === step;
                  const stepPct = completion?.steps?.[i]?.percent ?? 0;
                  const done = stepPct >= 100;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={saving}
                      onClick={() => goToStep(i)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all disabled:opacity-60",
                        active
                          ? "border-slate-900 bg-white shadow-md"
                          : "border-transparent bg-white/60 hover:border-slate-200 hover:bg-white"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                          active && "border-slate-900 bg-slate-900 text-white",
                          !active && done && "border-emerald-500 bg-emerald-50 text-emerald-600",
                          !active && !done && "border-slate-200 text-slate-400"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-sm font-semibold truncate", active ? "text-slate-900" : "text-slate-700")}>
                          {s.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{s.subtitle}</p>
                        <div className="mt-2 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              done ? "bg-emerald-500" : "bg-slate-800"
                            )}
                            style={{ width: `${stepPct}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Right — fields */}
          <section className="min-w-0">
            <div
              className={cn(
                "rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] md:p-8",
                direction > 0 ? "profile-step-enter-forward" : "profile-step-enter-back"
              )}
            >
              <div className="mb-6 flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <StepIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900">{stepMeta.title}</p>
                  <p className="text-xs text-slate-500">{stepMeta.subtitle}</p>
                </div>
              </div>

              {isWorkerSide ? (
                <ProfileWorkerFields
                  section={step}
                  form={form}
                  set={set}
                  onImageUpload={handleImage}
                  user={user}
                />
              ) : (
                <ProfileAdminFields
                  section={step}
                  form={form}
                  set={set}
                  onImageUpload={handleImage}
                  user={user}
                />
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
              <Button
                variant="outline"
                className="border-slate-200"
                disabled={step === 0 || saving}
                onClick={goBack}
              >
                Back
              </Button>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  className="border-slate-200"
                  onClick={handleSaveAndClose}
                  disabled={saving}
                >
                  Save & close
                </Button>
                <Button
                  className="bg-slate-900 hover:bg-slate-800 min-w-[140px]"
                  onClick={goNext}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : step === 2 ? (
                    completionPercent >= 100 ? "Complete profile" : "Save & continue"
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileOnboardingWizard;
