import { MIN_PASSWORD_LENGTH } from "@gym-checkin/shared";
import { useState } from "react";
import { useChangePassword } from "../hooks/useChangePassword";

export default function ChangePasswordForm() {
  const { forced, isDemo, busy, error, done, submit, goHome } = useChangePassword();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  // Typo check only, so it stays in the component (the API never sees it)
  const mismatch = confirm !== "" && confirm !== next;

  return (
    <main style={{ maxWidth: "400px", margin: "50px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1>Mudar a password</h1>

      {done ? (
        <div role="status">
          <p>✅ Password mudada. As sessões noutros dispositivos foram terminadas.</p>
          <button onClick={goHome} style={{ padding: "10px 16px" }}>
            Continuar
          </button>
        </div>
      ) : isDemo ? (
        <>
          <p>As contas de demonstração são públicas e não podem mudar a password.</p>
          <button onClick={goHome} style={{ padding: "10px 16px" }}>
            Voltar
          </button>
        </>
      ) : (
        <>
          {forced && (
            <p>
              A tua conta foi criada com uma password temporária. Escolhe uma nova para
              continuar.
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!mismatch) submit(current, next);
            }}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <label>
              Password atual
              <input
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                style={{ display: "block", width: "100%", padding: "8px" }}
              />
            </label>
            <label>
              Nova password (pelo menos {MIN_PASSWORD_LENGTH} caracteres)
              <input
                type="password"
                // Lets the phone's password manager suggest and save a strong one
                autoComplete="new-password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                minLength={MIN_PASSWORD_LENGTH}
                required
                style={{ display: "block", width: "100%", padding: "8px" }}
              />
            </label>
            <label>
              Repete a nova password
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                aria-invalid={mismatch}
                style={{ display: "block", width: "100%", padding: "8px" }}
              />
            </label>
            {mismatch && <p style={{ color: "#c53030", margin: 0 }}>As passwords não coincidem.</p>}
            {error && (
              <p role="alert" style={{ color: "#c53030", margin: 0 }}>
                {error}
              </p>
            )}
            <button type="submit" disabled={busy || mismatch} style={{ padding: "10px" }}>
              {busy ? "A guardar..." : "Mudar password"}
            </button>
            {!forced && (
              <button type="button" onClick={goHome} style={{ padding: "10px" }}>
                Cancelar
              </button>
            )}
          </form>
        </>
      )}
    </main>
  );
}
