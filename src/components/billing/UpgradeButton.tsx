"use client";

import React from "react";

interface UpgradeButtonProps {
  onClick: () => void;
}

export default function UpgradeButton({ onClick }: UpgradeButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Upgrade to premium plan"
      style={{
        position: "fixed",
        top: "16px",
        right: "170px",
        zIndex: 110,
        background: "linear-gradient(135deg, #8B5CF6, #3B82F6)",
        color: "#fff",
        border: "none",
        borderRadius: "999px",
        padding: "6px 10px",
        fontSize: "11px",
        fontWeight: 700,
        boxShadow: "0 6px 16px rgba(59, 130, 246, 0.35)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        textAlign: "center",
        minWidth: "100px",
        maxWidth: "180px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(59, 130, 246, 0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.35)";
      }}
    >
      Upgrade • $12/mo
    </button>
  );
}
