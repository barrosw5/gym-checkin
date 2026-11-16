import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/page";
import DashboardPage from "./pages/dashboard/page";
import QrCheckinPage from "./pages/checkin/page";
import AdminPage from "./pages/admin/page";
import ReceptionPage from "./pages/reception/page";
import ReceptionScreenPage from "./pages/reception/screen/page";
import ChangePasswordPage from "./pages/password/page";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleHome from "./components/RoleHome";

// Its own chunk: the charts library loads only for whoever opens the
// statistics, so the check-in pages stay light on a phone
const StatsPage = lazy(() => import("./pages/stats/page"));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Any logged-in user: "/" picks the home page for their role */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<RoleHome />} />
          {/* Any role: only aggregates, never who was inside */}
          <Route
            path="/stats"
            element={
              <Suspense fallback={null}>
                <StatsPage />
              </Suspense>
            }
          />
        </Route>

        {/* Its own guard instance: leaving this page re-reads the user, so
            the cleared mustChangePassword is seen right away */}
        <Route element={<ProtectedRoute />}>
          <Route path="/password" element={<ChangePasswordPage />} />
        </Route>

        {/* Students only (same rule as @Roles(STUDENT) in the API) */}
        <Route element={<ProtectedRoute roles={["STUDENT"]} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        <Route
          element={
            <ProtectedRoute
              roles={["STUDENT"]}
              deniedMessage="route.studentsOnly"
            />
          }
        >
          {/* Link inside the reception QR; login (if needed) comes back here */}
          <Route path="/c/:token" element={<QrCheckinPage />} />
        </Route>

        {/* Staff only (same roles the API will require with @Roles()) */}
        <Route element={<ProtectedRoute roles={["RECEPTION", "ADMIN"]} />}>
          <Route path="/reception" element={<ReceptionPage />} />
          <Route path="/reception/screen" element={<ReceptionScreenPage />} />
        </Route>

        {/* Admin only: everything reception does, plus accounts */}
        <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
