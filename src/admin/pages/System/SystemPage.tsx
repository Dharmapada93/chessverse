"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchSystemSettings, updateSystemSetting } from "../../services/system";
import { ConfirmDialog } from "../../components";

export const SystemPage: React.FC = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceNotice, setMaintenanceNotice] = useState("ChessVerse is temporarily unavailable for scheduled maintenance.");
  const [allowGuestPlay, setAllowGuestPlay] = useState(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(120);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    fetchSystemSettings()
      .then((res) => {
        if (res.success && res.settings) {
          const maint = res.settings.find((s: any) => s.key === "maintenance_mode");
          if (maint) {
            setMaintenanceMode(Boolean(maint.value?.enabled));
            if (maint.value?.notice) setMaintenanceNotice(maint.value.notice);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleMaintenanceToggle = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmMaintenance = async () => {
    setIsSaving(true);
    try {
      await updateSystemSetting(
        "maintenance_mode",
        { enabled: !maintenanceMode, notice: maintenanceNotice },
        "maintenance",
        "Toggles maintenance banner and prevents non-admin player actions"
      );
      setMaintenanceMode(!maintenanceMode);
      setIsConfirmOpen(false);
      setSaveSuccess(`Maintenance mode ${!maintenanceMode ? "ENABLED" : "DISABLED"}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
            System Configuration & Platform Controls
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Platform-wide maintenance flags, session parameters, and operational controls.
          </p>
        </div>

        <Link
          href="/admin/system/health"
          className="px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>🩺</span> View Live Health Telemetry →
        </Link>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-[var(--radius-md)] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          ✓ {saveSuccess}
        </div>
      )}

      {/* Maintenance Mode Card (R6.39) */}
      <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
              <span>Maintenance Mode</span>
              {maintenanceMode && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  ACTIVE
                </span>
              )}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              When active, non-admin players see a maintenance banner. Administrators retain panel access.
            </p>
          </div>

          <button
            onClick={handleMaintenanceToggle}
            className={`px-4 py-2 text-xs font-semibold rounded-[var(--radius-md)] transition-colors self-start sm:self-auto ${
              maintenanceMode
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
            }`}
          >
            {maintenanceMode ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <label className="block font-medium text-[var(--color-text)]">
            Maintenance Notice Message
          </label>
          <input
            type="text"
            value={maintenanceNotice}
            onChange={(e) => setMaintenanceNotice(e.target.value)}
            disabled={maintenanceMode}
            className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] disabled:opacity-50"
          />
        </div>
      </div>

      {/* Security & Sessions Parameters */}
      <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
        <div className="border-b border-[var(--color-border)] pb-3">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Security & Session Parameters</h3>
          <p className="text-xs text-[var(--color-text-secondary)]">Session timeouts and authentication policies</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-[var(--color-text)] mb-1">
              Admin Session Lifetime (Minutes)
            </label>
            <input
              type="number"
              value={sessionTimeoutMinutes}
              onChange={(e) => setSessionTimeoutMinutes(parseInt(e.target.value, 10))}
              className="w-full px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
            />
            <span className="text-[10px] text-[var(--color-text-secondary)]">Short lifetime for admin sessions (R6.8)</span>
          </div>

          <div>
            <label className="block font-medium text-[var(--color-text)] mb-1">
              Anonymous Guest Matches
            </label>
            <select
              value={allowGuestPlay ? "allowed" : "disallowed"}
              onChange={(e) => setAllowGuestPlay(e.target.value === "allowed")}
              className="w-full px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
            >
              <option value="allowed">Allowed (Zero Friction)</option>
              <option value="disallowed">Require Registered Account</option>
            </select>
            <span className="text-[10px] text-[var(--color-text-secondary)]">Permits unauthenticated instant play</span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={maintenanceMode ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
        message={
          maintenanceMode
            ? "Disabling maintenance mode will restore standard player access immediately."
            : "Enabling maintenance mode will show an outage screen to regular players while keeping the admin control center accessible."
        }
        confirmLabel={maintenanceMode ? "Disable" : "Enable Maintenance"}
        isDangerous={!maintenanceMode}
        onConfirm={handleConfirmMaintenance}
        onCancel={() => setIsConfirmOpen(false)}
        isLoading={isSaving}
      />
    </div>
  );
};
