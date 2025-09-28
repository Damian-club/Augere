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

function App() {
  return (
    <BrowserRouter basename="/augere">
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <LandingPage />
            </MainLayout>
          }
        />

        <Route
          path="/auth"
          element={
            <MainLayout>
              <Auth />
            </MainLayout>
          }
        />

        <Route
          path="/courses"
          element={
            <DashboardLayout>
              <CoursesPage />
            </DashboardLayout>
          }
        />

        <Route
          path="*"
          element={
            <MainLayout>
              <NotFound />
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
