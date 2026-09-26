"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import type { PositionAnalysis } from "@/types/ai";

interface ChatMessage {
  id: string;
  sender: "user" | "coach";
  text: string;
  timestamp: Date;
}

interface AIChatPanelProps {
  currentPosition?: PositionAnalysis;
  className?: string;
}

const SUGGESTED_QUESTIONS = [
  "Position insight",
  "Why this move?",
  "What should I improve?",
  "What was the key moment?",
];

export default function AIChatPanel({
  currentPosition,
  className = "",
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-welcome",
      sender: "coach",
      text: "Hello! I'm your ChessVerse Coach. Ask me questions about the current position, tactical ideas, or alternative candidate moves.",
      timestamp: new Date(),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat log to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  function handleSendQuestion(questionText: string) {
    if (!questionText.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: questionText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion("");
    setIsTyping(true);

    // Contextual answer based on current position
    setTimeout(() => {
      let reply = "Looking at this position, focus on piece coordination and king safety.";

      if (currentPosition) {
        if (questionText.toLowerCase().includes("best move") && currentPosition.bestMove) {
          reply = `The engine recommends ${currentPosition.bestMove}. This move coordinates key pieces and keeps the evaluation around ${currentPosition.evaluationAfter > 0 ? "+" : ""}${currentPosition.evaluationAfter.toFixed(1)}.`;
        } else if (questionText.toLowerCase().includes("threat") && currentPosition.tacticalIdea) {
          reply = `Immediate threat / tactical idea: ${currentPosition.tacticalIdea}. Ensure you do not leave pieces undefended.`;
        } else if (currentPosition.commentary) {
          reply = currentPosition.commentary;
        } else if (currentPosition.whyExplanation) {
          reply = currentPosition.whyExplanation;
        }
      }

      const coachMsg: ChatMessage = {
        id: `coach-${Date.now()}`,
        sender: "coach",
        text: reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, coachMsg]);
      setIsTyping(false);
    }, 450);
  }

  return (
    <div className={`flex flex-col rounded-[20px] border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] shadow-[0_10px_35px_rgba(35,40,30,0.06)] overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(24,34,30,0.08)] dark:border-white/10 px-5 py-4 bg-[#F7F4EC]/60 dark:bg-[#1B2A24]/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#B58A3A]/15 text-[#B58A3A]">
            <Bot size={17} />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-[#18352B] dark:text-[#F4EFE3] flex items-center gap-1.5">
              <span>Chess Coach</span>
              <Sparkles size={12} className="text-[#B58A3A]" />
            </h3>
            <p className="text-[10px] text-[#69736C] dark:text-[#B5BDB5]">
              Position-grounded tactical analysis
            </p>
          </div>
        </div>

        <span className="rounded-full bg-[#27815D]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#27815D] border border-[#27815D]/20">
          Ready
        </span>
      </div>

      {/* Chat Messages Log */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-72 sm:max-h-80">
        {messages.map((msg) => {
          const isCoach = msg.sender === "coach";

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isCoach ? "items-start" : "items-start justify-end"}`}
            >
              {isCoach && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#B58A3A]/15 text-[#B58A3A] text-[11px] font-bold">
                  ♟
                </div>
              )}

              <div
                className={`rounded-[14px] px-3.5 py-2.5 text-xs leading-relaxed max-w-[85%] ${
                  isCoach
                    ? "bg-[#F7F4EC] dark:bg-[#1B2A24] text-[#18221E] dark:text-[#F4EFE3] border border-[rgba(24,34,30,0.08)] dark:border-white/10"
                    : "bg-[#18352B] dark:bg-[#285443] text-[#FBF9F3] font-medium shadow-xs"
                }`}
              >
                {msg.text}
              </div>

              {!isCoach && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#18352B]/10 dark:bg-white/10 text-[#18352B] dark:text-[#F4EFE3]">
                  <User size={13} />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-[#69736C] dark:text-[#B5BDB5] pl-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B58A3A] animate-ping" />
            <span>Analyzing position...</span>
          </div>
        )}
      </div>

      {/* Suggested Questions Chips */}
      <div className="border-t border-[rgba(24,34,30,0.06)] dark:border-white/10 bg-[#F7F4EC]/50 dark:bg-[#1B2A24]/50 p-2.5">
        <p className="px-1 text-[10px] uppercase font-mono tracking-wider text-[#69736C] dark:text-[#B5BDB5] mb-1.5">
          Suggested Questions
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuestion(q)}
              className="rounded-[10px] border border-[rgba(24,34,30,0.10)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] px-2 py-1 text-[11px] text-[#18352B] dark:text-[#F4EFE3] transition hover:border-[#B58A3A] hover:bg-[#F7F4EC] dark:hover:bg-[#1B2A24] text-left cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuestion(inputQuestion);
        }}
        className="flex items-center gap-2 border-t border-[rgba(24,34,30,0.08)] dark:border-white/10 p-3 bg-[#F7F4EC]/40 dark:bg-[#1B2A24]/40"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          maxLength={300}
          placeholder="Ask about this position..."
          className="flex-1 rounded-[12px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#FAF8F2] dark:bg-[#172720] px-3.5 py-2 text-xs text-[#18221E] dark:text-[#F4EFE3] placeholder-[#69736C] focus:border-[#B58A3A] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || isTyping}
          className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-[#18352B] dark:bg-[#285443] text-white transition hover:bg-[#285443] dark:hover:bg-[#396E5A] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          title="Send"
          aria-label="Send question"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}
