"use client";
import { useState } from "react";

interface PlanPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (plan: "monthly" | "annual") => void;
}

export default function PlanPicker({
  isOpen,
  onClose,
  onSelect,
}: PlanPickerProps) {
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.4)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--panel-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
        }}
      >
        <h3 style={{ margin: 0, color: "var(--text-primary)", fontSize: 16, fontWeight: 700 }}>
          Unlock Full VERA
        </h3>
        <p style={{ color: "var(--text-soft)", fontSize: 13, marginTop: 8 }}>
          Unlimited access, voice, saved history, and more.
        </p>
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          <button
            onClick={async () => {
              setLoading("monthly");
              onSelect("monthly");
            }}
            disabled={loading === "monthly" || loading === "annual"}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid var(--border-color)",
              background:
                loading === "monthly"
                  ? "linear-gradient(135deg, #8B5CF6, #3B82F6)"
                  : "linear-gradient(135deg, #8B5CF6, #3B82F6)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {loading === "monthly" ? "Redirecting…" : "Upgrade • $12 / month"}
          </button>
          <button
            onClick={async () => {
              setLoading("annual");
              onSelect("annual");
            }}
            disabled={loading === "monthly" || loading === "annual"}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid var(--border-color)",
              background: "#fff",
              color: "#3B82F6",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {loading === "annual" ? "Redirecting…" : "Best Value • $99 / year"}
          </button>
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: 12,
            background: "transparent",
            border: "none",
            color: "var(--text-soft)",
            cursor: "pointer",
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
