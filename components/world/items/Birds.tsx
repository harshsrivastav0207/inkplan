type BirdsProps = {
    x?: number;
    y?: number;
    scale?: number;
  };
  
  export function Birds({
    x = 800,
    y = 180,
    scale = 1,
  }: BirdsProps) {
    const birds = [
      { x: 0, y: 0, size: 1 },
      { x: 70, y: -25, size: 0.8 },
      { x: 135, y: 15, size: 0.65 },
    ];
  
    return (
      <g
        transform={`translate(${x} ${y}) scale(${scale})`}
        aria-label="Birds"
      >
        {birds.map((bird, index) => (
          <path
            key={index}
            d="M0 0 Q10 -10 20 0 Q30 -10 40 0"
            transform={`translate(${bird.x} ${bird.y}) scale(${bird.size})`}
            fill="none"
            className="stroke-muted-foreground/45"
            strokeWidth="4"
            strokeLinecap="round"
          />
        ))}
      </g>
    );
  }