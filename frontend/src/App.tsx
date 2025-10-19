// import { BrowserRouter, Routes, Route } from "react-router";
// import LandingPage from "./LandingPage";
// import Navbar from "./components/general/navbar/Navbar";
// import Footer from "./components/general/footer/Footer";
// import NotFound from "./components/general/notFound/NotFound";
// import styles from "./App.module.css";
// import Auth from "./components/page/auth/Auth";

// function App() {
//   return (
//     <BrowserRouter basename="/Augere">
//       {/* HEADER */}
//       <header>
//         <Navbar />
//       </header>
//       {/* MAIN */}
//       <main className={styles["main-content"]}>
//         <Routes>
//           <Route path="/" element={<LandingPage />} />

//           <Route path="/auth" element={<Auth />} />
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </main>
//       {/* FOOTER */}
//       <Footer />
//     </BrowserRouter>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import NotFound from "./components/general/notFound/NotFound";
import Auth from "./components/page/auth/Auth";
import CoursesPage from "./components/page/courses/CoursesPage";

import MainLayout from "./components/layout/mainLayout/MainLayout";
import DashboardLayout from "./components/layout/dashboardLayout/DashboardLayout";
import DashboardHome from "./components/page/dashboard/DashboardHome";
import DashboardSettings from "./components/page/settings/DashboardSettings";
import Contact from "./components/page/contact/Contact";

function App() {
  return (
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
          <DashboardLayout>
            <CoursesPage />
          </DashboardLayout>
        }
      />
      {/* DASHBOARD INICIO */}
      <Route
        path="/dashboard"
        element={
          <DashboardLayout>
            <DashboardHome />
          </DashboardLayout>
        }
      />
      {/* DASHBOARD CONFIGURACIÓN */}
      <Route
        path="/settings"
        element={
          <DashboardLayout>
            <DashboardSettings />
          </DashboardLayout>
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
  );
}

export default App;
