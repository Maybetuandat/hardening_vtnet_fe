import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";

import "./i18n";

import HomePage from "./app/dashboard";
import SystemHardeningDashboard from "./app/dashboard";
import WorkloadsPage from "./app/workload/work-loads-page";
import ServersPage from "./app/server/server-page";
import SecurityStandardPage from "./app/security-standard/security-standard";
import NotFoundPage from "./app/404/not-found-page";
import AddWorkloadPage from "./app/workload/add-workload-page";
import WorkloadDetailPage from "./app/workload/workload-detail-page";

function App() {
  return (
    <Router>
      <Routes>
        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <MainLayout>
              <SystemHardeningDashboard />
            </MainLayout>
          }
        />

        <Route
          path="/"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />

        <Route
          path="/workloads"
          element={
            <MainLayout>
              <WorkloadsPage />
            </MainLayout>
          }
        />

        <Route
          path="/workload/:id"
          element={
            <MainLayout>
              <WorkloadDetailPage />
            </MainLayout>
          }
        />
        <Route
          path="/workload/add"
          element={
            <MainLayout>
              <AddWorkloadPage />
            </MainLayout>
          }
        />
        <Route
          path="/servers"
          element={
            <MainLayout>
              <ServersPage />
            </MainLayout>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
