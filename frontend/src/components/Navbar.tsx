import logo from "../assets/logo.svg";

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Logo y Nombre */}
      <div className="navbar__brand">
        <img src={logo} alt="Logo" className="navbar__logo" />
        <span className="navbar__title">Augere</span>
      </div>
      {/* Links Navegación */}
      <ul className="navbar__links">
        <li className="navbar__item">
          <a href="#" className="navbar__link">
            Contáctanos
          </a>
        </li>
        <li className="navbar__item">
          <a href="#" className="navbar__link">
            Características
          </a>
        </li>
        <li className="navbar__item">
          <a href="#" className="navbar__link">
            Sobre nosotros
          </a>
        </li>
      </ul>
      {/* Boton Login */}
      <button className="navbar__button">Ingresar</button>
    </nav>
  );
};

export default Navbar;
