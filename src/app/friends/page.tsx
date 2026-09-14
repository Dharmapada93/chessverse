"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Friend = {
  _id: string;
  username: string;
  rating: number;
  avatar?: string;
};

export default function FriendsPage() {
  const [friends, setFriends] =
    useState<Friend[]>([]);

  useEffect(() => {
    async function loadFriends() {
      try {
        const response =
          await apiFetch(
            "/api/social/friends",
          );

        const data =
          await response.json();

        if (data.success) {
          setFriends(data.friends);
        }
      } catch {
        // Handled silently
      }
    }

    loadFriends();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-10 text-[#f4f1e9]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#d7b875]">
            Social
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Friends
          </h1>

          <p className="mt-2 text-white/40">
            Play, watch and compete with
            people you know.
          </p>
        </div>

        <div className="space-y-3">
          {friends.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#11110f] p-8 text-white/40">
              You haven&apos;t added any friends
              yet.
            </div>
          ) : (
            friends.map((friend) => (
              <div
                key={friend._id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-[#11110f] p-4"
              >
                <div>
                  <p className="font-medium">
                    {friend.username}
                  </p>

                  <p className="mt-1 text-sm text-white/40">
                    Rating {friend.rating}
                  </p>
                </div>

                <button className="rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5">
                  Challenge
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
