import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "../hooks/useTranslation";
import LoginFormView from "./LoginFormView";
import PageLayout from "./ui/PageLayout";

/** Login page: connects the hook (API) to the view. */
export default function LoginForm() {
  const { login, loading, error } = useAuth();
  const { t } = useTranslation();

  return (
    <PageLayout title={t("auth.title")}>
      <LoginFormView onSubmit={login} loading={loading} error={error} />
    </PageLayout>
  );
}
