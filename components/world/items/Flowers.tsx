type FlowersProps = {
    x?: number;
    y?: number;
    scale?: number;
  };
  
  export function Flowers({
    x = 420,
    y = 610,
    scale = 1,
  }: FlowersProps) {
    const flowers = [
      { x: 0, y: 0, size: 1 },
      { x: 35, y: -12, size: 0.8 },
      { x: 68, y: 5, size: 1.1 },
      { x: 100, y: -8, size: 0.75 },
      { x: 130, y: 8, size: 0.9 },
    ];
  
    return (
      <g
        transform={`translate(${x} ${y}) scale(${scale})`}
        aria-label="Flowers"
      >
        {flowers.map((flower, index) => (
          <g
            key={index}
            transform={`translate(${flower.x} ${flower.y}) scale(${flower.size})`}
          >
            <path
              d="M0 0 L0 45"
              className="stroke-primary/40"
              strokeWidth="3"
              strokeLinecap="round"
            />
  
            <circle
              cx="0"
              cy="0"
              r="7"
              className="fill-primary/45"
            />
  
            <circle
              cx="-8"
              cy="0"
              r="6"
              className="fill-primary/25"
            />
  
            <circle
              cx="8"
              cy="0"
              r="6"
              className="fill-primary/25"
            />
  
            <circle
              cx="0"
              cy="-8"
              r="6"
              className="fill-primary/30"
            />
  
            <circle
              cx="0"
              cy="8"
              r="6"
              className="fill-primary/30"
            />
          </g>
        ))}
      </g>
    );
  }