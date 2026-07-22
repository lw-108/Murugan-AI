import { useState } from "react";
import {
  Search,
  MoreHorizontal,
  ExternalLink,
  ShieldCheck,
  Zap,
  HardDrive,
  ScanLine,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  PieChart,
  PieSlice,
  PieCenter,
  LineChart,
  Line,
  XAxis,
  Background,
  ChartMarkers,
  ChartLegend,
  ChartTooltip,
  curveCatmullRom,
} from "@bklitui/ui/charts";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import velLogo from "@/assets/vel.png";

// ─── Data ──────────────────────────────────────────────────────────────────────

const scanStatusPieData = [
  { label: "Running", value: 740, color: "#2563EB" },
  { label: "Success", value: 520, color: "#10B981" },
  { label: "Failed", value: 310, color: "#EF4444" },
  { label: "Stopped", value: 220, color: "#F59E0B" },
];

// 6-month scan activity data (Jan–Jun 2026)
const activityLineData = [
  { month: "Jan", running: 420, success: 280, failed: 65,  stopped: 22 },
  { month: "Feb", running: 360, success: 265, failed: 55,  stopped: 18 },
  { month: "Mar", running: 370, success: 270, failed: 70,  stopped: 20 },
  { month: "Apr", running: 390, success: 260, failed: 68,  stopped: 24 },
  { month: "May", running: 600, success: 300, failed: 199, stopped: 30 },
  { month: "Jun", running: 720, success: 290, failed: 82,  stopped: 26 },
];

const topModelsData = [
  { name: "WiFi-CPE-Itsar", scans: "2,413 Scans", count: 2413, max: 3000, color: "#0052FF" },
  { name: "Standard-v2.0", scans: "2,020 Scans", count: 2020, max: 3000, color: "#2563EB" },
  { name: "LAN-STD-Itsar", scans: "1,899 Scans", count: 1899, max: 3000, color: "#3B82F6" },
  { name: "Windows-11R2026", scans: "1,203 Scans", count: 1203, max: 3000, color: "#60A5FA" },
  { name: "Debian-Ubuntu", scans: "503 Scans", count: 503, max: 3000, color: "#93C5FD" },
];

const topProjects = [
  {
    name: "ZCOM Suyash", sub: "ZCOM Suyash", rules: "5 Rules",
    segments: [
      { label: "Completed", pct: "20%", val: 20, color: "#10B981" },
      { label: "Ongoing", pct: "8%", val: 8, color: "#3B82F6" },
      { label: "Failed", pct: "12%", val: 12, color: "#EF4444" },
      { label: "Yet to start", pct: "50%", val: 50, color: "#CBD5E1" },
      { label: "TSTL", pct: "5%", val: 5, color: "#A855F7" },
      { label: "MFC", pct: "5%", val: 5, color: "#EAB308" },
    ],
  },
  ...Array(5).fill(null).map(() => ({
    name: "Scaler ZH240", sub: "Scaler Inc", rules: "5 Rules",
    segments: [
      { label: "Completed", pct: "20%", val: 20, color: "#10B981" },
      { label: "Ongoing", pct: "8%", val: 8, color: "#3B82F6" },
      { label: "Failed", pct: "0%", val: 0, color: "#EF4444" },
      { label: "Yet to start", pct: "72%", val: 72, color: "#CBD5E1" },
      { label: "TSTL", pct: "0%", val: 0, color: "#A855F7" },
      { label: "MFC", pct: "0%", val: 0, color: "#EAB308" },
    ],
  })),
];

const recentScans = [
  { id: "#CM9801", project: "Cisco", model: "X240", datetime: "12th Jun 2026 07:51 PM", status: "Ongoing", progress: "60%", type: "ongoing" },
  { id: "#CM9802", project: "Karbonn", model: "IM-570", datetime: "12th Jun 2026 07:50 PM", status: "Ongoing", progress: "50%", type: "ongoing" },
  { id: "#CM9803", project: "Indian Hardwares", model: "i8262", datetime: "12th Jun 2026 07:44 PM", status: "Ongoing", progress: "40%", type: "ongoing" },
  { id: "#CM9804", project: "South", model: "Mark 1", datetime: "12th Jun 2026 07:30 PM", status: "Ongoing", progress: "20%", type: "ongoing", selected: true },
  { id: "#CM9805", project: "Aisino", model: "Q181 SE", datetime: "11th Jun 2026 07:51 PM", status: "Ongoing", progress: "20%", type: "ongoing", hasMore: true },
  { id: "#CM9801", project: "Feitian", model: "M200", datetime: "11th Jun 2026 07:51 PM", status: "Completed", type: "completed" },
  { id: "#CM9802", project: "Vanstone", model: "A75 Pro FP", datetime: "10th Jun 2026 07:51 PM", status: "Completed", type: "completed" },
  { id: "#CM9803", project: "TrendIT", model: "Mini", datetime: "09th Jun 2026 07:51 PM", status: "Completed", type: "completed" },
  { id: "#CM9804", project: "Basics", model: "White", datetime: "09th Jun 2026 07:51 PM", status: "Stopped", type: "stopped" },
  { id: "#CM9805", project: "El Paso", model: "Desert", datetime: "09th Jun 2026 07:51 PM", status: "Stopped", type: "stopped" },
];

// ─── App ──────────────────────────────────────────────────────────────────────

export function App() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [activeTimeframe, setActiveTimeframe] = useState("This Month");
  const [selectedScan, setSelectedScan] = useState("#CM9804");

  return (
    <BackgroundGradientAnimation
      gradientBackgroundStart="rgb(255, 255, 255)"
      gradientBackgroundEnd="rgb(248, 250, 252)"
      firstColor="34, 197, 94"
      secondColor="59, 130, 246"
      thirdColor="234, 179, 8"
      fourthColor="16, 185, 129"
      fifthColor="96, 165, 250"
      pointerColor="250, 204, 21"
      blendingValue="screen"
      containerClassName="min-h-screen text-slate-800 font-sans antialiased"
    >
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* ── Top Navigation Bar ─────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-slate-200/80 px-6 py-3 flex items-center justify-between shadow-sm">
          {/* Logo */}
          <div className="flex items-center gap-2.5 select-none">
            <img src={velLogo} alt="Murugan AI Logo" className="w-7 h-7 object-contain drop-shadow-sm" />
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">
              Murugan <span className="text-[#0052FF]">AI</span>
            </span>
          </div>

          {/* Nav Pill */}
          <nav className="flex items-center gap-0.5 bg-slate-900/5 backdrop-blur-md p-1 rounded-full border border-slate-900/10">
            {["Dashboard", "Projects", "DUT", "Document validator", "Labs"].map((item) => (
              <button
                key={item}
                onClick={() => setActiveNav(item)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  activeNav === item
                    ? "bg-[#0052FF] text-white shadow-md shadow-[#0052FF]/25"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Search + Avatar */}
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full text-slate-500 hover:bg-slate-900/5 hover:text-slate-900 transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#0052FF]/20 shadow-sm bg-white flex items-center justify-center p-1">
              <img src={velLogo} alt="Selva Avatar" className="w-full h-full object-contain" />
            </div>
          </div>
        </header>

        {/* ── Main ──────────────────────────────────────────────────────────── */}
        <main className="max-w-[1700px] mx-auto px-6 py-6 flex flex-col gap-5 flex-1 w-full">

          {/* Welcome + Timeframe */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-light text-black mix-blend-difference tracking-tight">
              Good morning,{" "}
              <span className="font-bold text-[#0052FF] mix-blend-difference">Selva!</span>
            </h1>
            <div className="flex items-center gap-1 bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-full p-1 shadow-sm self-start sm:self-auto">
              {["This Week", "This Month", "Custom"].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTimeframe(t)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeTimeframe === t
                      ? "bg-[#0052FF] text-white shadow shadow-[#0052FF]/30"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* ── KPI Cards ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <HardDrive className="w-5 h-5" />, value: "740", label: "Device under test", iconBg: "bg-emerald-100 text-emerald-600" },
              { icon: <ScanLine className="w-5 h-5" />, value: "12.3K", label: "Total scans", iconBg: "bg-blue-100 text-[#0052FF]" },
              { icon: <ShieldCheck className="w-5 h-5" />, value: "98.2%", label: "Scan accuracy rate", iconBg: "bg-amber-100 text-amber-600" },
              { icon: <Zap className="w-5 h-5" />, value: "64", label: "Total models", iconBg: "bg-green-100 text-green-600" },
            ].map((card, i) => (
              <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                  {card.icon}
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">{card.value}</div>
                  <div className="text-xs font-medium text-slate-500 mt-1">{card.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Main Bento Grid ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

            {/* Left 8-col section */}
            <div className="lg:col-span-8 flex flex-col gap-5">

              {/* Row 1: Activity Timeline + Attention Required */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Scan Activity Timeline – Line Chart (bklit Trio style) */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Scan activity timeline</h3>
                      <span className="text-xs text-slate-400 font-medium">May 2026</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <LineChart
                      data={activityLineData}
                      xDataKey="month"
                    >
                      <Background pattern="dots" opacity={0.6} />
                      <Line dataKey="running" stroke="#2563EB" curve={curveCatmullRom} strokeWidth={2.5} />
                      <Line dataKey="success" stroke="#16A34A" curve={curveCatmullRom} strokeWidth={2}   />
                      <Line dataKey="failed"  stroke="#B91C1C" curve={curveCatmullRom} strokeWidth={1.5} />
                      <Line dataKey="stopped" stroke="#CA8A04" curve={curveCatmullRom} strokeWidth={1.5} />
                      <ChartMarkers items={[
                        { date: "Mar", icon: "🚀", title: "v2.0 Model Release", description: "Deployed 14 new DUT profiles", color: "#2563EB" },
                        { date: "May", icon: "✨", title: "Scan Engine Upgrade", description: "Speed increased by 40%", color: "#16A34A" },
                      ]} />
                      <XAxis />
                      <ChartTooltip />
                    </LineChart>
                  </div>

                  <ChartLegend items={[
                    { label: "Running", color: "#2563EB" },
                    { label: "Success", color: "#16A34A" },
                    { label: "Failed",  color: "#B91C1C" },
                    { label: "Stopped", color: "#CA8A04" },
                  ]} />
                </div>

                {/* Attention Required */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-800">Attention required</h3>
                    <button className="text-slate-400 hover:text-[#0052FF] transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {[
                      { icon: <AlertTriangle className="w-4 h-4" />, iconBg: "bg-amber-100 text-amber-600", title: "14 projects below 80% compliance threshold", sub: "Review failed clauses and re-run" },
                      { icon: <AlertCircle className="w-4 h-4" />, iconBg: "bg-amber-100 text-amber-600", title: "Clause 12.7.2 failed last 3 consecutive runs", sub: "NA" },
                      { icon: <HelpCircle className="w-4 h-4" />, iconBg: "bg-blue-100 text-[#0052FF]", title: "Questionaire incomplete on 4 clauses", sub: "Answers required before next run" },
                    ].map((alert, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                        <div className={`w-7 h-7 rounded-lg ${alert.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                          {alert.icon}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 leading-snug">{alert.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{alert.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Scan Status Donut + Top 5 Models Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Scan Status Pie Chart (bklit Legend style) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-1">Scan status distribution</h3>
                    <p className="text-[11px] text-slate-400 mb-3">Interactive donut synced with legend hover</p>
                  </div>

                  {/* Donut Chart */}
                  <div className="flex justify-center my-2">
                    <PieChart data={scanStatusPieData} size={180} innerRadius={54}>
                      {scanStatusPieData.map((_, idx) => (
                        <PieSlice key={idx} index={idx} />
                      ))}
                      <PieCenter defaultLabel="Total Scans" />
                    </PieChart>
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-slate-600 mt-3 pt-3 border-t border-slate-100">
                    {scanStatusPieData.map((d) => (
                      <div key={d.label} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                        <span>{d.label}</span>
                        <span className="font-bold text-slate-800 ml-auto">{d.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Trend footer */}
                  <div className="text-[11px] text-emerald-600 font-medium mt-3 flex items-center gap-1">
                    <span>Trending up by 5.2% this month</span>
                  </div>
                </div>

                {/* Top 5 Models Horizontal Bar */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-4">Top 5 models</h3>
                  <div className="flex flex-col gap-3">
                    {topModelsData.map((item, idx) => {
                      const pct = (item.count / item.max) * 100;
                      return (
                        <div key={idx} className="flex items-center gap-3 text-xs">
                          <span className="w-28 text-slate-500 font-medium shrink-0 truncate text-[11px]">{item.name}</span>
                          <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden relative">
                            <div
                              className="absolute left-0 top-0 bottom-0 rounded-lg flex items-center px-3 transition-all duration-500"
                              style={{ width: `${pct}%`, background: item.color }}
                            >
                              <span className="text-[11px] font-bold text-white whitespace-nowrap">{item.scans}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Scale */}
                  <div className="flex justify-between text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                    {[0, 500, 1000, 1500, 2500, 3000].map((v) => <span key={v}>{v}</span>)}
                  </div>
                </div>
              </div>

              {/* Row 3: Recent Scans Table */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm overflow-hidden">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Recent scans</h3>
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-left text-xs border-collapse min-w-[640px]">
                    <thead>
                      <tr className="text-[11px] text-slate-400 border-b border-slate-100">
                        <th className="pb-2.5 pl-3 pr-2 w-8"><input type="checkbox" className="rounded accent-[#0052FF]" /></th>
                        <th className="pb-2.5 px-3 font-medium">Scan ID</th>
                        <th className="pb-2.5 px-3 font-medium">Project</th>
                        <th className="pb-2.5 px-3 font-medium">Device model</th>
                        <th className="pb-2.5 px-3 font-medium">Date & time</th>
                        <th className="pb-2.5 px-3 font-medium">Status</th>
                        <th className="pb-2.5 pr-3 w-6" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {recentScans.map((row, idx) => (
                        <tr
                          key={idx}
                          onClick={() => setSelectedScan(row.id + idx)}
                          className={`transition-colors cursor-pointer ${
                            selectedScan === row.id + idx ? "bg-blue-50/60" : "hover:bg-slate-50/70"
                          }`}
                        >
                          <td className="py-3 pl-3 pr-2">
                            <input
                              type="checkbox"
                              checked={selectedScan === row.id + idx || !!(row as { selected?: boolean }).selected}
                              onChange={() => setSelectedScan(row.id + idx)}
                              className="rounded accent-[#0052FF]"
                            />
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-700">{row.id}</td>
                          <td className="py-3 px-3 text-slate-600">{row.project}</td>
                          <td className="py-3 px-3 text-slate-600">{row.model}</td>
                          <td className="py-3 px-3 text-slate-400 text-[11px]">{row.datetime}</td>
                          <td className="py-3 px-3">
                            {row.type === "ongoing" && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#0052FF]/10 text-[#0052FF]">
                                Ongoing | {row.progress}
                              </span>
                            )}
                            {row.type === "completed" && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                                Completed
                              </span>
                            )}
                            {row.type === "stopped" && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-600">
                                Stopped
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-3 text-slate-300 hover:text-slate-500">
                            {(row as { hasMore?: boolean }).hasMore && <MoreHorizontal className="w-4 h-4" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right 4-col: Top Projects */}
            <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-4 h-full">
              <h3 className="text-sm font-bold text-slate-800">Top Projects</h3>
              <div className="flex flex-col gap-4 flex-1">
                {topProjects.map((proj, pIdx) => (
                  <div key={pIdx} className="flex flex-col gap-2 pb-4 border-b border-slate-200/50 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{proj.name}</h4>
                        <p className="text-[10px] text-slate-500">{proj.sub}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#0052FF]/10 text-[#0052FF] border border-[#0052FF]/15 shrink-0">
                        {proj.rules}
                      </span>
                    </div>
                    {/* Segmented bar */}
                    <div className="w-full h-6 bg-white/60 backdrop-blur-sm rounded-md overflow-hidden flex border border-slate-200/60">
                      {proj.segments.map((seg, sIdx) =>
                        seg.val > 0 ? (
                          <div
                            key={sIdx}
                            style={{ width: `${seg.val}%`, backgroundColor: seg.color }}
                            className="h-full flex items-center justify-center transition-all"
                            title={`${seg.label}: ${seg.pct}`}
                          >
                            {seg.val >= 15 && (
                              <span className="text-[9px] font-bold text-white">{seg.pct}</span>
                            )}
                          </div>
                        ) : null
                      )}
                    </div>
                    {/* Legend */}
                    <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-slate-600">
                      {proj.segments.map((seg, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-1 min-w-0">
                          <span className="w-2 h-1 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                          <span className="truncate">{seg.label} <strong className="text-slate-800">{seg.pct}</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </BackgroundGradientAnimation>
  );
}

export default App;
