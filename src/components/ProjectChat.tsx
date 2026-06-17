'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';
import { getAuthToken } from '@/lib/cookies';

export interface ChatMessage {
  _id: string;
  senderName: string;
  senderRole: string;
  message: string;
  messageType?: string;
  createdAt: string;
}

interface ProjectChatProps {
  projectId: string;
  projectName: string;
  isProjectManager?: boolean;
  onProjectUpdated?: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export default function ProjectChat({
  projectId,
  projectName,
  isProjectManager = false,
  onProjectUpdated,
}: ProjectChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [pmProgress, setPmProgress] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m._id === msg._id)) return prev;
      return [...prev, msg];
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      try {
        const res = await api.get(`/projects/${projectId}/chat/messages`, {
          skipAuthRedirect: true,
        });
        if (active) setMessages(res.data.messages || []);
      } catch (e) {
        console.error('Chat history load failed:', e);
      }
    };

    loadHistory();

    const token = getAuthToken() || localStorage.getItem('auth_token');
    if (!token) return;

    const socket = io(API_BASE, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join:project', { projectId });
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('chat:message', (msg: ChatMessage) => appendMessage(msg));
    socket.on('project:updated', () => onProjectUpdated?.());
    socket.on('milestone:updated', () => onProjectUpdated?.());
    socket.on('milestone:created', () => onProjectUpdated?.());

    return () => {
      active = false;
      socket.disconnect();
    };
  }, [projectId, appendMessage, onProjectUpdated]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');

    try {
      const socket = socketRef.current;
      if (socket?.connected) {
        await new Promise<void>((resolve, reject) => {
          socket.emit(
            'chat:message',
            { projectId, message: text, messageType: isProjectManager ? 'pm_broadcast' : 'update' },
            (ack: { error?: string; message?: ChatMessage; botReply?: ChatMessage }) => {
              if (ack?.error) reject(new Error(ack.error));
              else {
                if (ack.message) appendMessage(ack.message);
                if (ack.botReply) appendMessage(ack.botReply);
                resolve();
              }
            }
          );
        });
      } else {
        const res = await api.post(
          `/projects/${projectId}/chat/messages`,
          { message: text, messageType: isProjectManager ? 'pm_broadcast' : 'update' },
          { skipAuthRedirect: true }
        );
        if (res.data.message) appendMessage(res.data.message);
        if (res.data.botReply) appendMessage(res.data.botReply);
      }
    } catch (e) {
      console.error('Send failed:', e);
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const submitPmProgress = async () => {
    const pct = Number(pmProgress);
    if (Number.isNaN(pct)) return;
    try {
      await api.patch(
        `/projects/${projectId}/progress`,
        {
          completionPercentage: pct,
          message: `Project progress updated to ${pct}% by project manager.`,
        },
        { skipAuthRedirect: true }
      );
      setPmProgress('');
      onProjectUpdated?.();
    } catch (e) {
      console.error('PM progress update failed:', e);
    }
  };

  const roleLabel = (role: string) => {
    if (role === 'project-manager') return 'PM';
    if (role === 'system') return 'Bot';
    if (role === 'admin') return 'Admin';
    return 'Team';
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col h-[420px]">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h4 className="font-semibold text-gray-900">Project updates</h4>
          <p className="text-xs text-gray-500">{projectName}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${connected ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
        >
          {connected ? 'Live' : 'Connecting…'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
        {messages.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">
            Send your project update to the project manager. They will see it here in real time.
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              msg.senderRole === 'system'
                ? 'bg-amber-50 text-amber-900 mx-auto text-center'
                : msg.senderRole === 'project-manager' || msg.senderRole === 'admin'
                  ? 'bg-blue-50 text-blue-900 ml-0'
                  : 'bg-gray-100 text-gray-900 ml-auto'
            }`}
          >
            <div className="text-xs font-medium opacity-70 mb-1">
              {msg.senderName} · {roleLabel(msg.senderRole)}
            </div>
            {msg.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {isProjectManager && (
        <div className="px-4 py-2 border-t bg-blue-50 flex gap-2 items-center">
          <input
            type="number"
            min={0}
            max={100}
            placeholder="Project %"
            value={pmProgress}
            onChange={(e) => setPmProgress(e.target.value)}
            className="w-24 px-2 py-1 text-sm border rounded"
          />
          <button
            type="button"
            onClick={submitPmProgress}
            className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Update project progress
          </button>
        </div>
      )}

      <div className="p-3 border-t bg-gray-50 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={
            isProjectManager
              ? 'Broadcast update to your team…'
              : 'Send update to project manager…'
          }
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={sending || !input.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
