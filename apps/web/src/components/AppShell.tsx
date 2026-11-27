import { Outlet } from "react-router-dom";
import { useAuthenticatedUser } from "../hooks/useCurrentUser";
import AppShellView from "./AppShellView";
import LogoutButton from "./LogoutButton";

/** Layout route: stays on screen while the pages inside it change. */
export default function AppShell() {
  const user = useAuthenticatedUser();

  return (
    <AppShellView user={user} logout={<LogoutButton fullWidth />}>
      {/* Passes the user on, for useAuthenticatedUser() in the pages */}
      <Outlet context={user} />
    </AppShellView>
  );
}
