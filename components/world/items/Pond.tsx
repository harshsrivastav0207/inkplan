type PondProps = {
    x?: number;
    y?: number;
    scale?: number;
  };
  
  export function Pond({
    x = 900,
    y = 555,
    scale = 1,
  }: PondProps) {
    return (
      <g
        transform={`translate(${x} ${y}) scale(${scale})`}
        aria-label="Pond"
      >
        <ellipse
          cx="0"
          cy="0"
          rx="150"
          ry="72"
          className="fill-primary/15 stroke-primary/30"
          strokeWidth="4"
        />
  
        <ellipse
          cx="-35"
          cy="-10"
          rx="82"
          ry="28"
          className="fill-background/20"
        />
  
        <path
          d="M-65 10 C-30 -5 5 25 40 8"
          fill="none"
          className="stroke-primary/25"
          strokeWidth="3"
          strokeLinecap="round"
        />
  
        <path
          d="M20 38 C45 25 72 48 98 35"
          fill="none"
          className="stroke-primary/20"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    );
  }