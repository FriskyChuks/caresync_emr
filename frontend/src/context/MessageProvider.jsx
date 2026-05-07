import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Bell } from "lucide-react";

const MessageContext = createContext(null);

export const MessageProvider = ({ children, maxToasts = 4 }) => {
  const [messages, setMessages] = useState([]);
  const timersRef = useRef(new Map());

  const removeMessage = useCallback((id) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
  }, []);

  const showMessage = useCallback((text, type = "info", duration = 5000) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    setMessages((prev) => {
      const next = [...prev, { id, text, type }];
      return next.slice(-maxToasts);
    });

    const timer = setTimeout(() => removeMessage(id), duration);
    timersRef.current.set(id, timer);
    return id;
  }, [maxToasts, removeMessage]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, []);

  // Map type to Tailwind classes and icons
  const getMessageConfig = (type) => {
    const configs = {
      success: {
        bg: "bg-gradient-to-r from-emerald-50 to-green-50",
        border: "border-emerald-200",
        text: "text-emerald-800",
        icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
        iconBg: "bg-emerald-100",
        progress: "bg-emerald-500"
      },
      error: {
        bg: "bg-gradient-to-r from-red-50 to-rose-50",
        border: "border-red-200",
        text: "text-red-800",
        icon: <AlertCircle className="h-5 w-5 text-red-600" />,
        iconBg: "bg-red-100",
        progress: "bg-red-500"
      },
      warning: {
        bg: "bg-gradient-to-r from-amber-50 to-yellow-50",
        border: "border-amber-200",
        text: "text-amber-800",
        icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
        iconBg: "bg-amber-100",
        progress: "bg-amber-500"
      },
      info: {
        bg: "bg-gradient-to-r from-blue-50 to-cyan-50",
        border: "border-blue-200",
        text: "text-blue-800",
        icon: <Info className="h-5 w-5 text-blue-600" />,
        iconBg: "bg-blue-100",
        progress: "bg-blue-500"
      },
      default: {
        bg: "bg-gradient-to-r from-gray-50 to-gray-100",
        border: "border-gray-200",
        text: "text-gray-800",
        icon: <Bell className="h-5 w-5 text-gray-600" />,
        iconBg: "bg-gray-100",
        progress: "bg-gray-500"
      }
    };
    
    return configs[type?.toLowerCase()] || configs.default;
  };

  return (
    <MessageContext.Provider value={{ showMessage, removeMessage, messages }}>
      {children}
      
      {/* Toast Container */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="fixed top-4 right-4 z-[9998] flex flex-col items-end space-y-3 max-w-md w-full"
      >
        {messages.map((m) => {
          const config = getMessageConfig(m.type);
          
          return (
            <div
              key={m.id}
              role="alert"
              className={`
                relative w-full max-w-sm animate-slide-in-right
                ${config.bg} border ${config.border} rounded-xl shadow-lg
                overflow-hidden transform transition-all duration-300
                hover:shadow-xl hover:scale-[1.02]
              `}
            >
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
                <div 
                  className={`h-full ${config.progress} transition-all duration-1000 ease-linear`}
                  style={{ width: '100%' }}
                ></div>
              </div>
              
              {/* Message Content */}
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`h-10 w-10 rounded-lg ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
                    {config.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${config.text}`}>
                      {m.text}
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeMessage(m.id)}
                    className={`
                      h-8 w-8 rounded-lg flex items-center justify-center
                      hover:bg-white/50 transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
                      ${config.text}
                    `}
                    aria-label="Close message"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Type Indicator */}
              <div className={`absolute bottom-0 left-0 h-1 w-12 ${config.progress}`}></div>
            </div>
          );
        })}
      </div>
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error("useMessage must be used within MessageProvider");
  return ctx;
};