"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { user, loading, openLogin } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user && user.username) {
      router.replace(`/profile/${encodeURIComponent(user.username)}`);
    } else {
      router.replace("/");
      openLogin();
    }
  }, [user, loading, router, openLogin]);

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center text-[#B88A32]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#B88A32] border-t-transparent" />
    </div>
  );
}
