"use client";
import React, { useState } from "react";
import styles from "../style/Chatbot.module.css"; // أنماط CSS
import { FaCommentDots } from "react-icons/fa"; // أيقونة الدردشة

const Chatbot = () => {
  const [messages, setMessages] = useState([]); // تخزين الرسائل
  const [input, setInput] = useState(""); // نص المدخلات
  const [isLoading, setIsLoading] = useState(false); // حالة التحميل
  const [showChatbot, setShowChatbot] = useState(false); // حالة ظهور/اختفاء الـ Chatbot

  // إرسال الرسالة إلى OpenRouter API
  const sendMessage = async () => {
    if (!input.trim()) return; // تجاهل المدخلات الفارغة

    // إضافة رسالة المستخدم إلى القائمة
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // إرسال الطلب إلى OpenRouter API
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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", // استبدل بـ API Key الخاص بك
          "HTTP-Referer": "https://www.sitename.com", // Optional. Site URL for rankings on openrouter.ai.
          "X-Title": "SiteName", // Optional. Site title for rankings on openrouter.ai.
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-r1:free",
          "messages": [
            {
              "role": "user",
              "content": input
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(`API Error: ${errorData.error || "Unknown error"}`);
      }

      const data = await response.json();
      const botMessage = {
        text: data.choices[0].message.content,
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
      {/* أيقونة الدردشة */}
      <div
        className={styles.chatIcon}
        onClick={() => setShowChatbot(!showChatbot)}
      >
        <FaCommentDots size={32} color="#fff" />
      </div>

      {/* Chatbot */}
      {showChatbot && (
        <div className={styles.chatbotContainer}>
          {/* زر الإغلاق */}
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