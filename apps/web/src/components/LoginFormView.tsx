import { useState } from "react";
import type { Translatable } from "../core/i18n/types";
import { useTranslation } from "../hooks/useTranslation";
import Alert from "./ui/Alert";
import Button from "./ui/Button";
import Card from "./ui/Card";
import TextField from "./ui/TextField";

export interface LoginFormViewProps {
  onSubmit: (username: string, password: string) => void;
  loading: boolean;
  error: Translatable | null;
}

export default function LoginFormView({ onSubmit, loading, error }: LoginFormViewProps) {
  const { t, tm } = useTranslation();
  // What is being typed: local to the form, not app state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Card>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(username, password);
        }}
        className="flex flex-col gap-4"
      >
        {error && <Alert tone="error">{tm(error)}</Alert>}
        <TextField
          label={t("auth.username")}
          autoComplete="username"
          // No auto-capitalise/correct: usernames are lowercase identifiers
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <TextField
          label={t("auth.password")}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" size="lg" fullWidth loading={loading}>
          {loading ? t("auth.submitting") : t("auth.submit")}
        </Button>
      </form>
    </Card>
  );
}
