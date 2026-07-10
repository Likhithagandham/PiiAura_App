"use client";

import { useCallback, useRef, useState } from "react";
import type { StudentAnalysisChatMessage } from "@eduos/types";
import { Button, Input } from "@eduos/ui";

function renderMessageContent(content: string) {
  return content.split("\n").map((line, index) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <div key={index} style={{ fontWeight: 700, marginTop: index > 0 ? "0.5rem" : 0 }}>
          {line.slice(2, -2)}
        </div>
      );
    }
    return (
      <div key={index} style={{ whiteSpace: "pre-wrap" }}>
        {line || "\u00a0"}
      </div>
    );
  });
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function StudentPerformanceChat() {
  const [messages, setMessages] = useState<StudentAnalysisChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Ask for a student's performance by roll or admission number.\n\nExample: **Show performance for STU-001**",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: StudentAnalysisChatMessage = {
      id: makeId(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    scrollToBottom();

    try {
      const res = await fetch("/api/admin/student-analysis/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");

      const assistantMessage: StudentAnalysisChatMessage = {
        id: makeId(),
        role: "assistant",
        content: data.reply as string,
        report: data.report,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content: err instanceof Error ? err.message : "Something went wrong. Try again.",
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }, [input, loading, scrollToBottom]);

  return (
    <section className="eduos-panel" style={{ marginBottom: "1.25rem" }}>
      <div style={{ marginBottom: "0.75rem" }}>
        <h2 className="eduos-section-title" style={{ marginBottom: "0.25rem" }}>
          Student performance assistant
        </h2>
        <p className="eduos-section-desc" style={{ margin: 0 }}>
          Type a roll or admission number and ask for performance — analysis runs locally against your
          institution data (marks, attendance, fees, risk).
        </p>
      </div>

      <div
        ref={listRef}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          maxHeight: "420px",
          overflowY: "auto",
          padding: "0.75rem",
          borderRadius: "var(--eduos-radius, 12px)",
          border: "1px solid var(--eduos-border)",
          background: "var(--eduos-surface-muted, #f8fafc)",
          marginBottom: "0.75rem",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "92%",
              padding: "0.625rem 0.875rem",
              borderRadius: "12px",
              fontSize: "0.875rem",
              lineHeight: 1.5,
              background: msg.role === "user" ? "var(--eduos-primary)" : "#fff",
              color: msg.role === "user" ? "#fff" : "var(--eduos-text)",
              border: msg.role === "user" ? "none" : "1px solid var(--eduos-border)",
            }}
          >
            {renderMessageContent(msg.content)}
          </div>
        ))}
        {loading ? (
          <div style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
            Analyzing student record…
          </div>
        ) : null}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage();
        }}
        style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}
      >
        <div style={{ flex: 1 }}>
          <Input
            label="Ask about a student"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='e.g. "Performance for STU-001"'
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading || !input.trim()}>
          {loading ? "…" : "Send"}
        </Button>
      </form>
    </section>
  );
}
