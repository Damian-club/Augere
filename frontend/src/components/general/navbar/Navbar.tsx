import { Link } from "react-router-dom";
import logo from "../../../assets/logo.svg";
import styles from "./Navbar.module.css";

const Navbar = () => {
  return (
    <nav className={styles["navbar"]}>
      {/* Logo y Nombre */}
      <div className={styles["navbar__brand"]}>
        <img src={logo} alt="Logo" className={styles["navbar__logo"]} />
        <span className={styles["navbar__title"]}>Augere</span>
      </div>
      {/* Links Navegación */}
      <ul className={styles["navbar__links"]}>
        <li className={styles["navbar__item"]}>
          <a href="#" className={styles["navbar__link"]}>
            {/* Contáctanos */}
            Inicio
          </a>
        </li>
        <li className={styles["navbar__item"]}>
          <a href="#" className={styles["navbar__link"]}>
            Características
          </a>
        </li>
        <li className={styles["navbar__item"]}>
          <a href="#" className={styles["navbar__link"]}>
            Sobre nosotros
          </a>
        </li>
      </ul>
      {/* Boton Login */}
      <Link to="/auth" className={styles["navbar__button"]}>
        Ingresar
      </Link>
    </nav>
  );
};

export default Navbar;
