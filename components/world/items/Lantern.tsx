type LanternProps = {
    x?: number;
    y?: number;
    scale?: number;
  };
  
  export function Lantern({
    x = 760,
    y = 485,
    scale = 1,
  }: LanternProps) {
    return (
      <g
        transform={`translate(${x} ${y}) scale(${scale})`}
        aria-label="Lantern"
      >
        <path
          d="M0 0 L0 105"
          className="stroke-muted-foreground/50"
          strokeWidth="8"
          strokeLinecap="round"
        />
  
        <path
          d="M-25 0 Q0 -25 25 0"
          fill="none"
          className="stroke-muted-foreground/50"
          strokeWidth="7"
          strokeLinecap="round"
        />
  
        <rect
          x="-20"
          y="0"
          width="40"
          height="48"
          rx="6"
          className="fill-primary/15 stroke-primary/35"
          strokeWidth="3"
        />
  
        <circle
          cx="0"
          cy="24"
          r="10"
          className="fill-primary/35"
        />
  
        <path
          d="M-30 105 H30"
          className="stroke-muted-foreground/45"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>
    );
  }