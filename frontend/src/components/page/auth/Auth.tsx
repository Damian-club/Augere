import { useState } from "react";
import styles from "./Auth.module.css";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className={styles.authContainer}>
      <div className={styles.card}>
        <div
          className={`${styles.cardInner} ${!isLogin ? styles.flipped : ""}`}
        >
          {/* --- LOGIN --- */}
          <div className={`${styles.cardFace} ${styles.cardFront}`}>
            <h2 className={`${styles.authTitle}`}>
              INICIAR <span className={styles.blue}>SESIÓN</span>
            </h2>
            <form className={`${styles.authForm}`}>
              <input
                className={`${styles.authImputs}`}
                type="text"
                placeholder="Nombre"
              />
              <input
                className={`${styles.authImputs}`}
                type="password"
                placeholder="Contraseña"
              />
              <button className={`${styles.authBtnAuth}`} type="button">
                Ingreso
              </button>
              <p className={styles.link}>¿Olvidaste tu contraseña?</p>
            </form>
          </div>

          {/* --- REGISTRO --- */}
          <div className={`${styles.cardFace} ${styles.cardBack}`}>
            <h2 className={`${styles.authTitle}`}>
              CREAR <span className={styles.blue}>CUENTA</span>
            </h2>
            <form className={`${styles.authForm}`}>
              <input
                className={`${styles.authImputs}`}
                type="email"
                placeholder="Correo"
              />
              <input
                className={`${styles.authImputs}`}
                type="text"
                placeholder="Nombre"
              />
              <input
                className={`${styles.authImputs}`}
                type="password"
                placeholder="Contraseña"
              />
              <button className={`${styles.authBtnAuth}`} type="button">
                Registrarse
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Botón toggle */}
      <button
        className={`${styles.authBtnAuth} ${styles.toggleBtn}`}
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin
          ? "¿Nuevo aquí? Regístrate"
          : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </div>
  );
}
