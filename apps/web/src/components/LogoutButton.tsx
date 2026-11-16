import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "../hooks/useTranslation";
import Button from "./ui/Button";

/** Log out, shared by every role's home page. */
export default function LogoutButton() {
  const { logout } = useAuth();
  const { t } = useTranslation();

  return (
    <Button variant="secondary" onClick={logout}>
      {t("auth.logout")}
    </Button>
  );
}
