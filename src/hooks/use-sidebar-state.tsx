// src/hooks/use-sidebar-state.tsx
import { useState } from "react";
import { useLocation } from "react-router-dom";

export const useSidebarState = () => {
  const location = useLocation();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Check if current route is editor
  const isEditorRoute =
    location.pathname.includes("/question-detail/") ||
    location.pathname.includes("/contest-joined/");

  const openHistory = () => setIsHistoryOpen(true);
  const closeHistory = () => setIsHistoryOpen(false);
  const toggleHistory = () => setIsHistoryOpen((prev) => !prev);

  return {
    isHistoryOpen,
    isEditorRoute,
    openHistory,
    closeHistory,
    toggleHistory,
  };
};
