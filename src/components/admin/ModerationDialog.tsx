"use client";

import React, { useState } from "react";
import Dialog from "@/components/ui/Dialog";
import { Input, Textarea } from "@/components/ui/Input";

export interface ModerationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetUsername: string;
  actionType: "warn" | "mute" | "ban" | "restrict";
  onConfirm: (reason: string) => Promise<void>;
}

export default function ModerationDialog({
  isOpen,
  onClose,
  targetUsername,
  actionType,
  onConfirm,
}: ModerationDialogProps) {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const actionTitles: Record<string, string> = {
    warn: `Issue Warning to ${targetUsername}`,
    mute: `Mute Chat for ${targetUsername}`,
    ban: `Ban Account for ${targetUsername}`,
    restrict: `Apply Fair-Play Restriction to ${targetUsername}`,
  };

  async function handleConfirm() {
    if (!reason.trim()) return;
    try {
      setIsLoading(true);
      await onConfirm(reason);
      setReason("");
      onClose();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={actionTitles[actionType] || "Moderation Action"}
      description={`Specify the operational reason for this moderation action on ${targetUsername}. This action will be logged in the permanent audit ledger.`}
      confirmLabel={actionType === "ban" ? "Confirm Ban" : "Apply Action"}
      isDangerous={actionType === "ban"}
      onConfirm={handleConfirm}
      isLoading={isLoading}
    >
      <div className="space-y-4 pt-2">
        <Textarea
          label="Reason / Violation Details"
          placeholder="e.g. Engine analysis correlation > 98%, repeated abusive language in lobby..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          required
        />
      </div>
    </Dialog>
  );
}
