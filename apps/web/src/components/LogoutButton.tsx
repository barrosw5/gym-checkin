import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "../hooks/useTranslation";

/** Log out, shared by every role's home page. */
export default function LogoutButton() {
  const { logout } = useAuth();
  const { t } = useTranslation();

  return (
    <button
      onClick={logout}
      style={{ padding: "10px", backgroundColor: "#e53e3e", color: "white", border: "none", cursor: "pointer" }}
    >
      {t("auth.logout")}
    </button>
  );
}
