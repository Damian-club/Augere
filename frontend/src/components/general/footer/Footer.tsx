import { Link } from "react-router-dom";
import Logo from "../../../assets/logo.svg";
import { BiLogoFacebook, BiLogoInstagram, BiLogoYoutube } from "react-icons/bi";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={`${styles.section} ${styles.footer}`}>
      {/* === Columna 1 === */}
      <div className={styles.info_container}>
        <div className={styles.logo_container}>
          <div className={styles.logo_img_container}>
            <img src={Logo} alt="Logo Augere" />
          </div>
          <span>Augere</span>
        </div>

        <ul className={styles.menu}>
          <li><Link to="#">Características</Link></li>
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="#">Sobre Nosotros</Link></li>
        </ul>
      </div>

      {/* === Columna 2 === */}
      <div className={styles.links_container}>
        <ul className={styles.links}>
          <li>
            <a href="#" className={styles.facebook}><BiLogoFacebook /></a>
          </li>
          <li>
            <a href="#" className={styles.instagram}><BiLogoInstagram /></a>
          </li>
          <li>
            <a href="#" className={styles.youtube}><BiLogoYoutube /></a>
          </li>
        </ul>

        <Link to="#" className={styles.links__politicas}>
          Política de privacidad y condiciones de uso
        </Link>
      </div>

      {/* === Columna 3 === */}
      <div className={styles.contact_container}>
        <Link to="/contact" className={styles.contact_link}>
          Contáctanos
        </Link>
      </div>
    </footer>
  );
}
