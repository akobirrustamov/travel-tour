import { ToastContainer, toast } from "react-toastify";
import Hero from "../components/Hero.jsx";
import About from "../components/About.jsx";
import Tours from "../components/Tours.jsx";
import Gallery from "../components/Gallery.jsx";
import Partners from "../components/Partners.jsx";
import News from "../components/News.jsx";
import Footer from "../components/Footer.jsx";
import WhyUs from "../components/WhyUs.jsx";

function Home() {
  return (
    <div className="min-h-screen select-none">
      <ToastContainer position="top-right" autoClose={2000} />

      <Hero />

      <About />

      <Tours />

      <Partners />

      <Gallery />

      <News />

      <WhyUs />

      <Footer />
    </div>
  );
}

export default Home;
