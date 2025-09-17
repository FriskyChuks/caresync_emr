import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";

const MessageContext = createContext(null);

/**
 * MessageProvider
 * - Wrap your app with this (top-level).
 * - showMessage(text, type = 'info', duration = 3000) -> returns id
 * - removeMessage(id) to remove early
 */
export const MessageProvider = ({ children, maxToasts = 4 }) => {
  const [messages, setMessages] = useState([]); // { id, text, type }
  const timersRef = useRef(new Map());

  const removeMessage = useCallback((id) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
  }, []);

  const showMessage = useCallback((text, type = "info", duration = 1 * 20 * 1000) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    setMessages((prev) => {
      // keep maxToasts (newest last)
      const next = [...prev, { id, text, type }];
      return next.slice(-maxToasts);
    });

    // schedule auto-remove
    const timer = setTimeout(() => removeMessage(id), duration);
    timersRef.current.set(id, timer);
    return id;
  }, [maxToasts, removeMessage]);

  useEffect(() => {
    // cleanup timers on unmount
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, []);

  // small helper to map type to bootstrap classes
  const typeToClass = (type) => {
    switch ((type || "").toLowerCase()) {
      case "success":
        return "alert-success";
      case "error":
      case "danger":
        return "alert-danger";
      case "warning":
        return "alert-warning";
      case "info":
      default:
        return "alert-info";
    }
  };

  // position styles (top-right stack)
  const containerStyle = {
  position: "fixed",
  top: "20px",
  left: "50%",
  transform: "translateX(-50%)", // centers horizontally
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  maxWidth: "600px", // so it doesn’t stretch too wide
  padding: "0 16px",
};


  return (
    <MessageContext.Provider value={{ showMessage, removeMessage, messages }}>
      {children}
      {/* Toast container */}
      <div aria-live="polite" aria-atomic="true" style={containerStyle}>
        {messages.map((m) => (
          <div
            key={m.id}
            role="alert"
            className={`alert ${typeToClass(m.type)} shadow-sm`}
            style={{ minWidth: 280, maxWidth: 420 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>{m.text}</div>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => removeMessage(m.id)}
                style={{ marginLeft: 12 }}
              />
            </div>
          </div>
        ))}
      </div>
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error("useMessage must be used within MessageProvider");
  return ctx;
};
