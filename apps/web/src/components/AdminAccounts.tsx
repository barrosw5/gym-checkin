import { useTranslation } from "../hooks/useTranslation";
import UsersAdmin from "./UsersAdmin";
import Page from "./ui/Page";

/** Admin only: import members and manage the accounts. */
export default function AdminAccounts() {
  const { t } = useTranslation();

  return (
    <Page width="wide" title={t("users.title")}>
      <UsersAdmin />
    </Page>
  );
}
