import LenisProvider from "@/components/motion/LenisProvider";
import CustomCursor from "@/components/motion/CustomCursor";
import Loader from "@/components/layout/Loader";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import MarqueeSection from "@/components/sections/MarqueeSection";
import ProductMatrix from "@/components/sections/ProductMatrix";
import StatsSection from "@/components/sections/StatsSection";
import VisionSection from "@/components/sections/VisionSection";
import ContactCTA from "@/components/sections/ContactCTA";
import { HOME_CONTENT } from "@/lib/dummy-content";

export default function HomePage() {
  return (
    <LenisProvider>
      <Loader />
      <CustomCursor />
      <Nav />
      <main>
        <Hero content={HOME_CONTENT.hero} variant="A" />
        <MarqueeSection items={HOME_CONTENT.marquee} />
        <ProductMatrix products={HOME_CONTENT.products} />
        <StatsSection stats={HOME_CONTENT.stats} />
        <VisionSection text={HOME_CONTENT.vision} />
        <ContactCTA />
      </main>
      <Footer />
    </LenisProvider>
  );
}
