'use client';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  showLabels?: boolean;
  unit?: string;
}

export function LineChart({ data, color = '#0EA5E9', height = 120, showLabels = true, unit = '' }: LineChartProps) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center text-gray-400 text-sm" style={{ height }}>
        Not enough data yet
      </div>
    );
  }

  const W = 300, H = height;
  const PAD = { top: 10, right: 10, bottom: showLabels ? 24 : 10, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const values = data.map(d => d.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  const points = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * innerW,
    y: PAD.top + innerH - ((d.value - minV) / range) * innerH,
    ...d,
  }));

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  const areaPoints = [
    `${points[0].x},${PAD.top + innerH}`,
    ...points.map(p => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${PAD.top + innerH}`,
  ].join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Y-axis labels */}
      {[0, 0.5, 1].map(t => {
        const v = minV + t * range;
        const y = PAD.top + innerH - t * innerH;
        return (
          <g key={t}>
            <line x1={PAD.left - 4} y1={y} x2={W - PAD.right} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
              {v % 1 === 0 ? v : v.toFixed(1)}{unit}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />

      {/* Line */}
      <polyline points={polylinePoints} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="white" strokeWidth="1.5" />
      ))}

      {/* X labels */}
      {showLabels && points.map((p, i) => {
        if (data.length > 8 && i % Math.ceil(data.length / 6) !== 0) return null;
        return (
          <text key={i} x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">
            {p.label}
          </text>
        );
      })}
    </svg>
  );
}

interface BarChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  showLabels?: boolean;
  unit?: string;
}

export function BarChart({ data, color = '#0EA5E9', height = 120, showLabels = true, unit = '' }: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-400 text-sm" style={{ height }}>
        No data yet
      </div>
    );
  }

  const W = 300, H = height;
  const PAD = { top: 10, right: 10, bottom: showLabels ? 24 : 10, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxV = Math.max(...data.map(d => d.value), 1);
  const barW = Math.max(4, (innerW / data.length) * 0.7);
  const gap = innerW / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {[0, 0.5, 1].map(t => {
        const v = t * maxV;
        const y = PAD.top + innerH - t * innerH;
        return (
          <g key={t}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
              {v % 1 === 0 ? v : v.toFixed(1)}{unit}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const barH = (d.value / maxV) * innerH;
        const x = PAD.left + i * gap + (gap - barW) / 2;
        const y = PAD.top + innerH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="2" fill={color} opacity="0.85" />
            {showLabels && (
              <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

interface PieChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
}

export function PieChart({ data, size = 120 }: PieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center text-gray-400 text-sm" style={{ width: size, height: size }}>
        No data
      </div>
    );
  }

  const cx = size / 2, cy = size / 2, r = size * 0.42;
  let angle = -Math.PI / 2;

  const slices = data.map(d => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    return { ...d, path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z` };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

interface CircularProgressProps {
  value: number;     // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  unit?: string;
  current?: number;
  target?: number;
}

export function CircularProgress({ value, size = 80, strokeWidth = 8, color = '#0EA5E9', label, unit = '', current, target }: CircularProgressProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const offset = circumference - (pct / 100) * circumference;

  const displayColor = pct > 110 ? '#EF4444' : pct > 90 ? '#F97316' : color;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={displayColor} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-gray-800">{pct}%</span>
        </div>
      </div>
      {label && <span className="text-xs font-medium text-gray-600 text-center">{label}</span>}
      {(current !== undefined && target !== undefined) && (
        <span className="text-xs text-gray-400">{current}{unit} / {target}{unit}</span>
      )}
    </div>
  );
}
