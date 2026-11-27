import type { DemoRole } from "@gym-checkin/shared";
import { ConciergeBell, ShieldCheck, User } from "lucide-react";
import type { ReactNode } from "react";
import type { OccupancyView } from "../core/types/occupancy";
import { useTranslation } from "../hooks/useTranslation";
import LanguagePicker from "./LanguagePicker";
import OccupancyCounterView from "./OccupancyCounterView";
import ThemeToggle from "./ThemeToggle";
import Brand from "./ui/Brand";
import Button from "./ui/Button";
import { ICON } from "./ui/icon";

export interface LoginScreenViewProps {
  /** The public demo's live occupancy; null hides the numbers and the shortcuts. */
  demo: OccupancyView | null;
  /** Which demo account is being opened. */
  demoRole: DemoRole | null;
  onDemoLogin: (role: DemoRole) => void;
  /** The username and password form. */
  form: ReactNode;
}

const SHORTCUTS = [
  { role: "STUDENT", label: "demo.member", Icon: User },
  { role: "RECEPTION", label: "demo.reception", Icon: ConciergeBell },
  { role: "ADMIN", label: "demo.admin", Icon: ShieldCheck },
] as const;

/**
 * Login: on a PC, the gym on a graphite panel (the headline and how full it
 * is now) beside the form; on a phone, one column in the same order.
 */
export default function LoginScreenView({ demo, demoRole, onDemoLogin, form }: LoginScreenViewProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-svh flex-col bg-surface lg:grid lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
      <title>{t("layout.documentTitleHome")}</title>

      {/* data-theme: this panel stays graphite in the light theme too */}
      <section data-theme="dark" className="flex flex-col gap-6 bg-canvas px-4 pt-3 pb-6 text-ink sm:px-8 lg:justify-between lg:p-10">
        <div className="flex items-center justify-between gap-4">
          <Brand />
          {/* On a phone the switches sit here; on a PC, above the form */}
          <div className="flex items-center gap-2 lg:hidden">
            <LanguagePicker />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex w-full max-w-xl flex-col gap-6 lg:mx-auto lg:gap-10">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl leading-tight font-medium tracking-tight text-balance lg:text-5xl lg:leading-[1.1]">
              {t("login.headline")}
            </h1>
            <p className="max-w-md text-ink-2 lg:text-lg">{t("login.subline")}</p>
          </div>
          {demo && <OccupancyCounterView occupancy={demo} stale={false} large />}
        </div>

        {/* Keeps the headline block in the optical middle on a PC */}
        <p className="hidden text-sm text-ink-3 lg:block">{t("login.footnote")}</p>
      </section>

      <main className="flex flex-col px-4 py-6 sm:px-8 lg:p-10">
        <div className="hidden items-center justify-end gap-2 lg:flex">
          <LanguagePicker />
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-col gap-6 lg:my-auto">
          <h2 className="text-2xl font-medium text-ink">{t("auth.submit")}</h2>
          {form}

          {demo && (
            <div className="flex flex-col gap-3 border-t border-line pt-6">
              <p className="text-sm text-ink-3">{t("demo.hint")}</p>
              <div className="flex flex-col gap-3">
                {SHORTCUTS.map(({ role, label, Icon }) => (
                  <Button
                    key={role}
                    variant="secondary"
                    size="lg"
                    loading={demoRole === role}
                    disabled={demoRole !== null}
                    onClick={() => onDemoLogin(role)}
                  >
                    {demoRole !== role && <Icon {...ICON} />}
                    {t(label)}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
