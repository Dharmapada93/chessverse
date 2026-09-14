import { notFound } from "next/navigation";

type ProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

async function getProfile(
  username: string,
) {
  try {
    const response = await fetch(
      `http://localhost:4000/api/users/${username}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

async function getStats(
  username: string,
) {
  try {
    const response = await fetch(
      `http://localhost:4000/api/users/${username}/stats`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export default async function ProfilePage({
  params,
}: ProfilePageProps) {
  const { username } =
    await params;

  const [data, statsData] = await Promise.all([
    getProfile(username),
    getStats(username),
  ]);

  if (!data?.user) {
    notFound();
  }

  const user = data.user;
  const stats = statsData?.stats;

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-[#f4f1e9]">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-white/10 bg-[#11110f] p-8">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#d7b875]/30 bg-[#171714] text-2xl font-semibold text-[#d7b875]">
              {user.username
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <h1 className="text-3xl font-semibold">
                {user.username}
              </h1>

              <p className="mt-1 text-white/40">
                ChessVerse player
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-white/10 p-4">
              <p className="text-xs text-white/40">
                Rating
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {stats?.rating ?? user.rating}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 p-4">
              <p className="text-xs text-white/40">
                Games
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {stats ? stats.games : "—"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 p-4">
              <p className="text-xs text-white/40">
                Wins
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {stats ? stats.wins : "—"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 p-4">
              <p className="text-xs text-white/40">
                Win Rate
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {stats ? `${stats.winRate}%` : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
