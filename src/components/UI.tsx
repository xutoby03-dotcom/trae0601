import { useEffect, useState, type ReactNode } from "react";

interface GameCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "gold" | "red" | "green" | "none";
}

export function GameCard({
  children,
  className = "",
  hover = false,
  glow = "none",
}: GameCardProps) {
  const glowMap = {
    gold: "hover:shadow-[0_0_20px_rgba(212,168,75,0.15)]",
    red: "hover:shadow-[0_0_20px_rgba(181,84,74,0.2)]",
    green: "hover:shadow-[0_0_20px_rgba(46,93,75,0.2)]",
    none: "",
  };

  return (
    <div
      className={`rounded-xl border border-[#3E2723]/50 bg-gradient-to-br from-[#2a1f14] to-[#1e150d] p-4 shadow-lg ${
        hover ? "transition-all duration-300 hover:-translate-y-0.5 " + glowMap[glow] : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function StatusBadge({
  variant,
  children,
}: {
  variant: "warning" | "danger" | "success" | "info" | "muted";
  children: ReactNode;
}) {
  const styles = {
    warning:
      "bg-[#D4A84B]/15 text-[#D4A84B] border-[#D4A84B]/30",
    danger: "bg-[#B5544A]/15 text-[#B5544A] border-[#B5544A]/30",
    success: "bg-[#2E5D4B]/20 text-[#5aad7e] border-[#2E5D4B]/40",
    info: "bg-[#4a7fb5]/15 text-[#7ab0e0] border-[#4a7fb5]/30",
    muted: "bg-[#FAF3E0]/5 text-[#FAF3E0]/50 border-[#FAF3E0]/10",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-[#D4A84B]">
      {icon}
      {children}
    </h2>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 text-4xl opacity-40">{icon}</div>
      <p className="mb-1 font-medium text-[#FAF3E0]/50">{title}</p>
      <p className="text-sm text-[#FAF3E0]/30">{description}</p>
    </div>
  );
}
