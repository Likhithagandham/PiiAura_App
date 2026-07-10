"use client";

import { useMemo, useState } from "react";
import type { CommunicationsData, CommsChannel, CommsMessage, CommsRecipientStatus, SendCommsMessageInput } from "@eduos/types";
import { Button, Input, InlineLoading, PortalFilterBar, filterBySearch } from "@eduos/ui";
import { useApiData } from "@/lib/queries";
import { AdminShell } from "../AdminShell";
import { AdminModal } from "../AdminModal";

const CHANNEL_LABELS: Record<string, string> = {
  in_app: "In-app",
  sms: "SMS",
  email: "Email",
};

const STATUS_LABELS: Record<CommsRecipientStatus | "pending", string> = {
  sent: "Sent",
  queued: "Queued",
  failed: "Failed",
  skipped: "Skipped",
  pending: "Pending",
};

export function AdminCommunicationsPanel() {
  const { data, isPending: loading, error: queryError, refetch } = useApiData<CommunicationsData>(
    "/api/admin/communications",
  );
  const load = refetch;
  const [showModal, setShowModal] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<CommsChannel | "all">("all");

  const error = sendError ?? (queryError ? "Could not load communications." : null);

  const [form, setForm] = useState<SendCommsMessageInput>({
    title: "",
    body: "",
    channels: ["in_app"],
    target: { type: "all" },
    sendMode: "bulk",
  });

  const messages: CommsMessage[] = useMemo(() => data?.messages ?? [], [data?.messages]);

  const filteredMessages = useMemo(() => {
    const byChannel =
      channelFilter === "all"
        ? messages
        : messages.filter((m) => m.channels.includes(channelFilter));
    return filterBySearch(byChannel, search, (m) => [m.title, m.body, m.target.type, m.target.value ?? ""]);
  }, [messages, search, channelFilter]);

  return (
    <>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}

      <section className="eduos-panel">
        <div className="eduos-admin-toolbar">
          <div style={{ color: "var(--eduos-text-muted)", fontSize: "0.875rem" }}>
            Rate limit: {data?.tenantRateLimit.sentInWindow ?? 0}/{data?.tenantRateLimit.maxPerMinute ?? 100} in current
            minute · queued {data?.tenantRateLimit.queued ?? 0}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Button type="button" variant="secondary" onClick={() => load()} className="eduos-admin-btn-sm">
              Refresh
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="eduos-admin-btn-sm"
              onClick={async () => {
                await fetch("/api/admin/communications/actions", {
                  method: "PATCH",
                  credentials: "include",
                  headers: { "Content-Type": "application/json", "Idempotency-Key": `comms-${Date.now()}` },
                  body: JSON.stringify({ action: "process_queue" }),
                });
                void refetch();
              }}
            >
              Process queue
            </Button>
            <Button type="button" onClick={() => setShowModal(true)} className="eduos-admin-btn-sm">
              New message
            </Button>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="eduos-panel">
          <InlineLoading />
        </section>
      ) : messages.length === 0 ? (
        <section className="eduos-panel">
          <p style={{ color: "var(--eduos-text-muted)", margin: 0 }}>No messages sent yet.</p>
        </section>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <PortalFilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search title, body, or audience…"
            total={messages.length}
            filtered={filteredMessages.length}
            selects={[
              {
                id: "channel",
                label: "Channel",
                value: channelFilter,
                onChange: (v) => setChannelFilter(v as CommsChannel | "all"),
                options: [
                  { value: "all", label: "All channels" },
                  { value: "in_app", label: "In-app" },
                  { value: "sms", label: "SMS" },
                  { value: "email", label: "Email" },
                ],
              },
            ]}
          />
          {filteredMessages.length === 0 ? (
            <section className="eduos-panel">
              <p style={{ color: "var(--eduos-text-muted)", margin: 0 }}>No messages match your filters.</p>
            </section>
          ) : null}
          {filteredMessages.map((a) => (
            <article key={a.id} className="eduos-panel">
              <h3 className="eduos-subsection-title">{a.title}</h3>
              <p className="eduos-body-sm" style={{ marginTop: "0.5rem", lineHeight: 1.5 }}>
                {a.body}
              </p>
              <div
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.8125rem",
                  color: "var(--eduos-text-muted)",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <span>
                  Audience: {a.target.type}
                  {a.target.value ? ` (${a.target.value})` : ""}
                </span>
                <span>
                  Created: {new Date(a.createdAt).toLocaleString("en-IN")} · {a.recipientCount} users
                </span>
              </div>
              <div
                style={{
                  marginTop: "0.75rem",
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                {(["in_app", "sms", "email"] as const).map((ch) => (
                  <span
                    key={ch}
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      background: "var(--eduos-bg)",
                      color: "var(--eduos-text-muted)",
                    }}
                  >
                    {CHANNEL_LABELS[ch]}:{" "}
                    {STATUS_LABELS[
                      a.perRecipient.some((r) => r.channel === ch && r.status === "failed")
                        ? "failed"
                        : a.perRecipient.some((r) => r.channel === ch && r.status === "queued")
                          ? "queued"
                          : a.perRecipient.some((r) => r.channel === ch && r.status === "sent")
                            ? "sent"
                            : "skipped"
                    ]}
                  </span>
                ))}
              </div>
              <details style={{ marginTop: "0.75rem" }}>
                <summary style={{ cursor: "pointer", color: "var(--eduos-primary)", fontSize: "0.8125rem" }}>
                  Delivery status ({a.perRecipient.length})
                </summary>
                <div style={{ marginTop: "0.5rem" }}>
                  {a.perRecipient.slice(0, 50).map((r, idx) => (
                    <div key={`${r.userId}-${r.channel}-${idx}`} style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
                      {r.greeting ? `${r.greeting} · ` : ""}
                      {r.name} ({r.role}) · {r.channel} · {r.status}
                      {r.error ? ` (${r.error})` : ""}
                    </div>
                  ))}
                  {a.perRecipient.length > 50 ? (
                    <div style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
                      Showing first 50…
                    </div>
                  ) : null}
                </div>
              </details>
            </article>
          ))}
        </div>
      )}

      {showModal ? (
        <AdminSendModal
          value={form}
          onChange={setForm}
          onClose={() => setShowModal(false)}
          onSend={async () => {
            setSendError(null);
            const res = await fetch("/api/admin/communications/actions", {
              method: "PATCH",
              credentials: "include",
              headers: { "Content-Type": "application/json", "Idempotency-Key": `comms-${Date.now()}` },
              body: JSON.stringify({ action: "send", payload: form }),
            });
            if (!res.ok) {
              const j = await res.json().catch(() => ({}));
              setSendError((j as { error?: string }).error ?? "Send failed");
              return;
            }
            setShowModal(false);
            void refetch();
          }}
        />
      ) : null}
    </>
  );
}

export function CommunicationsView() {
  return (
    <AdminShell title="Communications">
      <AdminCommunicationsPanel />
    </AdminShell>
  );
}

function AdminSendModal({
  value,
  onChange,
  onClose,
  onSend,
}: {
  value: SendCommsMessageInput;
  onChange: (v: SendCommsMessageInput) => void;
  onClose: () => void;
  onSend: () => void;
}) {
  const channels = value.channels;
  function toggle(ch: CommsChannel) {
    onChange({ ...value, channels: channels.includes(ch) ? channels.filter((c) => c !== ch) : [...channels, ch] });
  }
  return (
    <AdminModal title="New message" onClose={onClose} wide>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Input label="Title" value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} />
          <div>
            <label className="eduos-label">Message</label>
            <textarea
              className="eduos-input"
              rows={4}
              value={value.body}
              onChange={(e) => onChange({ ...value, body: e.target.value })}
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {(["in_app", "sms", "email"] as const).map((ch) => (
              <label key={ch} style={{ fontSize: "0.875rem", display: "flex", gap: "0.375rem" }}>
                <input type="checkbox" checked={channels.includes(ch)} onChange={() => toggle(ch)} />
                {CHANNEL_LABELS[ch]}
              </label>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <select
              className="eduos-input"
              value={value.target.type}
              onChange={(e) => onChange({ ...value, target: { type: e.target.value as any } })}
              style={{ width: "auto" }}
            >
              <option value="all">Everyone</option>
              <option value="role">Role</option>
              <option value="batch">Batch / class</option>
              <option value="department">Department</option>
            </select>
            {value.target.type !== "all" ? (
              <Input
                label="Target value"
                value={value.target.value ?? ""}
                onChange={(e) => onChange({ ...value, target: { ...value.target, value: e.target.value } })}
              />
            ) : null}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <Button type="button" variant="secondary" onClick={onClose} className="eduos-admin-btn-sm">
              Cancel
            </Button>
            <Button type="button" onClick={onSend} className="eduos-admin-btn-sm">
              Send
            </Button>
          </div>
      </div>
    </AdminModal>
  );
}
