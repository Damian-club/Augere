import styles from "./App.module.css";
import Block from "./components/landing/block/Block";

function LandingPage() {
  return (
    <>
      {/* PRINCIPAL */}
      <section className={styles["main__entry"]}>
        <h1
          className={`${styles["main__entry-title"]} ${styles["gradient-background"]}`}
        >
          Tutor virtual con IA
        </h1>

        <img
          src="https://placehold.co/1200x600/png"
          alt="Imagen Principal Augere"
          className={styles["main__entry-imagen"]}
        />
      </section>
      {/* BLOCKS */}
      <Block
        title="Aprende mejor"
        description="Aprende eficientemente con tu nuevo tutor con inteligencia artificial"
        src="https://placehold.co/1200x600/png"
        reverse={false}
      />
      <Block
        title="Feedback inteligente"
        description="Recibe retroalimentación al instante, aprende de tus errores"
        src="https://placehold.co/1200x600/png"
        reverse={true}
      />
    </>
  );
}

export default LandingPage;
