import Logo from "../../../assets/logo.svg";
import { BiLogoFacebook, BiLogoInstagram, BiLogoTwitter } from "react-icons/bi";

function Footer() {
  return (
    <footer>
      {/* Primera Columna */}
      <div>
        <div>
          <div>
            <img src={Logo} alt="Logo Augere" />
          </div>
          <span>Augere</span>
        </div>
        <ul>
          <li>Caracteristicas</li>
          <li>Inicio</li>
          <li>Sobre Nosotros</li>
        </ul>
      </div>
      {/* Segunda Columna */}
      <div>
        <ul>
          <li>
            <a href="#">
              <BiLogoFacebook />
            </a>
          </li>
          <li>
            <a href="#">
              <BiLogoInstagram />
            </a>
          </li>
          <li>
            <a href="#">
              <BiLogoTwitter />
            </a>
          </li>
        </ul>
        <a href="">Política de privacidad y condiciones de uso</a>
      </div>
      {/* Tercera Columna */}
      <div>
        <p>Linea telefonica: +57 (601) 420 4007</p>
        <p>E-mail: contacto@augere.com</p>
      </div>
    </footer>
  );
}

export default Footer;
