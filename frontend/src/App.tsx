import { BrowserRouter, Routes, Route } from "react-router";
import LandingPage from "./LandingPage";
import Navbar from "./components/general/navbar/Navbar";
import Footer from "./components/general/footer/Footer";
import NotFound from "./components/general/notFound/NotFound";
import styles from "./App.module.css";
import Auth from "./components/page/auth/Auth";

function App() {
  return (
    <BrowserRouter basename="/Augere">
      {/* HEADER */}
      <header>
        <Navbar />
      </header>
      {/* MAIN */}
      <main className={styles["main-content"]}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {/* FOOTER */}
      <Footer />
    </BrowserRouter>
  );
}

export default App;
