type BenchProps = {
    x?: number;
    y?: number;
    scale?: number;
  };
  
  export function Bench({
    x = 600,
    y = 560,
    scale = 1,
  }: BenchProps) {
    return (
      <g
        transform={`translate(${x} ${y}) scale(${scale})`}
        aria-label="Bench"
      >
        <rect
          x="-65"
          y="-18"
          width="130"
          height="18"
          rx="5"
          className="fill-muted-foreground/35 stroke-muted-foreground/45"
          strokeWidth="3"
        />
  
        <rect
          x="-58"
          y="-45"
          width="116"
          height="20"
          rx="5"
          className="fill-muted-foreground/25 stroke-muted-foreground/40"
          strokeWidth="3"
        />
  
        <path
          d="M-45 0 L-52 55 M45 0 L52 55"
          className="stroke-muted-foreground/45"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>
    );
  }