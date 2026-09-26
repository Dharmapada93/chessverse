import React from "react";
import Link from "next/link";
import { 
  Zap, 
  Users, 
  Eye, 
  Cpu, 
  MessageSquare, 
  Bot, 
  Award, 
  Palette, 
  Trophy, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { FEATURE_METADATA } from "@/config/features";

export const metadata = {
  title: "Features — 100% Free Chess Platform | ChessVerse",
  description: "Explore all features included with ChessVerse. Real-time games, deep AI analysis, master-strength bots, puzzles, and board themes — completely free forever.",
};

const FEATURES_LIST = [
  {
    icon: Zap,
    title: "Real-time Chess",
    tagline: "Sub-50ms latency",
    description: "Lightning-fast WebSocket matchmaking, custom time controls (Bullet, Blitz, Rapid, Classical), and instant reconnect recovery.",
    highlights: ["Custom time controls", "Private room lobbies", "Zero lag move sync"],
  },
  {
    icon: Eye,
    title: "Live Spectating",
    tagline: "Watch in real time",
    description: "Follow friends and master games live with synchronized board positions, active clocks, move history, and live spectator chat.",
    highlights: ["Real-time move stream", "Captured piece counters", "Spectator chat"],
  },
  {
    icon: Cpu,
    title: "Deep Engine Analysis",
    tagline: "Powered by Stockfish",
    description: "Complete post-game evaluation graphs, brilliant move highlighting, blunder detection, and best alternate line calculations.",
    highlights: ["Accurate move classification", "Evaluation graph", "Centipawn breakdown"],
  },
  {
    icon: MessageSquare,
    title: "AI Chess Coach",
    tagline: "Understand every move",
    description: "Ask your personal chess coach why a move was a mistake, learn tactical concepts, and receive tailored opening advice.",
    highlights: ["Natural language feedback", "Mistake diagnostics", "Tactical patterns"],
  },
  {
    icon: Bot,
    title: "Adaptive AI Opponent",
    tagline: "Play any time",
    description: "Spar against intelligent chess engines tuned from Beginner to Grandmaster difficulty with realistic, human-like playstyles.",
    highlights: ["Multiple difficulty tiers", "Custom time limits", "Immediate rematch"],
  },
  {
    icon: Award,
    title: "Tactical Puzzles",
    tagline: "Sharpen your tactics",
    description: "Solve handpicked daily tactical puzzles, adaptive rating-based puzzles, and turn your own game blunders into training exercises.",
    highlights: ["Daily puzzles", "Tactical theme filtering", "Adaptive rating progression"],
  },
  {
    icon: Palette,
    title: "Board Customization",
    tagline: "All themes included",
    description: "Personalize your playing experience with premium board themes including Midnight, Emerald, Slate, Ocean, Rosewood, and Classic.",
    highlights: ["All board styles unlocked", "Piece set selection", "Sound & coordinate options"],
  },
  {
    icon: Users,
    title: "Friends & Social Lobbies",
    tagline: "Connect & challenge",
    description: "Add friends, monitor online presence, send 1-click challenge links, and organize private games without restrictions.",
    highlights: ["1-click game links", "Friend presence", "Game challenge alerts"],
  },
  {
    icon: Trophy,
    title: "Community Tournaments",
    tagline: "Compete together",
    description: "Participate in or host bracket-style and Swiss-system tournaments for clubs, friends, and competitive communities.",
    highlights: ["Automated pairings", "Live standings", "Spectator-friendly"],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen text-[var(--color-text)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-[var(--color-border)]">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-serif font-bold text-xl tracking-tight text-[var(--color-text)] group-hover:text-[#B58A3A] transition-colors">
              Chess<span className="text-[#B58A3A]">Verse</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/play"
              className="px-4 py-2 rounded-[12px] bg-[#18352B] text-[#FBF9F3] text-xs font-semibold hover:bg-[#285443] transition-colors shadow-sm"
            >
              Enter Club
            </Link>
          </div>
        </div>

        {/* Header Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#27815D]/10 border border-[#27815D]/20 text-[#27815D] dark:text-[#52B788] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            100% Free Forever • Zero Paywalls
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-extrabold tracking-tight text-[var(--color-text)]">
            Everything Included. <br className="hidden sm:inline" />
            <span className="text-[#B58A3A]">
              No Subscriptions. No Limits.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed">
            ChessVerse gives you everything you need to play, watch, and improve — completely free. 
            No premium tiers, no credit card required, and no artificial restrictions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/play"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] bg-[#18352B] hover:bg-[#285443] text-[#FBF9F3] font-bold transition-colors shadow-md shadow-[#18352B]/10"
            >
              Play Chess
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/friends"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] bg-[#FBF9F3] dark:bg-[#21332B] hover:bg-[#EDE9DE] dark:hover:bg-[#1B2A24] text-[var(--color-text)] font-semibold border border-[var(--color-border)] transition-colors shadow-sm"
            >
              <Users className="w-4 h-4 text-[#27815D]" />
              Play With Friends
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES_LIST.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className="group relative rounded-[14px] border border-[var(--color-border)] bg-[#FBF9F3] dark:bg-[#21332B] p-6 backdrop-blur transition-all duration-200 hover:shadow-lg shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-[12px] bg-[#EDE9DE] dark:bg-[#18352B] text-[#B58A3A] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#27815D] bg-[#27815D]/10 px-2.5 py-0.5 rounded-full border border-[#27815D]/20">
                    Free
                  </span>
                </div>
                
                <h3 className="text-lg font-serif font-bold text-[var(--color-text)] mb-1 group-hover:text-[#B58A3A] transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs font-medium text-[#B58A3A] mb-3 uppercase tracking-wider">
                  {feat.tagline}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
                  {feat.description}
                </p>

                <div className="space-y-1.5 border-t border-[var(--color-border)] pt-3">
                  {feat.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[var(--color-text)]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#27815D] flex-shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust & Craftsmanship Banner */}
        <div className="rounded-[20px] border border-[var(--color-border)] bg-[#F7F4EC] dark:bg-[#1B2A24] p-8 sm:p-10 text-center space-y-6 shadow-sm">
          <div className="inline-flex p-3 rounded-[14px] bg-[#EDE9DE] dark:bg-[#21332B] border border-[var(--color-border)] text-[#B58A3A]">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-text)]">
              Crafted for Players, Not Subscriptions
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
              We believe a world-class chess platform shouldn&apos;t lock board themes, analysis, or coach explanations behind paywalls. 
              Enjoy state-of-the-art UI, lightning-fast gameplay, and deep insights freely.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-[var(--color-text-secondary)] font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#27815D]" /> No ads
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#27815D]" /> No subscriptions
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#27815D]" /> Stockfish 16 engine
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#27815D]" /> Open community
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
