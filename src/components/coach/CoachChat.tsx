"use client";

import { FormEvent, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type CoachChatProps = {
  userId: string;
};

export default function CoachChat({
  userId,
}: CoachChatProps) {
  const [messages, setMessages] =
    useState<Message[]>([
      {
        role: "assistant",
        content:
          "Tell me what you want to improve in your chess.",
      },
    ]);

  const [input, setInput] = useState("");

  const [loading, setLoading] =
    useState(false);

  async function sendMessage(
    event: FormEvent,
  ) {
    event.preventDefault();

    const question = input.trim();

    if (!question || loading) {
      return;
    }

    setInput("");

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: question,
      },
    ]);

    setLoading(true);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:4000";

      const response = await fetch(
        `${apiUrl}/api/ai/coach`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            userId,
            question,
          }),
        },
      );

      const data = await response.json();

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data.answer ||
            data.message ||
            "I couldn't generate a response.",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "The coach is temporarily unavailable.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[650px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
      <div className="border-b border-white/10 px-6 py-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">
          ChessVerse Intelligence
        </p>

        <h2 className="mt-1 text-lg font-medium">
          AI Chess Coach
        </h2>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={
              message.role === "user"
                ? "ml-auto max-w-[80%]"
                : "max-w-[85%]"
            }
          >
            <div
              className={
                message.role === "user"
                  ? "rounded-2xl rounded-br-md bg-white px-4 py-3 text-sm text-black"
                  : "rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white/70 whitespace-pre-line"
              }
            >
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-white/35">
            <span className="inline-block h-2 w-2 animate-ping rounded-full bg-[#d7b875]" />
            Coach is thinking...
          </div>
        )}
      </div>

      <form
        onSubmit={sendMessage}
        className="border-t border-white/10 p-4"
      >
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            placeholder="Ask your coach anything..."
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-white/25 transition-colors"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#e9e2d0] px-5 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
