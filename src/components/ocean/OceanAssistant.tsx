"use client";

import { Sparkles } from "lucide-react";

export default function OceanAssistant({
  children,
  tone = "default",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "default" | "onDark";
  className?: string;
}) {
  const onDark = tone === "onDark";
  return (
    <p
      className={`flex items-start gap-2 text-sm leading-relaxed mb-4 ${
        onDark ? "text-white/80" : "text-gray-500 dark:text-gray-400"
      } ${className}`}
    >
      <Sparkles
        size={16}
        className={`mt-0.5 flex-shrink-0 ${onDark ? "text-sky-300" : "text-indigo-400 dark:text-indigo-300"}`}
        aria-hidden
      />
      <span>{children}</span>
    </p>
  );
}
