import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Acknowledgement from "@/components/Acknowledgement";
import AboutFreya from "@/components/AboutFreya";
import FridayLunchies from "@/components/FridayLunchies";
import Impact from "@/components/Impact";
import Gallery from "@/components/Gallery";
import HowToHelp from "@/components/HowToHelp";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <main className="bg-cream text-ink min-h-screen" data-testid="landing-page">
      <Header />
      <Hero />
      <Acknowledgement />
      <AboutFreya />
      <FridayLunchies />
      <Impact />
      <Gallery />
      <HowToHelp />
      <Footer />
    </main>
  );
}
