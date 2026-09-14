import Navbar from "@/components/navigation/Navbar";
import Hero from "@/components/shared/Hero";
import LiveMatchPreview from "@/components/chess/LiveMatchPreview";
import FeatureSection from "@/components/shared/FeatureSection";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0a0a0a] text-[#f4f1e9]">
      <Navbar />

      <Hero />

      <LiveMatchPreview />

      <FeatureSection />

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 text-xs text-white/30 lg:px-10">
          <span>ChessVerse</span>
          <span>Play. Watch. Connect.</span>
        </div>
      </footer>
    </main>
  );
}
