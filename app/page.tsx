import Hero from "@/components/Hero";
import AITickerBar from "@/components/AITickerBar";
import TrendingFeed from "@/components/TrendingFeed";
import CompactFightWidget from "@/components/CompactFightWidget";

export default function Home() {
  return (
    <>
      <Hero /> {/* <- must be first */}
      <AITickerBar />
      <section className="py-10 flex justify-center">
        <CompactFightWidget />
      </section>
      <section className="py-10">
        <TrendingFeed />
      </section>
    </>
  );
}
