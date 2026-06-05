import styles from "./App.module.css";
import Block from "./components/landing/block/Block";
import heroImage from "./assets/1.png";
import mockup2 from "./assets/mockup2.png";
import mockup4 from "./assets/mockup4.png";

import { useEffect, useState } from "react";

function LandingPage() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <section className={styles["main__entry"]}>
        <h1 className={styles["main__entry-title"]}>
          Tutor virtual con IA
        </h1>
        <div
          className={styles["parallax-wrapper"]}
          style={{
            transform: `translateY(${offset * 0.08}px)`,
          }}
        >
          <div className={styles["image-wrapper"]}>
            <img
              src={heroImage}
              alt="Imagen principal Augere"
              className={styles["main__entry-image"]}
            />
          </div>
        </div>
      </section>

      <Block
        title="Aprende mejor"
        description="Aprende eficientemente con tu nuevo tutor con inteligencia artificial"
        src={mockup2}
        reverse={false}
      />

      <Block
        title="Feedback inteligente"
        description="Recibe retroalimentación al instante, aprende de tus errores"
        src={mockup4}
        reverse={true}
      />
    </>
  );
}

export default LandingPage;