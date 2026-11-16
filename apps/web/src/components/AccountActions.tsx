import { KeyRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthenticatedUser } from "../hooks/useCurrentUser";
import { useTranslation } from "../hooks/useTranslation";
import LogoutButton from "./LogoutButton";
import { ICON } from "./ui/icon";

/** Bottom of every home page: change password (not for demo accounts), log out. */
export default function AccountActions() {
  const user = useAuthenticatedUser();
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-900/[0.08] pt-4">
      {user.isDemo ? (
        <span />
      ) : (
        <Link
          to="/password"
          className="inline-flex h-11 items-center gap-2 rounded-lg px-1 text-[15px] font-medium text-navy-700 hover:text-navy-900"
        >
          <KeyRound {...ICON} />
          {t("auth.changePassword")}
        </Link>
      )}
      <LogoutButton />
    </div>
  );
}
