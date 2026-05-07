import { useEffect, useState } from "react";

export const getRelativeTime = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

export const getFormattedDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(',', ' •');
};

export const getTimeAgo = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
  return `${Math.floor(diffMins / 1440)}d`;
};

export default function useFormattedTime(dateStr) {
  const [timeInfo, setTimeInfo] = useState({
    formatted: getFormattedDate(dateStr),
    relative: getRelativeTime(dateStr),
    compact: getTimeAgo(dateStr),
    time: dateStr ? new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—",
    date: dateStr ? new Date(dateStr).toLocaleDateString("en-GB") : "—"
  });

  useEffect(() => {
    if (!dateStr) return;

    const update = () =>
      setTimeInfo({
        formatted: getFormattedDate(dateStr),
        relative: getRelativeTime(dateStr),
        compact: getTimeAgo(dateStr),
        time: new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(dateStr).toLocaleDateString("en-GB")
      });

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [dateStr]);

  return timeInfo;
}