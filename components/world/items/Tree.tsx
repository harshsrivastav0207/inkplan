type TreeProps = {
    x?: number;
    y?: number;
    scale?: number;
  };
  
  export function Tree({
    x = 300,
    y = 500,
    scale = 1,
  }: TreeProps) {
    return (
      <g
        transform={`translate(${x} ${y}) scale(${scale})`}
        aria-label="Tree"
      >
        <path
          d="M-12 115 C-10 75 -8 40 0 0 C8 40 10 75 12 115 Z"
          className="fill-muted-foreground/50"
        />
  
        <circle
          cx="-34"
          cy="12"
          r="42"
          className="fill-primary/25 stroke-primary/35"
          strokeWidth="3"
        />
  
        <circle
          cx="12"
          cy="-8"
          r="52"
          className="fill-primary/30 stroke-primary/40"
          strokeWidth="3"
        />
  
        <circle
          cx="52"
          cy="18"
          r="38"
          className="fill-primary/20 stroke-primary/30"
          strokeWidth="3"
        />
  
        <circle
          cx="5"
          cy="-42"
          r="38"
          className="fill-primary/25 stroke-primary/35"
          strokeWidth="3"
        />
      </g>
    );
  }