import { Link } from "react-router-dom";
import { useAuthenticatedUser } from "../hooks/useCurrentUser";
import { useTranslation } from "../hooks/useTranslation";
import LanguagePicker from "./LanguagePicker";
import LogoutButton from "./LogoutButton";

/** Bottom of every home page: language, change password (not for demo accounts), log out. */
export default function AccountActions() {
  const user = useAuthenticatedUser();
  const { t } = useTranslation();

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", marginTop: "20px" }}>
      <LanguagePicker />
      {!user.isDemo && <Link to="/password">{t("auth.changePassword")}</Link>}
      <LogoutButton />
    </div>
  );
}
