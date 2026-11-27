import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/page";
import DashboardPage from "./pages/dashboard/page";
import QrCheckinPage from "./pages/checkin/page";
import AdminPage from "./pages/admin/page";
import ReceptionPage from "./pages/reception/page";
import ReceptionScreenPage from "./pages/reception/screen/page";
import ChangePasswordPage from "./pages/password/page";
import AccountPage from "./pages/account/page";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGate from "./components/RoleGate";
import RoleHome from "./components/RoleHome";

// Its own chunk: the charts library loads only for whoever opens the
// statistics, so the check-in pages stay light on a phone
const StatsPage = lazy(() => import("./pages/stats/page"));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* One session guard and one shell for every page, so moving between
            pages neither asks the API again nor redraws the navigation.
            key: not the same instance as the guard of /password */}
        <Route element={<ProtectedRoute key="app" />}>
          <Route element={<AppShell />}>
            {/* Any logged-in user: "/" picks the home page for their role */}
            <Route path="/" element={<RoleHome />} />
            <Route path="/account" element={<AccountPage />} />
            {/* Any role: only aggregates, never who was inside */}
            <Route
              path="/stats"
              element={
                <Suspense fallback={null}>
                  <StatsPage />
                </Suspense>
              }
            />

            {/* Students only (same rule as @Roles(STUDENT) in the API) */}
            <Route element={<RoleGate roles={["STUDENT"]} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
            <Route element={<RoleGate roles={["STUDENT"]} deniedMessage="route.studentsOnly" />}>
              {/* Link inside the reception QR; login (if needed) comes back here */}
              <Route path="/c/:token" element={<QrCheckinPage />} />
            </Route>

            {/* Staff only (same roles the API requires with @Roles()) */}
            <Route element={<RoleGate roles={["RECEPTION", "ADMIN"]} />}>
              <Route path="/reception" element={<ReceptionPage />} />
            </Route>

            {/* Admin only: the accounts */}
            <Route element={<RoleGate roles={["ADMIN"]} />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>

          {/* Full screen, no navigation: it faces the students */}
          <Route element={<RoleGate roles={["RECEPTION", "ADMIN"]} />}>
            <Route path="/reception/screen" element={<ReceptionScreenPage />} />
          </Route>
        </Route>

        {/* Its own guard instance: leaving this page re-reads the user, so
            the cleared mustChangePassword is seen right away */}
        <Route element={<ProtectedRoute key="password" />}>
          <Route path="/password" element={<ChangePasswordPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
