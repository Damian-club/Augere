import { BrowserRouter as Router, Routes, Route } from "react-router";
import LandingPage from "./LandingPage";
import Login from "./components/page/auth/Login";

function App() {
  return (
    <Router basename="/Augere">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
