import { LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "../hooks/useTranslation";
import Button from "./ui/Button";
import { ICON } from "./ui/icon";

/** Log out: in the sidebar and on the account page. */
export default function LogoutButton({ fullWidth = false }: { fullWidth?: boolean }) {
  const { logout } = useAuth();
  const { t } = useTranslation();

  return (
    <Button variant="secondary" fullWidth={fullWidth} onClick={logout}>
      <LogOut {...ICON} />
      {t("auth.logout")}
    </Button>
  );
}
