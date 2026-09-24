type CottageProps = {
    x?: number;
    y?: number;
    scale?: number;
  };
  
  export function Cottage({
    x = 330,
    y = 500,
    scale = 1,
  }: CottageProps) {
    return (
      <g
        transform={`translate(${x} ${y}) scale(${scale})`}
        aria-label="Cottage"
      >
        <rect
          x="-105"
          y="0"
          width="210"
          height="135"
          rx="5"
          className="fill-background/70 stroke-muted-foreground/30"
          strokeWidth="4"
        />
  
        <path
          d="M-125 5 L0 -100 L125 5 Z"
          className="fill-muted-foreground/20 stroke-muted-foreground/35"
          strokeWidth="5"
          strokeLinejoin="round"
        />
  
        <rect
          x="-28"
          y="65"
          width="56"
          height="70"
          rx="4"
          className="fill-muted-foreground/15 stroke-muted-foreground/30"
          strokeWidth="3"
        />
  
        <circle
          cx="0"
          cy="100"
          r="4"
          className="fill-muted-foreground/50"
        />
  
        <rect
          x="-75"
          y="42"
          width="38"
          height="38"
          rx="3"
          className="fill-primary/10 stroke-primary/25"
          strokeWidth="3"
        />
  
        <path
          d="M-56 42 V80 M-75 61 H-37"
          className="stroke-primary/25"
          strokeWidth="2"
        />
  
        <rect
          x="37"
          y="42"
          width="38"
          height="38"
          rx="3"
          className="fill-primary/10 stroke-primary/25"
          strokeWidth="3"
        />
  
        <path
          d="M56 42 V80 M37 61 H75"
          className="stroke-primary/25"
          strokeWidth="2"
        />
  
        <rect
          x="72"
          y="-30"
          width="22"
          height="50"
          className="fill-muted-foreground/20 stroke-muted-foreground/30"
          strokeWidth="3"
        />
      </g>
    );
  }