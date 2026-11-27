import { useAuthenticatedUser } from "../hooks/useCurrentUser";
import { useTranslation } from "../hooks/useTranslation";
import AccountView from "./AccountView";
import LogoutButton from "./LogoutButton";
import Page from "./ui/Page";

/** Account page (any role). */
export default function Account() {
  const user = useAuthenticatedUser();
  const { t } = useTranslation();

  return (
    <Page title={t("account.title")}>
      <AccountView user={user} logout={<LogoutButton fullWidth />} />
    </Page>
  );
}
