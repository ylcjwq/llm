"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, FileTextIcon, TrashIcon, LogOutIcon, PaperclipIcon, SendIcon, XIcon } from "lucide-react";

export default function ChatPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadConversations();
    loadDocuments();
  }, []);

  async function loadConversations() {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setConversations(data);
    }
  }

  async function createConversation() {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ title: "新对话" }),
    });
    if (res.ok) {
      const data = await res.json();
      setConversations([data, ...conversations]);
      setCurrentConvId(data.id);
      setMessages([]);
    }
  }

  async function loadMessages(convId: string) {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/conversations/${convId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    }
  }

  async function sendMessage() {
    if ((!input.trim() && !selectedFile) || !currentConvId) return;
    setLoading(true);
    const token = localStorage.getItem("token");

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      await fetch("/api/documents/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      setSelectedFile(null);
      loadDocuments();
    }

    if (input.trim()) {
      const res = await fetch(`/api/conversations/${currentConvId}/chat`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (res.ok) {
        setInput("");
        loadMessages(currentConvId);
      }
    }
    setLoading(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const target = e.target;
    setInput(target.value);
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 96)}px`;
  }

  async function deleteConversation(convId: string) {
    if (!confirm("确定要删除这个对话吗？")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/conversations/${convId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setConversations(conversations.filter((c: any) => c.id !== convId));
      if (currentConvId === convId) {
        setCurrentConvId(null);
        setMessages([]);
      }
    }
  }

  async function loadDocuments() {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/documents", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setDocuments(data);
    }
  }

  async function uploadDocument(file: File) {
    setUploadingFile(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/documents/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (res.ok) {
      loadDocuments();
    }
    setUploadingFile(false);
  }

  async function deleteDocument(docId: string) {
    if (!confirm("确定要删除这个文件吗？")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/documents/${docId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setDocuments(documents.filter((d: any) => d.id !== docId));
    }
  }

  async function processDocument(docId: string) {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/documents/${docId}/process`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      alert("文档处理成功");
      loadDocuments();
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Conversations Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col bg-card">
        {/* Top Section: Brand + Actions */}
        <div className="p-4 border-b border-border space-y-2">
          <h2 className="text-lg font-semibold mb-3">AI 助手</h2>
          <Button onClick={createConversation} variant="outline" className="w-full justify-start" size="sm">
            <PlusIcon className="mr-2 h-4 w-4" />
            新建会话
          </Button>
          <Button onClick={() => setShowFiles(!showFiles)} variant="outline" className="w-full justify-start" size="sm">
            <FileTextIcon className="mr-2 h-4 w-4" />
            资料库
          </Button>
        </div>

        {/* Middle Section: Conversations List */}
        <ScrollArea className="flex-1 p-2">
          <div className="text-xs text-muted-foreground px-2 mb-2">最近对话</div>
          {conversations.map((conv: any) => (
            <Card
              key={conv.id}
              className={`p-3 mb-2 cursor-pointer transition-colors hover:bg-accent group ${
                currentConvId === conv.id ? "bg-accent" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  onClick={() => {
                    setCurrentConvId(conv.id);
                    loadMessages(conv.id);
                  }}
                  className="flex-1 truncate text-sm"
                >
                  {conv.title || "未命名对话"}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                >
                  <TrashIcon className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </ScrollArea>

        {/* Bottom Section: User Info */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              localStorage.removeItem("token");
              document.cookie = "token=; path=/; max-age=0";
              router.push("/login");
            }}
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            退出登录
          </Button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg: any, i) => (
            <div key={i} className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <Card
                className={`p-3 max-w-[80%] ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </Card>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border bg-card shrink-0">
          {selectedFile && (
            <Card className="mb-2 p-2 flex items-center justify-between bg-muted">
              <span className="text-sm truncate flex-1">{selectedFile.name}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedFile(null)}>
                <XIcon className="h-3 w-3" />
              </Button>
            </Card>
          )}
          <div className="rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-primary">
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="输入消息..."
              rows={1}
              className="w-full px-4 pt-3 pb-2 bg-transparent resize-none focus:outline-none overflow-y-auto"
              style={{ minHeight: "24px", maxHeight: "96px", lineHeight: "24px" }}
            />
            <div className="flex items-center justify-between px-3 pb-2">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <PaperclipIcon className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
              <button
                onClick={sendMessage}
                disabled={loading || !currentConvId}
                className="p-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? "..." : <SendIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* File Management Sidebar - Conditional */}
      {showFiles && (
        <aside className="w-80 border-l border-border flex flex-col bg-card">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">知识库文件</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowFiles(false)}>
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
            <label>
              <Button variant="default" className="w-full" disabled={uploadingFile} asChild>
                <span>{uploadingFile ? "上传中..." : "上传文件"}</span>
              </Button>
              <input
                type="file"
                onChange={(e) => e.target.files?.[0] && uploadDocument(e.target.files[0])}
                className="hidden"
                disabled={uploadingFile}
              />
            </label>
          </div>
          <ScrollArea className="flex-1 p-2">
            {documents.map((doc: any) => (
              <Card key={doc.id} className="p-3 mb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{doc.filename}</div>
                    <Badge variant={doc.processed ? "default" : "secondary"} className="mt-1 text-xs">
                      {doc.processed ? "已处理" : "未处理"}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    {!doc.processed && (
                      <Button variant="outline" size="sm" onClick={() => processDocument(doc.id)}>
                        处理
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteDocument(doc.id)}>
                      <TrashIcon className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </ScrollArea>
        </aside>
      )}
    </div>
  );
}
