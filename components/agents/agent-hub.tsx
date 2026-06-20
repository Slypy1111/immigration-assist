"use client";

import { useState } from "react";
import {
  FileText,
  ClipboardCheck,
  MessageSquare,
  ShieldCheck,
  Send,
  Copy,
  Bot,
} from "lucide-react";
import type { AgentSkill } from "@/lib/agents/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

const ICONS = {
  FileText,
  ClipboardCheck,
  MessageSquare,
  ShieldCheck,
};

export function AgentHub({
  caseId,
  agents,
}: {
  caseId: string;
  agents: AgentSkill[];
}) {
  const [selected, setSelected] = useState<AgentSkill | null>(null);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSend(text?: string) {
    const msg = text ?? message;
    if (!selected || !msg.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          agentId: selected.id,
          message: msg,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Request failed");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          setResponse(full);
        }
      } else {
        full = await res.text();
        setResponse(full);
      }

      setMessage("");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Agent request failed",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  function copyResponse() {
    if (response) {
      navigator.clipboard.writeText(response);
      toast("Copied to clipboard", "success");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-3">
        <h3 className="font-semibold text-[var(--primary)]">AI Assistants</h3>
        {agents.map((agent) => {
          const Icon = ICONS[agent.icon as keyof typeof ICONS] ?? Bot;
          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => {
                setSelected(agent);
                setResponse("");
              }}
              className={cn(
                "w-full rounded-xl border p-4 text-left transition-all hover:shadow-md",
                selected?.id === agent.id
                  ? "border-[var(--accent)] bg-teal-50"
                  : "border-[var(--border)] bg-[var(--card)]",
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 text-[var(--accent)]" />
                <div>
                  <p className="font-medium">{agent.name}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {agent.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="lg:col-span-2">
        {!selected ? (
          <Card className="flex h-64 items-center justify-center border-dashed">
            <CardContent className="text-center text-[var(--muted)]">
              <Bot className="mx-auto mb-3 h-10 w-10 text-[var(--accent)]" />
              Select an assistant to get started
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              {selected.disclaimer}
            </div>

            {selected.starterPrompts.length > 0 && !response && (
              <div className="flex flex-wrap gap-2">
                {selected.starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs hover:border-[var(--accent)]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {response && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                <pre className="whitespace-pre-wrap text-sm">{response}</pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={copyResponse}
                >
                  <Copy className="mr-2 h-3 w-3" />
                  Copy
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Ask ${selected.name}...`}
                rows={2}
                className="flex-1"
              />
              <Button
                onClick={() => handleSend()}
                disabled={loading || !message.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
