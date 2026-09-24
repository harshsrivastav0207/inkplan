"use client";

import { WorldItems } from "./WorldItems";

export function WorldScene() {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-card">
      <svg
        viewBox="0 0 1200 720"
        className="block h-auto w-full"
        role="img"
        aria-label="InkPlan progress world"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Sky */}
        <rect
          x="0"
          y="0"
          width="1200"
          height="720"
          className="fill-background"
        />

        {/* Distant hills */}
        <path
          d="M0 310 C180 210 300 260 450 320 C610 385 735 220 900 270 C1040 312 1110 250 1200 205 L1200 720 L0 720 Z"
          className="fill-muted/60"
        />

        {/* Main hills */}
        <path
          d="M0 390 C170 315 300 350 440 410 C590 475 720 320 875 355 C1020 388 1090 330 1200 290 L1200 720 L0 720 Z"
          className="fill-muted"
        />

        {/* Ground */}
        <path
          d="M0 470 C190 430 330 465 500 490 C670 515 830 440 1000 455 C1080 462 1140 445 1200 430 L1200 720 L0 720 Z"
          className="fill-primary/10"
        />

        {/* Walking path */}
        <path
          d="M510 720 C535 640 610 585 660 530 C700 486 730 462 770 440"
          fill="none"
          className="stroke-muted-foreground/20"
          strokeWidth="70"
          strokeLinecap="round"
        />

        {/* Pond placeholder area */}
        <ellipse
          cx="890"
          cy="560"
          rx="145"
          ry="72"
          className="fill-primary/10 stroke-primary/20"
          strokeWidth="3"
        />

        {/* Sun */}
        <circle
          cx="1040"
          cy="125"
          r="48"
          className="fill-primary/10 stroke-primary/20"
          strokeWidth="3"
        />

        {/* World objects */}
        <WorldItems />
      </svg>
    </div>
  );
}