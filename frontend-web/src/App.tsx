import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { LoadingPanel } from "./components/StateViews";
import AppLayout from "./components/AppLayout";
import { useAuthStore } from "./store/auth";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Complaints = lazy(() => import("./pages/Complaints"));
const Bills = lazy(() => import("./pages/Bills"));
const Visitors = lazy(() => import("./pages/Visitors"));
const Notices = lazy(() => import("./pages/Notices"));
const Residents = lazy(() => import("./pages/Residents"));
const AI = lazy(() => import("./pages/AI"));
const Admin = lazy(() => import("./pages/Admin"));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Suspense fallback={<LoadingPanel />}><Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="bills" element={<Bills />} />
        <Route path="visitors" element={<Visitors />} />
        <Route path="notices" element={<Notices />} />
        <Route path="residents" element={<Residents />} />
        <Route path="ai" element={<AI />} />
        <Route path="admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes></Suspense>
  );
}
