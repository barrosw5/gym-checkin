import { MIN_PASSWORD_LENGTH } from "@gym-checkin/shared";
import { useState } from "react";
import type { Translatable } from "../core/i18n/types";
import { useTranslation } from "../hooks/useTranslation";
import Alert from "./ui/Alert";
import Button from "./ui/Button";
import Card from "./ui/Card";
import TextField from "./ui/TextField";

export interface ChangePasswordFormViewProps {
  /** Temporary password: no way back until a new one is chosen. */
  forced: boolean;
  isDemo: boolean;
  busy: boolean;
  done: boolean;
  error: Translatable | null;
  onSubmit: (currentPassword: string, newPassword: string) => void;
  /** Continue/cancel/back: leaves the page. */
  onLeave: () => void;
}

export default function ChangePasswordFormView({
  forced,
  isDemo,
  busy,
  done,
  error,
  onSubmit,
  onLeave,
}: ChangePasswordFormViewProps) {
  const { t, tm } = useTranslation();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  // Typo check only, so it stays in the form (the API never sees it)
  const mismatch = confirm !== "" && confirm !== next;

  if (done || isDemo) {
    return (
      <Card>
        <div className="flex flex-col gap-4">
          <Alert tone={done ? "success" : "info"}>{done ? t("password.done") : t("password.demo")}</Alert>
          <Button onClick={onLeave}>{done ? t("common.continue") : t("common.back")}</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!mismatch) onSubmit(current, next);
        }}
        className="flex flex-col gap-4"
      >
        {forced && <Alert tone="warning">{t("password.forced")}</Alert>}
        <TextField
          label={t("password.current")}
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
        />
        <TextField
          label={t("password.new", { min: MIN_PASSWORD_LENGTH })}
          type="password"
          // Lets the phone's password manager suggest and save a strong one
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          minLength={MIN_PASSWORD_LENGTH}
          required
        />
        <TextField
          label={t("password.repeat")}
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={mismatch ? t("password.mismatch") : undefined}
          required
        />
        {error && <Alert tone="error">{tm(error)}</Alert>}
        <div className="flex flex-col gap-2">
          <Button type="submit" size="lg" fullWidth loading={busy} disabled={mismatch}>
            {busy ? t("password.saving") : t("password.submit")}
          </Button>
          {!forced && (
            <Button variant="ghost" fullWidth onClick={onLeave}>
              {t("common.cancel")}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
