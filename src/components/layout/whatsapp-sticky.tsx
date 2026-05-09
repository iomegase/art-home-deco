"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";
import { trackWhatsappClick } from "@/lib/analytics/events";
import { MessageCircle, RefreshCcw, Send, X } from "lucide-react";

type ChatMessage = {
  id: string;
  direction: "inbound" | "outbound" | string;
  body: string;
  status: string;
  createdAt: string;
};

const VISITOR_SESSION_STORAGE_KEY = "whatsapp_visitor_session_id";
const CONVERSATION_STORAGE_KEY = "whatsapp_conversation_id";

function getOrCreateVisitorSessionId() {
  const existing = window.localStorage.getItem(VISITOR_SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }
  const created = crypto.randomUUID();
  window.localStorage.setItem(VISITOR_SESSION_STORAGE_KEY, created);
  return created;
}

export function WhatsAppSticky() {
  const [isOpen, setIsOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem(CONVERSATION_STORAGE_KEY);
  });
  const [visitorSessionId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return getOrCreateVisitorSessionId();
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!conversationId || !visitorSessionId || document.visibilityState !== "visible") {
      return;
    }

    const query = new URLSearchParams({
      conversationId,
      visitorSessionId,
    });
    const response = await fetch(`/api/chat/whatsapp/messages?${query.toString()}`);
    if (!response.ok) {
      return;
    }
    const payload = (await response.json()) as { messages?: ChatMessage[] };
    if (payload.messages) {
      setMessages(payload.messages);
    }
  }, [conversationId, visitorSessionId]);

  const canStartConversation = useMemo(() => {
    return !!visitorSessionId && phone.trim().length >= 8 && consent;
  }, [visitorSessionId, phone, consent]);

  async function handleStartConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!visitorSessionId || !canStartConversation) {
      return;
    }

    setError(null);
    setIsStarting(true);

    const response = await fetch("/api/chat/whatsapp/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorSessionId,
        customerName: name || undefined,
        customerPhone: phone,
        consent: true,
      }),
    });

    setIsStarting(false);

    if (!response.ok) {
      setError("Impossible de démarrer la conversation.");
      return;
    }

    const payload = (await response.json()) as { conversation?: { id: string } };
    if (!payload.conversation?.id) {
      setError("Conversation invalide.");
      return;
    }

    setConversationId(payload.conversation.id);
    window.localStorage.setItem(CONVERSATION_STORAGE_KEY, payload.conversation.id);
    setMessages([]);
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!conversationId || !visitorSessionId || !message.trim()) {
      return;
    }

    setIsSending(true);
    setError(null);
    const body = message.trim();
    setMessage("");

    const response = await fetch("/api/chat/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        visitorSessionId,
        message: body,
      }),
    });

    setIsSending(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Message non envoyé. Vérifiez la configuration WhatsApp Business.");
      return;
    }
    const payload = (await response.json()) as {
      message?: ChatMessage;
    };
    if (payload.message) {
      setMessages((current) => [...current, payload.message as ChatMessage]);
    }
  }

  async function handleManualRefresh() {
    setIsRefreshing(true);
    await loadMessages();
    setIsRefreshing(false);
  }

  return (
    <div className="sticky bottom-4 z-40 mx-auto w-full max-w-7xl px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex justify-end">
        {isOpen ? (
          <section className="w-full max-w-sm rounded-2xl border border-line/50 bg-background shadow-xl">
            <header className="flex items-center justify-between rounded-t-2xl bg-[#25D366] px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} />
                <p className="text-sm font-semibold">WhatsApp Boutique</p>
              </div>
              <div className="flex items-center gap-1">
                {conversationId ? (
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="rounded p-1 transition-colors hover:bg-black/10 disabled:opacity-60"
                    aria-label="Actualiser les messages"
                  >
                    <RefreshCcw size={16} />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded p-1 transition-colors hover:bg-black/10"
                  aria-label="Fermer le module WhatsApp"
                >
                  <X size={16} />
                </button>
              </div>
            </header>

            <div className="max-h-80 overflow-y-auto px-4 py-3">
              {conversationId ? (
                <div className="space-y-2">
                  {messages.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Conversation démarrée. Envoyez votre message.</p>
                  ) : null}
                  {messages.map((item) => (
                    <div
                      key={item.id}
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        item.direction === "outbound"
                          ? "ml-auto bg-[#DCF8C6] text-black"
                          : "bg-surface text-foreground"
                      }`}
                    >
                      {item.body}
                    </div>
                  ))}
                </div>
              ) : (
                <form className="space-y-3" onSubmit={handleStartConversation}>
                  <p className="text-xs text-muted-foreground">
                    Démarrez une conversation en direct sans quitter le site.
                  </p>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Votre prénom (optionnel)"
                    className="w-full rounded-lg border border-line/50 bg-background px-3 py-2 text-sm"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+33600000000"
                    className="w-full rounded-lg border border-line/50 bg-background px-3 py-2 text-sm"
                    required
                  />
                  <label className="flex items-start gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(event) => setConsent(event.target.checked)}
                      className="mt-0.5"
                    />
                    <span>J&apos;accepte d&apos;être contacté(e) par la boutique via WhatsApp.</span>
                  </label>
                  <button
                    type="submit"
                    disabled={!canStartConversation || isStarting}
                    className="w-full rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {isStarting ? "Connexion..." : "Démarrer le chat"}
                  </button>
                </form>
              )}
            </div>

            {conversationId ? (
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t border-line/50 px-3 py-3">
                <input
                  type="text"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Votre message..."
                  className="flex-1 rounded-lg border border-line/50 bg-background px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={isSending || !message.trim()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white disabled:opacity-60"
                  aria-label="Envoyer le message"
                >
                  <Send size={16} />
                </button>
              </form>
            ) : null}

            {error ? <p className="px-4 pb-3 text-xs text-red-600">{error}</p> : null}
          </section>
        ) : (
          <div className="rounded-full bg-white/95 p-1 shadow-sm">
            <button
              type="button"
              onClick={() => {
                trackWhatsappClick();
                setIsOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-[#1ebe5d]"
              aria-label="Ouvrir le chat WhatsApp"
            >
              <MessageCircle size={18} aria-hidden="true" />
              <span>La Boutique</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
