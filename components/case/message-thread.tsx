"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage } from "@/lib/actions/cases";
import { formatDateTime } from "@/lib/utils";

type Message = {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  sender: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    role: string;
  };
};

export function MessageThread({
  caseId,
  messages,
  currentUserId,
}: {
  caseId: string;
  messages: Message[];
  currentUserId: string;
}) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();

  async function handleSend() {
    const trimmed = (content ?? "").trim();
    if (!trimmed) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.set("caseId", caseId);
      formData.set("content", trimmed);
      await sendMessage(formData);
      setContent("");
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="max-h-96 space-y-3 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-slate-500">No messages yet.</p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId;
          const name =
            [msg.sender.firstName, msg.sender.lastName]
              .filter(Boolean)
              .join(" ") || msg.sender.email;

          return (
            <div
              key={msg.id}
              className={`rounded-lg p-3 ${
                isOwn ? "ml-8 bg-slate-100" : "mr-8 bg-white border border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium">{name}</span>
                <span>{formatDateTime(msg.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={content ?? ""}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          rows={2}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={sending || !content.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
