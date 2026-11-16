import { MIN_PASSWORD_LENGTH } from "@gym-checkin/shared";
import { useState } from "react";
import { useChangePassword } from "../hooks/useChangePassword";
import { useTranslation } from "../hooks/useTranslation";

const inputStyle = { display: "block", width: "100%", padding: "8px", boxSizing: "border-box" } as const;

export default function ChangePasswordForm() {
  const { forced, isDemo, busy, error, done, submit, goHome } = useChangePassword();
  const { t, tm } = useTranslation();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  // Typo check only, so it stays in the component (the API never sees it)
  const mismatch = confirm !== "" && confirm !== next;

  return (
    <main style={{ maxWidth: "400px", margin: "50px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1>{t("password.title")}</h1>

      {done ? (
        <div role="status">
          <p>{t("password.done")}</p>
          <button onClick={goHome} style={{ padding: "10px 16px" }}>
            {t("common.continue")}
          </button>
        </div>
      ) : isDemo ? (
        <>
          <p>{t("password.demo")}</p>
          <button onClick={goHome} style={{ padding: "10px 16px" }}>
            {t("common.back")}
          </button>
        </>
      ) : (
        <>
          {forced && <p>{t("password.forced")}</p>}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!mismatch) submit(current, next);
            }}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <label>
              {t("password.current")}
              <input
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                style={inputStyle}
              />
            </label>
            <label>
              {t("password.new", { min: MIN_PASSWORD_LENGTH })}
              <input
                type="password"
                // Lets the phone's password manager suggest and save a strong one
                autoComplete="new-password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                minLength={MIN_PASSWORD_LENGTH}
                required
                style={inputStyle}
              />
            </label>
            <label>
              {t("password.repeat")}
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                aria-invalid={mismatch}
                style={inputStyle}
              />
            </label>
            {mismatch && <p style={{ color: "#c53030", margin: 0 }}>{t("password.mismatch")}</p>}
            {error && (
              <p role="alert" style={{ color: "#c53030", margin: 0 }}>
                {tm(error)}
              </p>
            )}
            <button type="submit" disabled={busy || mismatch} style={{ padding: "10px" }}>
              {busy ? t("password.saving") : t("password.submit")}
            </button>
            {!forced && (
              <button type="button" onClick={goHome} style={{ padding: "10px" }}>
                {t("common.cancel")}
              </button>
            )}
          </form>
        </>
      )}
    </main>
  );
}
