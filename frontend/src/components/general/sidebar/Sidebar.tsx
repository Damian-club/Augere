import { NavLink, useNavigate } from "react-router-dom";
import Logo from "../../../assets/logo.svg";
import styles from "./Sidebar.module.css";
import {
  IoHomeOutline,
  IoBookOutline,
  IoSettingsOutline,
  IoPersonOutline,
  IoSearchOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { useEffect, useState } from "react";
import { authService } from "../../../services";

export default function Sidebar() {
  const [userName, setUserName] = useState<String>("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        setUserName(user.name);
      } catch {
        setUserName("Usuario");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/auth");
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <img src={Logo} alt="Logo" className={styles.logoImg} />
        <span>Augere</span>
      </div>

      <div className={styles.linkAndSearch}>
        {/* Buscador */}
        <div className={styles.search}>
          <IoSearchOutline size={18} className={styles.searchIcon} />
          <input type="text" placeholder="Buscar..." />
        </div>

        {/* Menu */}
        <nav className={styles.menu}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            <IoHomeOutline size={18} /> Inicio
          </NavLink>
          <NavLink
            to="/courses"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            <IoBookOutline size={18} /> Cursos
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            <IoSettingsOutline size={18} /> Configuración
          </NavLink>
        </nav>
      </div>

      {/* Usuario */}
      <div className={styles.user}>
        <div className={styles.userContainer}>
          <IoPersonOutline size={18} /> {userName || "Cargando..."}
        </div>
        <button className={styles.logout} onClick={handleLogout}>
          <IoLogOutOutline size={18} />
        </button>
      </div>
    </aside>
  );
}
