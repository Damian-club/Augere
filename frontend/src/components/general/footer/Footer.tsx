import Logo from "../../../assets/logo.svg";
import { BiLogoFacebook, BiLogoInstagram, BiLogoTwitter } from "react-icons/bi";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={`${styles["section"]} ${styles["footer"]}`}>
      {/* Primera Columna */}
      <div className={`${styles["info_container"]}`}>
        <div className={`${styles["logo_container"]}`}>
          <div className={`${styles["logo_img_container"]}`}>
            <img src={Logo} alt="Logo Augere" />
          </div>
          <span>Augere</span>
        </div>
        <ul className={`${styles["menu"]}`}>
          <li>
            <a href="#">Caracteristicas</a>
          </li>
          <li>
            <a href="#">Inicio</a>
          </li>
          <li>
            <a href="#">Sobre Nosotros</a>
          </li>
        </ul>
      </div>
      {/* Segunda Columna */}
      <div className={`${styles["links_container"]}`}>
        <ul className={`${styles["links"]}`}>
          <li className="list_item">
            <a href="#" className={`${styles["facebook"]}`}>
              <BiLogoFacebook />
            </a>
          </li>
          <li className="list_item">
            <a href="#" className={`${styles["instagram"]}`}>
              <BiLogoInstagram />
            </a>
          </li>
          <li className="list_item">
            <a href="#" className={`${styles["twitter"]}`}>
              <BiLogoTwitter />
            </a>
          </li>
        </ul>
        <a href="" className={`${styles["links__politicas"]}`}>
          Política de privacidad y condiciones de uso
        </a>
      </div>
      {/* Tercera Columna */}
      <div className={`${styles["contact_container"]}`}>
        <p>
          Linea telefonica:{" "}
          <a href="tel:+57 (601) 420 4007">+57 (601) 420 4007</a>
        </p>
        <p>
          E-mail: <a href="mailto:contacto@augere.com">contacto@augere.com</a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
