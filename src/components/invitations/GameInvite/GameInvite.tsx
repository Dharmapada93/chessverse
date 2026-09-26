"use client";

import React, { useState, useEffect } from "react";
import { Swords, Check, X, Clock } from "lucide-react";
import type { GameInviteProps } from "./types";

export function GameInvite({
  invitation,
  onAccept,
  onDecline,
}: GameInviteProps) {
  const [timeLeftSec, setTimeLeftSec] = useState(60);

  useEffect(() => {
    const expires = new Date(invitation.expiresAt).getTime();
    function update() {
      const remaining = Math.max(0, Math.floor((expires - Date.now()) / 1000));
      setTimeLeftSec(remaining);
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [invitation.expiresAt]);

  const initialMinutes = Math.round(invitation.timeControl.initialTime / 60000);
  const timeControlLabel = `${initialMinutes}+${invitation.timeControl.increment}`;

  return (
    <div className="p-4 rounded-[14px] bg-[#FBF9F3] dark:bg-[#21332B] border border-[#B58A3A]/40 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] bg-[#EDE9DE] dark:bg-[#18352B] flex items-center justify-center text-[#B58A3A]">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-serif font-bold text-[var(--color-text)]">
              Chess Challenge
            </div>
            <div className="text-[11px] text-[var(--color-text-secondary)]">
              {invitation.sender.username} ({invitation.sender.rating})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-secondary)] font-mono">
          <Clock className="w-3 h-3" />
          <span>{timeLeftSec}s</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-1.5 rounded-[10px] bg-[#F7F4EC] dark:bg-[#13201B] text-xs border border-[var(--color-border)]">
        <span className="text-[var(--color-text-secondary)]">Time Control:</span>
        <span className="font-semibold text-[var(--color-text)] font-mono">{timeControlLabel}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onAccept(invitation.invitationId)}
          className="flex-1 py-2 rounded-[12px] bg-[#18352B] hover:bg-[#285443] dark:bg-[#D3AA58] dark:text-[#18221E] text-[#FBF9F3] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Accept</span>
        </button>
        <button
          onClick={() => onDecline(invitation.invitationId)}
          className="flex-1 py-2 rounded-[12px] bg-[#EDE9DE] dark:bg-[#18352B] hover:bg-[#E3DDD0] dark:hover:bg-[#283E34] text-[var(--color-text-secondary)] hover:text-[#A94B45] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
        >
          <X className="w-3.5 h-3.5" />
          <span>Decline</span>
        </button>
      </div>
    </div>
  );
}

export default GameInvite;
