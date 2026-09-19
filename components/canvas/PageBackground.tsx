"use client";

import type { PageType, ThemeName } from "@/lib/db/types";

type PageBackgroundProps = {
  pageType: PageType;
  theme?: ThemeName;
};

const themeStyles: Record<
  ThemeName,
  {
    background: string;
    foreground: string;
  }
> = {
  light: {
    background: "#ffffff",
    foreground: "#111111",
  },
  dark: {
    background: "#181818",
    foreground: "#f5f5f5",
  },
  warm: {
    background: "#fff8e7",
    foreground: "#3b3428",
  },
};

export function PageBackground({
  pageType,
  theme = "light",
}: PageBackgroundProps) {
  const colors = themeStyles[theme];

  const lineColor =
    theme === "dark"
      ? "rgba(255,255,255,0.14)"
      : "rgba(0,0,0,0.14)";

  const gridColor =
    theme === "dark"
      ? "rgba(255,255,255,0.10)"
      : "rgba(0,0,0,0.10)";

  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        backgroundColor: colors.background,
        color: colors.foreground,
        backgroundImage:
          pageType === "grid"
            ? `
              linear-gradient(${gridColor} 1px, transparent 1px),
              linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
            `
            : pageType === "lined"
              ? `
                repeating-linear-gradient(
                  to bottom,
                  transparent 0,
                  transparent 31px,
                  ${lineColor} 32px
                )
              `
              : pageType === "box"
                ? `
                  repeating-linear-gradient(
                    to bottom,
                    transparent 0,
                    transparent 31px,
                    ${lineColor} 32px
                  ),
                  repeating-linear-gradient(
                    to right,
                    transparent 0,
                    transparent 31px,
                    ${lineColor} 32px
                  )
                `
                : "none",
        backgroundSize:
          pageType === "grid" ? "32px 32px" : undefined,
      }}
    />
  );
}