import { useState } from "react";
import axios from "axios";

export const ChatBot = () => {
  const [message, setMessage] = useState("");
  type ChatItem = { role: "user" | "bot"; text: string };
  const [chat, setChat] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg: ChatItem = { role: "user", text: message };
    setChat((prev) => [...prev, userMsg]);

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/ai/chat", {
        message,
      });

      const botMsg: ChatItem = {
        role: "bot",
        text: res.data.reply,
      };

      setChat((prev) => [...prev, botMsg]);
      setMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>AI Chat Assistant 🤖</h2>

      <div style={{ minHeight: "300px", border: "1px solid #ccc", padding: "10px" }}>
        {chat.map((c, i) => (
          <p key={i} style={{ textAlign: c.role === "user" ? "right" : "left" }}>
            <b>{c.role === "user" ? "You" : "AI"}:</b> {c.text}
          </p>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask something..."
        style={{ width: "70%", padding: "10px" }}
      />

      <button onClick={sendMessage} disabled={loading}>
        Send
      </button>
    </div>
  );
};