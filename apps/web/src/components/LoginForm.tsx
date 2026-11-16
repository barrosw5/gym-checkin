import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "../hooks/useTranslation";
import LanguagePicker from "./LanguagePicker";

export default function LoginForm() {
  const { login, loading, error } = useAuth();
  const { t, tm } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <main style={{ maxWidth: "400px", margin: "50px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      {/* Before logging in too: a visitor may not read Portuguese */}
      <LanguagePicker />
      <h1>{t("auth.title")}</h1>
      {error && (
        <p role="alert" style={{ color: "#c53030" }}>
          {tm(error)}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="text"
          autoComplete="username"
          aria-label={t("auth.username")}
          placeholder={t("auth.username")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          autoComplete="current-password"
          aria-label={t("auth.password")}
          placeholder={t("auth.password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading} style={{ padding: "10px" }}>
          {loading ? t("auth.submitting") : t("auth.submit")}
        </button>
      </form>
    </main>
  );
}
