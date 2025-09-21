import { BrowserRouter, Routes, Route } from "react-router";
import LandingPage from "./LandingPage";
import Login from "./components/page/auth/Login";
import Navbar from "./components/general/navbar/Navbar";
import Footer from "./components/general/footer/Footer";

function App() {
  return (
    <BrowserRouter>
      {/* HEADER */}
      <header>
        <Navbar />
      </header>

      {/* Aquí es donde se renderizará el contenido de la página */}
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>

      {/* FOOTER */}
      <Footer />
    </BrowserRouter>
  );
}

export default App;
