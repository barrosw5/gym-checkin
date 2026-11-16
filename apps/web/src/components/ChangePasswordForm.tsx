import { useChangePassword } from "../hooks/useChangePassword";
import { useTranslation } from "../hooks/useTranslation";
import ChangePasswordFormView from "./ChangePasswordFormView";
import PageLayout from "./ui/PageLayout";

/** Change password page: connects the hook (API) to the view. */
export default function ChangePasswordForm() {
  const { forced, isDemo, busy, error, done, submit, goHome } = useChangePassword();
  const { t } = useTranslation();

  return (
    <PageLayout title={t("password.title")}>
      <ChangePasswordFormView
        forced={forced}
        isDemo={isDemo}
        busy={busy}
        done={done}
        error={error}
        onSubmit={submit}
        onLeave={goHome}
      />
    </PageLayout>
  );
}
