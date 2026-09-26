"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "../../admin/components/AdminSidebar/AdminSidebar";
import { AdminHeader } from "../../admin/components/AdminHeader/AdminHeader";
import { apiFetch } from "../../lib/api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthorized(true);
      return;
    }

    // Role verification (R6.2, R6.3, R6.59)
    apiFetch("/api/admin/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && (data.user.role === "admin" || data.user.role === "moderator")) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.push("/admin/login");
        }
      })
      .catch(() => {
        setIsAuthorized(false);
        router.push("/admin/login");
      });
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-sm text-[var(--color-text-secondary)]">
        <span className="inline-block animate-spin mr-2 text-base">◌</span>
        Verifying administrative authorization...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex">
      {/* Desktop & Mobile Drawer Sidebar (R6.51, R6.53) */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Backdrop for Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-[#18352B]/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title="ChessVerse Admin Panel"
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
