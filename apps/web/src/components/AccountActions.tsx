import { Link } from "react-router-dom";
import { useAuthenticatedUser } from "../hooks/useCurrentUser";
import { useTranslation } from "../hooks/useTranslation";
import LogoutButton from "./LogoutButton";

/** Bottom of every home page: change password (not for demo accounts), log out. */
export default function AccountActions() {
  const user = useAuthenticatedUser();
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      {!user.isDemo && (
        <Link
          to="/password"
          className="inline-flex min-h-11 items-center font-semibold text-navy-700 underline-offset-4 hover:underline"
        >
          {t("auth.changePassword")}
        </Link>
      )}
      <LogoutButton />
    </div>
  );
}
