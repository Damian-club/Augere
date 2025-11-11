// export default App;

import { Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import NotFound from "./components/general/notFound/NotFound";
import Auth from "./components/page/auth/Auth";
import CoursesPage from "./components/page/courses/CoursesPage";

import MainLayout from "./components/layout/mainLayout/MainLayout";
import DashboardLayout from "./components/layout/dashboardLayout/DashboardLayout";
import DashboardHome from "./components/page/dashboard/DashboardHome";
import DashboardSettings from "./components/page/settings/DashboardSettings";
import Contact from "./components/page/contact/Contact";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import SchemaPreviewTest from "./components/page/test/SchemaPreviewTest";
import CourseDashboard from "./components/page/courses/CourseDashboard copy";

function App() {
  return (
    <>
      <Routes>
        {/* LANDING PAGE */}
        <Route
          path="/"
          element={
            <MainLayout>
              <LandingPage />
            </MainLayout>
          }
        />
        {/* AUTH */}
        <Route
          path="/auth"
          element={
            <MainLayout>
              <Auth />
            </MainLayout>
          }
        />
        {/* DASHBOARD COURSES */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CoursesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* DASHBOARD INICIO */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardHome />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* DASHBOARD CONFIGURACIÓN */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardSettings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* CONTACT FORM */}
        <Route
          path="/contact"
          element={
            <MainLayout>
              <Contact />
            </MainLayout>
          }
        />
        <Route path="/course/:uuid" element={<CourseDashboard />} />
        {/* <Route path="/schema-test" element={<SchemaPreviewTest />} /> */}
        {/* 404 */}
        <Route
          path="*"
          element={
            <MainLayout>
              <NotFound />
            </MainLayout>
          }
        />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#f9fafb",
            color: "#111",
            borderRadius: "8px",
            padding: "10px 16px",
            fontSize: "0.9rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          },
          success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />
    </>
  );
}

export default App;
