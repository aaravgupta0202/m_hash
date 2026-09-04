import { Navigate, Route, Routes } from "react-router-dom";
import SecurityShell from "./layouts/SecurityShell";
import AppShell from "./layouts/AppShell";

import Overview from "./pages/security/Overview";
import Alerts from "./pages/security/Alerts";
import AlertDetail from "./pages/security/AlertDetail";
import Users from "./pages/security/Users";
import UserDetail from "./pages/security/UserDetail";
import Timeline from "./pages/security/Timeline";
import Events from "./pages/security/Events";
import Simulations from "./pages/security/Simulations";
import SettingsPage from "./pages/security/Settings";

import Social from "./pages/apps/Social";
import Gmail from "./pages/apps/Gmail";
import Finance from "./pages/apps/Finance";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/security/overview" replace />} />

      <Route path="/security" element={<SecurityShell />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="alerts/:id" element={<AlertDetail />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="events" element={<Events />} />
        <Route path="simulations" element={<Simulations />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="/apps" element={<AppShell />}>
        <Route index element={<Navigate to="social" replace />} />
        <Route path="social" element={<Social />} />
        <Route path="gmail" element={<Gmail />} />
        <Route path="finance" element={<Finance />} />
      </Route>

      <Route path="*" element={<Navigate to="/security/overview" replace />} />
    </Routes>
  );
}
