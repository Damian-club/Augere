import { NavLink, useNavigate } from "react-router-dom";
import Logo from "../../../assets/logo.svg";
import styles from "./Sidebar.module.css";
import {
  IoHomeOutline,
  IoBookOutline,
  IoSettingsOutline,
  IoSearchOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { useEffect, useState } from "react";
import { authService } from "../../../services";

interface User {
  name: string;
  email: string;
  avatar_path?: string | null;
}

export default function Sidebar() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch {
        setUser(null);
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
          {user ? (
            <>
              <img
                src={
                  user.avatar_path
                    ? user.avatar_path
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.name || "Usuario"
                      )}&background=random`
                }
                alt={user.name}
                className={styles.avatar}
              />
              <span>{user.name}</span>
            </>
          ) : (
            <span>Cargando...</span>
          )}
        </div>
        <button className={styles.logout} onClick={handleLogout}>
          <IoLogOutOutline size={18} />
        </button>
      </div>
    </aside>
  );
}
