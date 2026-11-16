import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/page";
import DashboardPage from "./pages/dashboard/page";
import QrCheckinPage from "./pages/checkin/page";
import AdminPage from "./pages/admin/page";
import ReceptionPage from "./pages/reception/page";
import ReceptionScreenPage from "./pages/reception/screen/page";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Any logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* Link inside the reception QR; login (if needed) comes back here */}
          <Route path="/c/:token" element={<QrCheckinPage />} />
        </Route>

        {/* Staff only (same roles the API will require with @Roles()) */}
        <Route element={<ProtectedRoute roles={["RECEPTION", "ADMIN"]} />}>
          <Route path="/reception" element={<ReceptionPage />} />
          <Route path="/reception/screen" element={<ReceptionScreenPage />} />
        </Route>

        {/* Admin only: accounts */}
        <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
