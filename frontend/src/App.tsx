import "./App.css";
import Footer from "./components/general/footer/Footer";
import Navbar from "./components/general/navbar/Navbar";
import Block from "./components/landing/block/Block";

function App() {
  return (
    <>
      {/* HEADER */}
      <header>
        <Navbar />
      </header>
      {/* MAIN */}
      <main className="main">
        {/* PRINCIPAL */}
        <section className="main__entry">
          <h1 className="main__entry-title gradient-background">
            Tutor virtual con IA
          </h1>

          <img
            src="https://placehold.co/1200x600/png"
            alt="Imagen Principal Augere"
            className="main__entry-imagen"
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
      </main>
      {/* FOOTER */}
      <Footer />
    </>
  );
}

export default App;
