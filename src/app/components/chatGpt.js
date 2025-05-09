"use client";
import React, { useState } from "react";
import styles from "../style/Chatbot.module.css";
import { FaCommentDots } from "react-icons/fa";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("https://skillbridge.runasp.net/api/ChatBot/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: input
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // First get the response as text
      const responseText = await response.text();

      // Try to parse as JSON, otherwise use as plain text
      let botResponse;
      try {
        const jsonData = JSON.parse(responseText);
        botResponse = jsonData.response || jsonData.message || jsonData;
        if (typeof botResponse !== 'string') {
          botResponse = JSON.stringify(botResponse);
        }
      } catch {
        botResponse = responseText;
      }

      const botMessage = {
        text: botResponse,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { text: `حدث خطأ أثناء الاتصال بالخادم: ${error.message}`, sender: "bot" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className={styles.chatIcon}
        onClick={() => setShowChatbot(!showChatbot)}
      >
        <FaCommentDots size={32} color="#fff" />
      </div>

      {showChatbot && (
        <div className={styles.chatbotContainer}>
          <button
            className={styles.closeButton}
            onClick={() => setShowChatbot(false)}
          >
            &times;
          </button>

          <h2 className={styles.title}>Assistant Bot</h2>

          <div className={styles.chatWindow}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${styles.message} ${msg.sender === "user" ? styles.userMessage : styles.botMessage
                  }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className={styles.botMessage}>Loading...</div>
            )}
          </div>
          <div className={styles.inputContainer}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="اكتب سؤالك هنا..."
              disabled={isLoading}
            />
            <button onClick={sendMessage} disabled={isLoading}>
              إرسال
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;