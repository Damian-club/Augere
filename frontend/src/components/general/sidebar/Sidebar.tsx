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

export default function Sidebar() {
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
          <button>
            <IoHomeOutline size={18} /> Inicio
          </button>
          <button className={styles.active}>
            <IoBookOutline size={18} /> Cursos
          </button>
          <button>
            <IoSettingsOutline size={18} /> Configuración
          </button>
        </nav>
      </div>

      {/* Usuario */}
      <div className={styles.user}>
        <div className={styles.userContainer}>
          <IoPersonOutline size={18} /> Usuario
        </div>
        <button className={styles.logout}>
          <IoLogOutOutline size={18} />
        </button>
      </div>
    </aside>
  );
}
