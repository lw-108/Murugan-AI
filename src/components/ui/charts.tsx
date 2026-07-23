// Custom chart component library matching @bklitui/ui/charts API
// Implements: PieChart, PieSlice, PieCenter, BarChart, Bar, BarXAxis,
//             LineChart, Line, XAxis, Grid, Background, ChartLegend,
//             ChartBrushLayout, ChartTooltip, curveCatmullRom

import React, { createContext, useContext, useState, useRef } from "react";
import { createPortal } from "react-dom";

// ─── Shared types ────────────────────────────────────────────────────────────
type DataRecord = Record<string, string | number | Date>;

// ─── Curve tokens (compatible with @visx/curve API shape) ───────────────────
export const curveCatmullRom = "catmullRom" as const;
export const curveLinear     = "linear"     as const;

// ─── Math helpers ─────────────────────────────────────────────────────────────

/** Catmull-Rom cubic spline path through 2-D points */
function catmullRomPath(pts: [number, number][], alpha = 0.5): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) * alpha / 3;
    const cp1y = p1[1] + (p2[1] - p0[1]) * alpha / 3;
    const cp2x = p2[0] - (p3[0] - p1[0]) * alpha / 3;
    const cp2y = p2[1] - (p3[1] - p1[1]) * alpha / 3;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeSlice(
  cx: number, cy: number,
  outerR: number, innerR: number,
  start: number, end: number, gap = 4,
  cornerRadius = 6,
) {
  const startDeg = start + gap / 2;
  const endDeg = end - gap / 2;
  if (endDeg <= startDeg) return "";

  const thickness = outerR - innerR;
  const r = Math.min(cornerRadius, thickness / 2);

  // Angular offset produced by the corner rounding arcs
  const outerAngleOffset = (r / outerR) * (180 / Math.PI);
  const innerAngleOffset = (r / innerR) * (180 / Math.PI);

  const a1 = startDeg + outerAngleOffset;
  const a2 = endDeg - outerAngleOffset;
  const a3 = endDeg - innerAngleOffset;
  const a4 = startDeg + innerAngleOffset;

  // If the segment is too small for rounded corners, fall back to simple arcs
  if (a2 <= a1) {
    const s1 = polarToCartesian(cx, cy, outerR, startDeg);
    const e1 = polarToCartesian(cx, cy, outerR, endDeg);
    const s2 = polarToCartesian(cx, cy, innerR, endDeg);
    const e2 = polarToCartesian(cx, cy, innerR, startDeg);
    const large = (endDeg - startDeg) > 180 ? 1 : 0;
    return `M ${s1.x} ${s1.y} A ${outerR} ${outerR} 0 ${large} 1 ${e1.x} ${e1.y} L ${s2.x} ${s2.y} A ${innerR} ${innerR} 0 ${large} 0 ${e2.x} ${e2.y} Z`;
  }

  // 8 control points for a rounded-corner annular segment:
  // Outer: p1→(corner arc)→p2→(main arc)→p3→(corner arc)→p4
  // Inner: p5→(corner arc)→p6→(main arc)→p7→(corner arc)→p8
  const p1 = polarToCartesian(cx, cy, outerR - r, startDeg);
  const p2 = polarToCartesian(cx, cy, outerR, a1);
  const p3 = polarToCartesian(cx, cy, outerR, a2);
  const p4 = polarToCartesian(cx, cy, outerR - r, endDeg);
  const p5 = polarToCartesian(cx, cy, innerR + r, endDeg);
  const p6 = polarToCartesian(cx, cy, innerR, a3);
  const p7 = polarToCartesian(cx, cy, innerR, a4);
  const p8 = polarToCartesian(cx, cy, innerR + r, startDeg);

  const sweepOuter = a2 - a1;
  const sweepInner = a3 - a4;
  const largeOuter = sweepOuter > 180 ? 1 : 0;
  const largeInner = sweepInner > 180 ? 1 : 0;

  return `M ${p1.x} ${p1.y} ` +
    `A ${r} ${r} 0 0 1 ${p2.x} ${p2.y} ` +
    `A ${outerR} ${outerR} 0 ${largeOuter} 1 ${p3.x} ${p3.y} ` +
    `A ${r} ${r} 0 0 1 ${p4.x} ${p4.y} ` +
    `L ${p5.x} ${p5.y} ` +
    `A ${r} ${r} 0 0 1 ${p6.x} ${p6.y} ` +
    `A ${innerR} ${innerR} 0 ${largeInner} 0 ${p7.x} ${p7.y} ` +
    `A ${r} ${r} 0 0 1 ${p8.x} ${p8.y} Z`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PIE / GAUGE CHART
// ─────────────────────────────────────────────────────────────────────────────

type PieDataItem = { label: string; value: number; color: string };

type PieChartCtxType = {
  data: PieDataItem[];
  size: number;
  innerRadius: number;
  total: number;
  slices: { startAngle: number; endAngle: number; item: PieDataItem }[];
  activeIndex: number | null;
  setActiveIndex: (i: number | null) => void;
  setMousePos: (pos: { x: number; y: number }) => void;
  startAngle: number;
  endAngle: number;
  isGauge: boolean;
  cx: number;
  cy: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

const PieChartCtx = createContext<PieChartCtxType | null>(null);

export function PieChart({
  data, size = 280, innerRadius = 0, startAngle = 0, endAngle = 360, children,
}: {
  data: PieDataItem[];
  size?: number;
  innerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  children?: React.ReactNode;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const angleRange = endAngle - startAngle;
  const isGauge = angleRange < 360;

  let cum = startAngle;
  const slices = data.map(item => {
    const sAngle = cum;
    cum += (item.value / total) * angleRange;
    return { startAngle: sAngle, endAngle: cum, item };
  });

  // For a gauge arc we need to compute the bounding box of the arc to size the viewBox correctly.
  const outerR = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  // Compute vertical bounds of the arc for gauge mode
  let svgHeight = size;
  let viewBoxY = 0;
  let viewBoxH = size;

  if (isGauge) {
    // Find the topmost and bottommost points of the arc
    const startPt = polarToCartesian(cx, cy, outerR, startAngle);
    const endPt = polarToCartesian(cx, cy, outerR, endAngle);
    let minY = Math.min(startPt.y, endPt.y);
    let maxY = Math.max(startPt.y, endPt.y);

    // Check cardinal directions within the arc sweep
    for (let cardinal = 0; cardinal <= 360; cardinal += 90) {
      let deg = cardinal;
      while (deg < startAngle) deg += 360;
      if (deg <= endAngle) {
        const pt = polarToCartesian(cx, cy, outerR, deg);
        minY = Math.min(minY, pt.y);
        maxY = Math.max(maxY, pt.y);
      }
    }

    const padding = 8;
    viewBoxY = minY - padding;
    viewBoxH = maxY - viewBoxY + padding + 40;
    svgHeight = Math.round(viewBoxH);
  }

  const viewBox = isGauge
    ? `0 ${viewBoxY} ${size} ${viewBoxH}`
    : `0 0 ${size} ${size}`;

  const activeItem = activeIndex !== null ? slices[activeIndex].item : null;

  return (
    <PieChartCtx.Provider value={{ data, size, innerRadius, total, slices, activeIndex, setActiveIndex, setMousePos, startAngle, endAngle, isGauge, cx, cy, containerRef }}>
      <div ref={containerRef} className="relative inline-flex flex-col items-center select-none">
        {/* Cursor-following tooltip — portaled to body to escape backdrop-blur containing block */}
        {isGauge && activeItem && activeIndex !== null && createPortal(
          <div
            style={{
              position: "fixed",
              left: mousePos.x + 12,
              top: mousePos.y - 16,
              transform: "translateY(-100%)",
              zIndex: 99999,
              pointerEvents: "none",
              whiteSpace: "nowrap",
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow: "0 8px 30px rgb(0,0,0,0.06)",
              borderRadius: 16,
              padding: "12px 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, color: "#1e293b" }}>
              <span style={{ width: 12, height: 4, borderRadius: 9999, flexShrink: 0, backgroundColor: activeItem.color }} />
              {activeItem.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 8, gap: 16 }}>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 400 }}>No.of scans</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginLeft: 12 }}>
                {activeItem.value.toLocaleString()}
              </span>
            </div>
          </div>,
          document.body
        )}
        <svg width={size} height={svgHeight} viewBox={viewBox}>{children}</svg>
      </div>
    </PieChartCtx.Provider>
  );
}

export function PieSlice({ index }: { index: number }) {
  const { size, innerRadius, slices, activeIndex, setActiveIndex, setMousePos, cx, cy } = useContext(PieChartCtx)!;
  const outerR = size / 2 - 4 + (activeIndex === index ? 4 : 0);

  const { startAngle, endAngle, item } = slices[index];

  const d = describeSlice(cx, cy, outerR, innerRadius, startAngle, endAngle, 1.5, 4);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <path
      d={d}
      fill={item.color}
      opacity={activeIndex !== null && activeIndex !== index ? 0.55 : 1}
      style={{
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        filter: activeIndex === index ? "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" : "none",
      }}
      onMouseEnter={(e) => { setActiveIndex(index); setMousePos({ x: e.clientX, y: e.clientY }); }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setActiveIndex(null)}
    />
  );
}

export function PieCenter({ defaultLabel = "Total Scans" }: { defaultLabel?: string }) {
  const { total, isGauge, cx, cy } = useContext(PieChartCtx)!;
  // Position the text inside the arc: slightly above the geometric center for a gauge
  const textCy = isGauge ? cy + 10 : cy;
  return (
    <g>
      <text x={cx} y={textCy - 45} textAnchor="middle" fontSize={13} fontWeight={500} fill="#64748B" letterSpacing="-0.01em">{defaultLabel}</text>
      <text
        x={cx}
        y={textCy + 7}
        textAnchor="middle"
        fontSize={42}
        fontWeight={700}
        fill="#0F172A"
        style={{ letterSpacing: "-0.02em" }}
      >
        {total.toLocaleString()}
      </text>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BAR CHART
// ─────────────────────────────────────────────────────────────────────────────

type BarChartCtxType = {
  data: DataRecord[];
  xDataKey: string;
  maxValue: number;
  chartW: number; chartH: number;
  padding: { top: number; right: number; bottom: number; left: number };
  bars: { dataKey: string; fill: string }[];
  registerBar: (b: { dataKey: string; fill: string }) => void;
  enableGrid: () => void;
  tooltip: { visible: boolean; x: number; y: number; dataIndex: number } | null;
  setTooltip: (t: { visible: boolean; x: number; y: number; dataIndex: number } | null) => void;
};

const BarChartCtx = createContext<BarChartCtxType | null>(null);

export function BarChart({
  data, xDataKey, children,
  margin = { top: 16, right: 16, bottom: 40, left: 40 },
}: {
  data: DataRecord[]; xDataKey: string; children?: React.ReactNode;
  margin?: { top: number; right: number; bottom: number; left: number };
  stacked?: boolean;
}) {
  const [bars, setBars]       = useState<{ dataKey: string; fill: string }[]>([]);
  const [, setShowGrid]       = useState(false);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; dataIndex: number } | null>(null);
  const chartW = 480, chartH = 220;
  const allValues = data.flatMap(d => Object.entries(d).filter(([k]) => k !== xDataKey).map(([, v]) => Number(v)));
  const maxValue = Math.max(...allValues, 1);
  const registerBar = (b: { dataKey: string; fill: string }) =>
    setBars(prev => prev.find(x => x.dataKey === b.dataKey) ? prev : [...prev, b]);

  return (
    <BarChartCtx.Provider value={{ data, xDataKey, maxValue, chartW, chartH, padding: margin, bars, registerBar, enableGrid: () => setShowGrid(true), tooltip, setTooltip }}>
      <div className="relative w-full" style={{ paddingBottom: "56%" }}>
        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="xMidYMid meet">
          {children}
        </svg>
        {tooltip?.visible && (
          <div className="absolute bg-white border border-slate-200 rounded-xl shadow-lg p-2.5 text-xs pointer-events-none z-10"
            style={{ left: `${(tooltip.x / chartW) * 100}%`, top: `${(tooltip.y / chartH) * 100}%`, transform: "translate(-50%,-110%)" }}>
            <div className="font-semibold text-slate-700 mb-1">{String(data[tooltip.dataIndex][xDataKey])}</div>
            {bars.map(b => (
              <div key={b.dataKey} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: b.fill }} />
                <span className="text-slate-500">{b.dataKey}:</span>
                <span className="font-bold text-slate-800">{Number(data[tooltip.dataIndex][b.dataKey]).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </BarChartCtx.Provider>
  );
}

export function Bar({ dataKey, fill = "#0052FF" }: {
  dataKey: string; fill?: string; lineCap?: string; perspective?: boolean;
}) {
  const ctx = useContext(BarChartCtx)!;
  const { data, maxValue, chartW, chartH, padding, bars, registerBar, setTooltip } = ctx;
  React.useEffect(() => { registerBar({ dataKey, fill }); }, [dataKey, fill]);

  const innerW = chartW - padding.left - padding.right;
  const innerH = chartH - padding.top - padding.bottom;
  const barKeys = bars.length > 0 ? bars.map(b => b.dataKey) : [dataKey];
  const barCount = barKeys.length;
  const groupW = innerW / data.length;
  const barW = Math.max(8, groupW / barCount - 6);
  const ki = barKeys.indexOf(dataKey);
  if (ki === -1) return null;

  return (
    <g>
      {data.map((d, i) => {
        const bh = (Number(d[dataKey]) / maxValue) * innerH;
        const gx = padding.left + i * groupW + groupW / 2 - (barCount * (barW + 4)) / 2;
        const x = gx + ki * (barW + 4);
        const y = padding.top + innerH - bh;
        return (
          <rect key={i} x={x} y={y} width={barW} height={bh} rx={4} fill={fill} opacity={0.85}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setTooltip({ visible: true, x: x + barW / 2, y, dataIndex: i })}
            onMouseLeave={() => setTooltip(null)}
          />
        );
      })}
    </g>
  );
}

export function BarXAxis() {
  const { data, xDataKey, chartW, chartH, padding } = useContext(BarChartCtx)!;
  const innerW = chartW - padding.left - padding.right;
  const groupW = innerW / data.length;
  return (
    <g>
      {data.map((d, i) => (
        <text key={i} x={padding.left + i * groupW + groupW / 2} y={chartH - padding.bottom + 16}
          textAnchor="middle" fontSize={10} fill="#94A3B8" fontFamily="Inter, sans-serif">
          {String(d[xDataKey])}
        </text>
      ))}
      <line x1={padding.left} y1={chartH - padding.bottom} x2={chartW - padding.right} y2={chartH - padding.bottom} stroke="#E2E8F0" strokeWidth={1.5} />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LINE CHART
// ─────────────────────────────────────────────────────────────────────────────

type LineChartCtxType = {
  effectiveData: DataRecord[];
  xDataKey: string;
  chartW: number; chartH: number;
  padding: { top: number; right: number; bottom: number; left: number };
  getX: (i: number) => number;
  getY: (v: number) => number;
  lines: { dataKey: string; stroke: string }[];
  registerLine: (l: { dataKey: string; stroke: string }) => void;
  hoverIndex: number | null;
  setHoverIndex: (i: number | null) => void;
};

const LineChartCtx = createContext<LineChartCtxType | null>(null);

export function LineChart({
  data, xDataKey = "date", xDomain, children,
}: {
  data: DataRecord[];
  xDataKey?: string;
  xDomain?: [number, number];
  tweenYDomainOnXDomainChange?: boolean;
  children?: React.ReactNode;
}) {
  const [lines, setLines]           = useState<{ dataKey: string; stroke: string }[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mousePos, setMousePos]     = useState({ x: 0, y: 0 });

  const chartW = 540, chartH = 230;
  const padding = { top: 20, right: 20, bottom: 38, left: 12 };

  const effectiveData = xDomain ? data.slice(xDomain[0], xDomain[1] + 1) : data;

  const allVals = effectiveData.flatMap(d =>
    Object.entries(d).filter(([k]) => k !== xDataKey).map(([, v]) => Number(v)).filter(v => !isNaN(v))
  );
  const maxY = Math.max(...allVals, 1);

  const innerW = chartW - padding.left - padding.right;
  const innerH = chartH - padding.top - padding.bottom;
  const getX = (i: number) =>
    padding.left + (effectiveData.length < 2 ? innerW / 2 : (i / (effectiveData.length - 1)) * innerW);
  const getY = (v: number) =>
    padding.top + innerH - (v / maxY) * innerH;

  const registerLine = (l: { dataKey: string; stroke: string }) =>
    setLines(prev => prev.find(x => x.dataKey === l.dataKey) ? prev : [...prev, l]);

  return (
    <LineChartCtx.Provider value={{ effectiveData, xDataKey, chartW, chartH, padding, getX, getY, lines, registerLine, hoverIndex, setHoverIndex }}>
      <div className="relative w-full" style={{ paddingBottom: "52%" }}>
        <svg
          className="absolute inset-0 w-full h-full overflow-visible"
          viewBox={`0 0 ${chartW} ${chartH}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {children}

          {/* Vertical crosshair at hover */}
          {hoverIndex !== null && (
            <line
              x1={getX(hoverIndex)} y1={padding.top}
              x2={getX(hoverIndex)} y2={chartH - padding.bottom}
              stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="4 3"
              className="transition-all duration-150 ease-out"
              pointerEvents="none"
            />
          )}

          {/* Per-line hover dots rendered on top with drop shadow */}
          {hoverIndex !== null && lines.map(l => {
            const val = Number(effectiveData[hoverIndex][l.dataKey]);
            if (isNaN(val)) return null;
            return (
              <g key={l.dataKey} className="transition-all duration-150 ease-out">
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(val)}
                  r={8}
                  fill={l.stroke}
                  opacity={0.25}
                  pointerEvents="none"
                />
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(val)}
                  r={5}
                  fill={l.stroke}
                  stroke="white"
                  strokeWidth={2.5}
                  className="shadow-md"
                  pointerEvents="none"
                />
              </g>
            );
          })}

          {/* Invisible mouse capture overlay */}
          <rect
            x={padding.left} y={padding.top} width={innerW} height={innerH}
            fill="transparent"
            onMouseMove={e => {
              const svgEl = (e.currentTarget as SVGRectElement).ownerSVGElement!;
              const { left, width } = svgEl.getBoundingClientRect();
              const relX = ((e.clientX - left) / width) * chartW - padding.left;
              const idx = Math.round((relX / innerW) * (effectiveData.length - 1));
              setHoverIndex(Math.max(0, Math.min(effectiveData.length - 1, idx)));
              setMousePos({ x: e.clientX, y: e.clientY });
            }}
            onMouseLeave={() => setHoverIndex(null)}
          />
        </svg>

        {/* Floating tooltip – portaled to body, tracking mouse cursor */}
        {hoverIndex !== null && effectiveData[hoverIndex] && createPortal(
          <div
            style={{
              position: "fixed",
              left: mousePos.x + 12,
              top: mousePos.y - 16,
              transform: "translateY(-100%)",
              zIndex: 99999,
              pointerEvents: "none",
              whiteSpace: "nowrap",
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow: "0 8px 30px rgb(0,0,0,0.06)",
              borderRadius: 16,
              padding: "14px 18px",
            }}
          >
            {/* Month header */}
            <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 10px 0", fontWeight: 500 }}>
              {(() => {
                const raw = effectiveData[hoverIndex][xDataKey];
                if (raw instanceof Date)
                  return raw.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                return `${String(raw)}, 2026`;
              })()}
            </p>
            {/* Rows */}
            {lines.map(l => (
              <div key={l.dataKey} style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: "3px", paddingBottom: "3px" }}>
                <span style={{ width: 12, height: 4, borderRadius: 9999, flexShrink: 0, backgroundColor: l.stroke }} />
                <span style={{ fontSize: 13, color: "#475569", textTransform: "capitalize", flex: 1 }}>{l.dataKey}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginLeft: 16, fontFamily: "monospace" }}>
                  {Number(effectiveData[hoverIndex][l.dataKey]).toLocaleString()}
                </span>
              </div>
            ))}
          </div>,
          document.body
        )}
      </div>
    </LineChartCtx.Provider>
  );
}

export function Line({
  dataKey,
  stroke = "#0052FF",
  curve,
  strokeWidth = 2,
}: {
  dataKey: string;
  stroke?: string;
  curve?: string;
  fadeEdges?: boolean;
  strokeWidth?: number;
}) {
  const ctx = useContext(LineChartCtx)!;
  const { effectiveData, getX, getY, registerLine } = ctx;

  React.useEffect(() => { registerLine({ dataKey, stroke }); }, [dataKey, stroke]);

  const pts: [number, number][] = effectiveData.map((d, i) => [getX(i), getY(Number(d[dataKey]))]);
  if (pts.length < 2) return null;

  const pathD =
    curve === curveCatmullRom
      ? catmullRomPath(pts)
      : pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(" ");

  // No area fill, no per-point dots — just the smooth stroke line
  return (
    <path
      d={pathD}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

// ─── XAxis (for LineChart) ───────────────────────────────────────────────────
export function XAxis({ dataKey }: { dataKey?: string }) {
  const ctx = useContext(LineChartCtx)!;
  const { effectiveData, xDataKey, getX, chartH, padding } = ctx;
  const key = dataKey ?? xDataKey;
  const step = Math.max(1, Math.ceil(effectiveData.length / 8));
  const lastIdx = effectiveData.length - 1;

  return (
    <g>
      {effectiveData.map((d, i) => {
        if (i % step !== 0 && i !== lastIdx) return null;
        const raw = d[key];
        const label = raw instanceof Date
          ? raw.toLocaleDateString("en-US", { month: "short" })
          : String(raw);
        const isActive = i === lastIdx;  // highlight last (current) label
        return (
          <text key={i} x={getX(i)} y={chartH - padding.bottom + 18}
            textAnchor="middle"
            fontSize={12}
            fontWeight={isActive ? 700 : 400}
            fill={isActive ? "#2563EB" : "#9CA3AF"}
            fontFamily="Inter, sans-serif">
            {label}
          </text>
        );
      })}
    </g>
  );
}

// ─── Grid (works for both BarChart and LineChart) ────────────────────────────
export function Grid({ horizontal }: { horizontal?: boolean }) {
  const barCtx  = useContext(BarChartCtx);
  const lineCtx = useContext(LineChartCtx);
  const ctx = barCtx ?? lineCtx;
  if (!ctx) return null;

  // Only BarChart needs enableGrid signalling
  React.useEffect(() => { if (barCtx) barCtx.enableGrid(); }, []);

  const { chartW, chartH, padding } = ctx;
  const innerH = chartH - padding.top - padding.bottom;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => padding.top + innerH * (1 - f));

  return (
    <g>
      {horizontal && ticks.map((y, i) => (
        <line key={i} x1={padding.left} y1={y} x2={chartW - padding.right} y2={y}
          stroke="#F1F5F9" strokeWidth={1} strokeDasharray={i > 0 ? "3 3" : "0"} />
      ))}
    </g>
  );
}

// ─── Background ──────────────────────────────────────────────────────────────
export function Background({
  pattern, opacity = 1,
}: {
  pattern?: "dots" | "grid";
  opacity?: number;
}) {
  const lineCtx = useContext(LineChartCtx);
  const barCtx  = useContext(BarChartCtx);
  const ctx = lineCtx ?? barCtx;
  if (!ctx) return null;

  const { chartW, chartH, padding } = ctx;
  // Stable ID per mount
  const pid = useRef(`bgp-${Math.random().toString(36).slice(2, 9)}`).current;

  if (pattern === "dots") {
    return (
      <g opacity={opacity}>
        <defs>
          <pattern id={pid} x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#CBD5E1" />
          </pattern>
        </defs>
        <rect
          x={padding.left} y={padding.top}
          width={chartW - padding.left - padding.right}
          height={chartH - padding.top - padding.bottom}
          fill={`url(#${pid})`}
        />
      </g>
    );
  }
  return null;
}

// ─── ChartLegend ─────────────────────────────────────────────────────────────
export function ChartLegend({
  items,
  activeIndex,
  onHover,
}: {
  items?: { label: string; color: string }[];
  activeIndex?: number | null;
  onHover?: (index: number | null) => void;
} = {}) {
  const ctx = useContext(LineChartCtx);
  const resolved = items
    ?? ctx?.lines.map(l => ({ label: l.dataKey, color: l.stroke }))
    ?? [];
  if (resolved.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-600 mt-4 pt-3 border-t border-slate-100/80">
      {resolved.map((l, i) => {
        const isSelected = activeIndex === i;
        const isDimmed = activeIndex !== null && activeIndex !== undefined && !isSelected;
        return (
          <span
            key={l.label}
            onMouseEnter={() => onHover?.(i)}
            onMouseLeave={() => onHover?.(null)}
            className={`flex items-center gap-2 cursor-pointer transition-all duration-200 ${
              isDimmed ? "opacity-40" : "opacity-100 font-medium"
            }`}
          >
            <span
              className="w-4.5 h-1.5 rounded-full inline-block shrink-0 transition-all duration-200"
              style={{
                background: l.color,
                transform: isSelected ? "scale(1.15)" : "scale(1)",
              }}
            />
            <span className="capitalize text-slate-700">{l.label}</span>
          </span>
        );
      })}
    </div>
  );
}

// ─── ChartBrushLayout ────────────────────────────────────────────────────────
type BrushState = { type: "start" | "end" | "move"; startIdx: number; startRange: [number, number] };

export function ChartBrushLayout({
  data, enabled, height = 60, children,
}: {
  data: DataRecord[];
  enabled?: boolean;
  height?: number;
  brushStrip?: React.ReactNode;
  children: (layout: { xDomain: [number, number] }) => React.ReactNode;
}) {
  const [range, setRange]     = useState<[number, number]>([0, data.length - 1]);
  const [drag, setDrag]       = useState<BrushState | null>(null);
  const brushRef              = useRef<HTMLDivElement>(null);

  const idxFromClient = (clientX: number) => {
    if (!brushRef.current) return 0;
    const { left, width } = brushRef.current.getBoundingClientRect();
    return Math.round(Math.max(0, Math.min(data.length - 1, ((clientX - left) / width) * (data.length - 1))));
  };

  React.useEffect(() => {
    if (!drag) return;
    const onMove = (e: MouseEvent) => {
      const idx = idxFromClient(e.clientX);
      if (drag.type === "start") {
        setRange([Math.min(idx, drag.startRange[1] - 1), drag.startRange[1]]);
      } else if (drag.type === "end") {
        setRange([drag.startRange[0], Math.max(idx, drag.startRange[0] + 1)]);
      } else {
        const len  = drag.startRange[1] - drag.startRange[0];
        const ns   = Math.max(0, drag.startRange[0] + (idx - drag.startIdx));
        const ne   = Math.min(data.length - 1, ns + len);
        setRange([ne - len, ne]);
      }
    };
    const onUp = () => setDrag(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [drag, data.length]);

  if (!enabled) return <>{children({ xDomain: [0, data.length - 1] })}</>;

  const sp = (range[0] / Math.max(data.length - 1, 1)) * 100;
  const ep = (range[1] / Math.max(data.length - 1, 1)) * 100;

  return (
    <div className="flex flex-col gap-2">
      {children({ xDomain: range })}

      {/* Brush strip */}
      <div
        ref={brushRef}
        className="relative w-full rounded-xl bg-slate-100/80 border border-slate-200/60 cursor-crosshair select-none overflow-hidden"
        style={{ height }}
      >
        {/* Mini sparkline bars */}
        <div className="absolute inset-1 flex items-end gap-[2px]">
          {data.map((_, i) => (
            <div key={i} className="flex-1 rounded-sm"
              style={{ height: `${40 + Math.sin(i / 2) * 25}%`, background: i >= range[0] && i <= range[1] ? "#BFDBFE" : "#E2E8F0" }}
            />
          ))}
        </div>

        {/* Selected window */}
        <div
          className="absolute inset-y-0 bg-[#0052FF]/10 border-x-2 border-[#0052FF]/50 cursor-grab active:cursor-grabbing"
          style={{ left: `${sp}%`, right: `${100 - ep}%` }}
          onMouseDown={e => { e.preventDefault(); setDrag({ type: "move", startIdx: idxFromClient(e.clientX), startRange: [...range] as [number, number] }); }}
        >
          {/* Left handle */}
          <div
            className="absolute left-0 inset-y-0 w-5 -translate-x-full cursor-ew-resize flex items-center justify-center"
            onMouseDown={e => { e.stopPropagation(); e.preventDefault(); setDrag({ type: "start", startIdx: idxFromClient(e.clientX), startRange: [...range] as [number, number] }); }}
          >
            <div className="w-1 h-8 bg-[#0052FF] rounded-full shadow-md" />
          </div>
          {/* Right handle */}
          <div
            className="absolute right-0 inset-y-0 w-5 translate-x-full cursor-ew-resize flex items-center justify-center"
            onMouseDown={e => { e.stopPropagation(); e.preventDefault(); setDrag({ type: "end", startIdx: idxFromClient(e.clientX), startRange: [...range] as [number, number] }); }}
          >
            <div className="w-1 h-8 bg-[#0052FF] rounded-full shadow-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ChartTooltip (marker — rendering handled by LineChart/BarChart) ─────────
export function ChartTooltip(_props?: { showCrosshair?: boolean; showDots?: boolean }) {
  return null;
}

// ─── ChartMarkers & Marker Tooltip (bklit API) ──────────────────────────────
export interface ChartMarker {
  date: Date | string;
  icon: React.ReactNode;
  title: string;
  description?: string;
  content?: React.ReactNode;
  color?: string;
  onClick?: () => void;
  href?: string;
  target?: "_blank" | "_self";
}

export function ChartMarkers({
  items,
  size = 28,
  showLines = true,
}: {
  items: ChartMarker[];
  size?: number;
  showLines?: boolean;
  animate?: boolean;
}) {
  const ctx = useContext(LineChartCtx);
  if (!ctx) return null;

  const { effectiveData, xDataKey, getX, chartH, padding } = ctx;

  return (
    <g>
      {items.map((m, idx) => {
        const itemDateStr = m.date instanceof Date ? m.date.toDateString() : String(m.date);
        const dataIdx = effectiveData.findIndex(d => {
          const raw = d[xDataKey];
          const rawStr = raw instanceof Date ? raw.toDateString() : String(raw);
          return rawStr === itemDateStr || String(raw).includes(String(m.date));
        });

        if (dataIdx === -1) return null;
        const x = getX(dataIdx);

        return (
          <g key={idx} className="transition-all duration-300">
            {showLines && (
              <line
                x1={x}
                y1={padding.top}
                x2={x}
                y2={chartH - padding.bottom}
                stroke={m.color || "#3B82F6"}
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.6}
              />
            )}
            <foreignObject
              x={x - size / 2}
              y={padding.top - size / 2}
              width={size}
              height={size}
              className="overflow-visible cursor-pointer"
              onClick={m.onClick}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center text-xs shadow-md border-2 border-white transition-transform hover:scale-125"
                style={{ backgroundColor: m.color || "#3B82F6", color: "white" }}
                title={m.title}
              >
                {m.icon}
              </div>
            </foreignObject>
          </g>
        );
      })}
    </g>
  );
}

export function useActiveMarkers(markers: ChartMarker[]) {
  const ctx = useContext(LineChartCtx);
  if (!ctx || ctx.hoverIndex === null) return [];

  const { effectiveData, xDataKey, hoverIndex } = ctx;
  const currentItem = effectiveData[hoverIndex];
  if (!currentItem) return [];

  const raw = currentItem[xDataKey];
  const currentStr = raw instanceof Date ? raw.toDateString() : String(raw);

  return markers.filter(m => {
    const mStr = m.date instanceof Date ? m.date.toDateString() : String(m.date);
    return mStr === currentStr || String(raw).includes(String(m.date));
  });
}

export function MarkerTooltipContent({ markers }: { markers: ChartMarker[] }) {
  if (!markers || markers.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-100">
      {markers.map((m, idx) => (
        <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
          <span className="text-sm shrink-0">{m.icon}</span>
          <div>
            <div className="text-xs font-bold text-slate-800">{m.title}</div>
            {m.description && <div className="text-[11px] text-slate-500">{m.description}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Compat stubs ─────────────────────────────────────────────────────────────
export const BarDepthProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const BarDepthBack    = () => null;
export const BarDepthFront   = () => null;
export const ChartBrush      = () => null;
