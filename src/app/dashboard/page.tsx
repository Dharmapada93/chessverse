import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import StatsRow from "@/components/shared/StatsRow";
import QuickActions from "@/components/shared/QuickActions";
import LiveMatches from "@/components/shared/LiveMatches";
import OnlineFriends from "@/components/shared/OnlineFriends";
import RecentGames from "@/components/shared/RecentGames";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-[#f4f1e9]">
      <AppSidebar />

      <div className="min-w-0 flex-1">
        <AppHeader />

        <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
          <StatsRow />

          <div className="mt-8">
            <QuickActions />
          </div>

          <div className="mt-12 grid gap-10 xl:grid-cols-[1.5fr_1fr]">
            <LiveMatches />
            <OnlineFriends />
          </div>

          <div className="mt-12 max-w-2xl">
            <RecentGames />
          </div>
        </main>
      </div>
    </div>
  );
}
