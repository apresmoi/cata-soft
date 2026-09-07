/** Minimal hand-rolled SVG sparkline -- no charting library. */
type SparklineProps = {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
};

export default function Sparkline({ values, width = 160, height = 40, color = "#44aba3" }: SparklineProps): JSX.Element | null {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.min(...values) === Math.max(...values) ? min + 1 : Math.max(...values);
  const pad = 4;
  const stepX = (width - pad * 2) / (values.length - 1);

  const coords = values.map((v, i) => ({
    x: pad + i * stepX,
    y: pad + (height - pad * 2) * (1 - (v - min) / (max - min)),
  }));
  const last = coords[coords.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        points={coords.map((c) => `${c.x},${c.y}`).join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r={3.5} fill={color} />
    </svg>
  );
}
