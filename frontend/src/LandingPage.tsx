import styles from "./App.module.css";
import Footer from "./components/general/footer/Footer";
import Navbar from "./components/general/navbar/Navbar";
import Block from "./components/landing/block/Block";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <>
      {/* HEADER */}
      <header>
        <Navbar />
      </header>
      {/* MAIN */}
      <main className={styles.main}>
        {/* PRINCIPAL */}
        <section className={styles["main__entry"]}>
          <h1
            className={`${styles["main__entry-title"]} ${styles["gradient-background"]}`}
          >

            Tutor virtual con IA
            <div>
              <Link to="/login">AASd</Link>

            </div>
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

        {/* <Form isLogin={true}/>
        <Form isLogin={false}/> */}

        {/* <Auth /> */}
      </main>
      {/* FOOTER */}
      <Footer />
    </>
  );
}

export default LandingPage;
