import { useState } from "react";
import "./Login.module.css";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      <div className={`card ${isLogin ? "" : "flipped"}`}>
        {/* Login */}
        <div className="card-face card-front">
          <h2>
            INICIAR <span className="blue">SESIÓN</span>
          </h2>
          <form>
            <input type="text" placeholder="Nombre" />
            <input type="password" placeholder="Contraseña" />
            <button type="button">Ingreso</button>
            <p className="link">¿Olvidaste tu contraseña?</p>
          </form>
        </div>

        {/* Registro */}
        <div className="card-face card-back">
          <h2>
            CREAR <span className="blue">CUENTA</span>
          </h2>
          <form>
            <input type="email" placeholder="Correo" />
            <input type="text" placeholder="Nombre" />
            <input type="password" placeholder="Contraseña" />
            <button type="button">Registrarse</button>
          </form>
        </div>
      </div>

      {/* Botón toggle */}
      <button className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
        {isLogin
          ? "¿Nuevo aquí? Regístrate"
          : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </div>
  );
}
