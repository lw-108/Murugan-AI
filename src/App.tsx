import { useState } from "react";
import {
  MoreHorizontal,
} from "lucide-react";
import {
  PieChart,
  PieSlice,
  PieCenter,
  LineChart,
  Line,
  XAxis,
  Grid,
  ChartLegend,
  ChartTooltip,
  curveCatmullRom,
} from "@bklitui/ui/charts";
import profileImage from "@/assets/image.png";

// ─── Data ──────────────────────────────────────────────────────────────────────

const scanStatusPieData = [
  { label: "Running", value: 740, color: "#1D5BD8" },
  { label: "Success", value: 520, color: "#3AA76D" },
  { label: "Failed", value: 310, color: "#C83D22" },
  { label: "Stopped", value: 220, color: "#D97706" },
];

// 6-month scan activity data (Jan–Jun 2026)
const activityLineData = [
  { month: "Jan", running: 420, success: 280, failed: 65, stopped: 22 },
  { month: "Feb", running: 360, success: 265, failed: 55, stopped: 18 },
  { month: "Mar", running: 370, success: 270, failed: 70, stopped: 20 },
  { month: "Apr", running: 390, success: 260, failed: 68, stopped: 24 },
  { month: "May", running: 600, success: 300, failed: 199, stopped: 30 },
  { month: "Jun", running: 720, success: 290, failed: 82, stopped: 26 },
];

const topModelsData = [
  { name: "WiFi-CPE-Itsar", scans: "2,413 Scans", successRate: "83.3%", count: 2413, max: 3000, color: "#0052FF" },
  { name: "Standard-v2.0", scans: "2,020 Scans", successRate: "70%", count: 2020, max: 3000, color: "#0052FF" },
  { name: "LAN-STD-Itsar", scans: "1,899 Scans", successRate: "76%", count: 1899, max: 3000, color: "#0052FF" },
  { name: "Windows-11R2026", scans: "1,203 Scans", successRate: "81%", count: 1203, max: 3000, color: "#0052FF" },
  { name: "Debian-Ubuntu", scans: "503 Scans", successRate: "55%", count: 503, max: 3000, color: "#0052FF" },
];

const kpiCards = [
  { icon: <img src="/Disk.svg" alt="Disk" className="w-5 h-5 object-contain" />, value: "740", label: "Device under test", iconBg: "bg-[#D8F5E5] text-[#15803D]" },
  { icon: <img src="/Box.svg" alt="Box" className="w-5 h-5 object-contain" />, value: "12.3K", label: "Total scans", iconBg: "bg-[#DBEAFE] text-[#1D4ED8]" },
  { icon: <img src="/ShieldCorrect.svg" alt="ShieldCorrect" className="w-5 h-5 object-contain" />, value: "98.2%", label: "Scan accuracy rate", iconBg: "bg-[#EDE9FE] text-[#6D28D9]" },
  { icon: <img src="/Zap.svg" alt="Zap" className="w-5 h-5 object-contain" />, value: "64", label: "Total models", iconBg: "bg-[#FEF3C7] text-[#D97706]" },
];

const topProjects = [
  {
    name: "ZCOM Suyash", sub: "ZCOM Suyash", rules: "5 Rules",
    segments: [
      { label: "Completed", pct: "20%", val: 20, color: "#3AA76D" },
      { label: "Ongoing", pct: "8%", val: 8, color: "#1D5BD8" },
      { label: "Failed", pct: "12%", val: 12, color: "#C83D22" },
      { label: "Yet to start", pct: "50%", val: 50, color: "#E5E7EB" },
      { label: "TSTL", pct: "5%", val: 5, color: "#A78BFA" },
      { label: "MFC", pct: "5%", val: 5, color: "#D97706" },
    ],
  },
  {
    name: "Scaler ZH240", sub: "Scaler Inc", rules: "5 Rules",
    segments: [
      { label: "Completed", pct: "20%", val: 20, color: "#3AA76D" },
      { label: "Ongoing", pct: "8%", val: 8, color: "#1D5BD8" },
      { label: "Failed", pct: "0%", val: 0, color: "#C83D22" },
      { label: "Yet to start", pct: "72%", val: 72, color: "#E5E7EB" },
      { label: "TSTL", pct: "0%", val: 0, color: "#A78BFA" },
      { label: "MFC", pct: "0%", val: 0, color: "#D97706" },
    ],
  },
  {
    name: "Scaler ZH240", sub: "Scaler Inc", rules: "5 Rules",
    segments: [
      { label: "Completed", pct: "20%", val: 20, color: "#3AA76D" },
      { label: "Ongoing", pct: "0%", val: 0, color: "#1D5BD8" },
      { label: "Failed", pct: "0%", val: 0, color: "#C83D22" },
      { label: "Yet to start", pct: "80%", val: 80, color: "#E5E7EB" },
      { label: "TSTL", pct: "0%", val: 0, color: "#A78BFA" },
      { label: "MFC", pct: "0%", val: 0, color: "#D97706" },
    ],
  },
  {
    name: "Nordic Telecom", sub: "Nordic Systems", rules: "6 Rules",
    segments: [
      { label: "Completed", pct: "35%", val: 35, color: "#3AA76D" },
      { label: "Ongoing", pct: "15%", val: 15, color: "#1D5BD8" },
      { label: "Failed", pct: "8%", val: 8, color: "#C83D22" },
      { label: "Yet to start", pct: "32%", val: 32, color: "#E5E7EB" },
      { label: "TSTL", pct: "5%", val: 5, color: "#A78BFA" },
      { label: "MFC", pct: "5%", val: 5, color: "#D97706" },
    ],
  },
];

const recentScans = [
  { id: "#CM9801", project: "Cisco", model: "X240", datetime: "12th Jun 2026 07:51 PM", status: "Ongoing", progress: "60%", type: "ongoing" },
  { id: "#CM9802", project: "Karbonn", model: "IM-570", datetime: "12th Jun 2026 07:50 PM", status: "Ongoing", progress: "50%", type: "ongoing" },
  { id: "#CM9803", project: "Indian Hardwares", model: "i8262", datetime: "12th Jun 2026 07:44 PM", status: "Ongoing", progress: "40%", type: "ongoing" },
  { id: "#CM9804", project: "South", model: "Mark 1", datetime: "12th Jun 2026 07:30 PM", status: "Ongoing", progress: "20%", type: "ongoing", hasMore: true },
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


  return (
    <div className="relative min-h-screen text-slate-800 font-sans antialiased">

      {/* Pale Royal Blue ambient mesh background across the entire app */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: [
            "radial-gradient(circle 1800px at 50% 55%, rgba(0,82,255,0.13) 0%, transparent 60%)",
            "radial-gradient(circle 140px at 50% 75%, rgba(59,130,246,0.08) 0%, transparent 70%)",
            "#f8fafc",
          ].join(","),
        }}
      />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="max-w-[1700px] mx-auto px-6 pt-5 w-full">
        <header className="px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 select-none">
            <img src="/logo.svg" alt="Murugan AI" className="h-10 w-auto object-contain" />
          </div>

          {/* Nav Dock */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-0.5 bg-white p-1 rounded-full border border-white/80 shadow-sm">
              {["Dashboard", "Applications", "DUT", "Configuration"].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveNav(item)}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${activeNav === item
                      ? "bg-[#002574] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                >
                  {item}
                </button>
              ))}
            </nav>
            <button className="p-2 rounded-full bg-white transition-colors">
              <img src="/SearchIcon.svg" alt="Search" className="w-5 h-5 object-contain" />
            </button>
          </div>

          {/* Avatar */}
          <div className="w-11 h-11 rounded-full overflow-hidden border border-white/80 shadow-sm bg-white/60 flex items-center justify-center p-0.5">
            <img src={profileImage} alt="Avatar" className="w-full h-full object-cover rounded-full" />
          </div>
        </header>
      </div>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="max-w-[1700px] mx-auto px-6 py-5 flex flex-col gap-4 w-full">

        {/* Welcome row */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-[28px] font-light text-slate-900 tracking-tight pl-6">
            Good morning,{" "}
            <span className="font-bold text-[#002574]">NCCS!</span>
          </h1>
          <div className="flex items-center gap-1 bg-white/40 backdrop-blur-xl border border-white/80 rounded-full p-1 shadow-sm">
            {["This Week", "This Month", "Custom"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTimeframe(t)}
                className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all ${activeTimeframe === t
                    ? "bg-[#002574] text-white shadow"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── 3-Column Equal Top Row Bento Layout ───────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Row 1: 3 Equal-Width Rectangular Sections (Stats 2x2, Timeline, Attention Required) */}
          <div className="grid grid-cols-12 gap-4 items-stretch">

            {/* Section 1: 4 Individual Glass-Blurred Compact Stat Cards (col-span-4) */}
            <div className="col-span-4 grid grid-cols-2 gap-3.5 h-full">
              {kpiCards.map((card, i) => (
                <div
                  key={i}
                  className="bg-transparent backdrop-blur-lg border border-white/90 rounded-2xl p-5 flex flex-col justify-center items-start h-full hover:bg-white/70 transition-all duration-200 relative overflow-hidden"
                  style={{ boxShadow: "inset 3px 3px 6px rgba(0,0,0,0.05), inset -3px -3px 6px rgba(255,255,255,0.9), 0 2px 15px -2px rgba(0,0,0,0.03)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-[14px] ${card.iconBg} flex items-center justify-center shrink-0 border border-white/40`}>
                      {card.icon}
                    </div>
                    <div
                      className="text-[52px] text-black tracking-normal leading-none"
                      style={{ fontFamily: '"mozilla-headline-condensed", sans-serif', fontWeight: 600 }}
                    >
                      {card.value}
                    </div>
                  </div>
                  <div className="text-[20px] font-normal text-slate-900 tracking-tight mt-3 text-left" style={{ fontFamily: '"Figtree", sans-serif' }}>
                    {card.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Section 2: Scan Activity Timeline Line Chart (col-span-4) */}
            <div className="col-span-4 relative flex flex-col">
              <div className="absolute -inset-2 bg-[#0052FF]/10 blur-2xl rounded-full pointer-events-none -z-10" />
              <div className="bg-white/40 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] rounded-2xl p-5 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[22px] text-slate-800">Scan activity timeline</h3>
                  <span className="text-[11px] text-slate-400 font-medium">May, 2026</span>
                </div>
                <div className="flex-1 min-h-[140px] flex items-center justify-center">
                  <LineChart data={activityLineData} xDataKey="month">
                    <Grid horizontal />
                    <Line dataKey="running" stroke="#1D5BD8" curve={curveCatmullRom} strokeWidth={2.5} />
                    <Line dataKey="success" stroke="#3AA76D" curve={curveCatmullRom} strokeWidth={2} />
                    <Line dataKey="failed" stroke="#C83D22" curve={curveCatmullRom} strokeWidth={1.5} />
                    <Line dataKey="stopped" stroke="#D97706" curve={curveCatmullRom} strokeWidth={1.5} />
                    <XAxis />
                    <ChartTooltip />
                  </LineChart>
                </div>
                <ChartLegend items={[
                  { label: "Running", color: "#1D5BD8" },
                  { label: "Success", color: "#3AA76D" },
                  { label: "Failed", color: "#C83D22" },
                  { label: "Stopped", color: "#D97706" },
                ]} />
              </div>
            </div>

            {/* Section 3: Attention Required (col-span-4) */}
            <div className="col-span-4 bg-white/40 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] rounded-2xl p-6 flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[22px] text-slate-800">Attention required</h3>
                <button className="w-8 h-8 rounded-lg bg-white/60 border border-white/80 flex items-center justify-center hover:bg-white/80 transition-colors shadow-sm">
                  <img src="/GoToArrow.svg" alt="Go to" className="w-4 h-4 object-contain" />
                </button>
              </div>
              <div className="flex flex-col flex-1 divide-y divide-slate-200/40 justify-center">
                {[
                  {
                    isExclamation: true,
                    title: "14 projects below 80% compliance threshold",
                    sub: "Review failed clauses and re-run"
                  },
                  {
                    isExclamation: true,
                    title: "Clause 12.7.2 failed last 3 consecutive runs",
                    sub: "NA"
                  },
                  {
                    isExclamation: false,
                    title: "Questionnaire incomplete on 4 clauses",
                    sub: "Answers required before next run"
                  }
                ].map((alert, i) => (
                  <div key={i} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                    {alert.isExclamation ? (
                      <img src="/Warning.svg" alt="Warning" className="w-12 h-12 shrink-0 object-contain" />
                    ) : (
                      <img src="/Message.svg" alt="Message" className="w-12 h-12 shrink-0 object-contain" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[16px] font-medium text-slate-900 leading-snug">{alert.title}</div>
                      <div className="text-[14px] text-slate-400 mt-0.5">{alert.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Row 2: Lower Content (Pie Chart, Top 5 Models, Recent Scans, Top 3 Projects) */}
          <div className="grid grid-cols-12 gap-4 items-start">

            {/* Left + Center Area (col-span-8) */}
            <div className="col-span-8 flex flex-col gap-4">

              {/* Scan Status Distribution & Top 5 Models */}
              <div className="grid grid-cols-12 gap-4 items-stretch">
                {/* Scan Status Distribution (col-span-6 of col-span-8 = 4/12 total width, STRICTLY EQUAL to Stats above!) */}
                <div className="col-span-6 bg-white/40 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] rounded-2xl p-5 flex flex-col justify-between relative">
                  <h3 className="text-[22px] text-slate-800 tracking-tight">Scan status distribution</h3>

                  {/* Speedometer Gauge Donut Chart */}
                  <div className="relative flex justify-center items-center my-3 min-h-[200px]">
                    <PieChart data={scanStatusPieData} size={260} innerRadius={102} startAngle={225} endAngle={495}>
                      {scanStatusPieData.map((_, idx) => (
                        <PieSlice key={idx} index={idx} />
                      ))}
                      <PieCenter defaultLabel="Total Scans" />
                    </PieChart>
                  </div>

                  {/* Horizontal Inline Legend */}
                  <div className="flex items-center justify-between gap-1 text-[11px] text-slate-600 pt-3 border-t border-white/60">
                    {scanStatusPieData.map((d) => (
                      <div key={d.label} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-1 rounded-sm shrink-0" style={{ background: d.color }} />
                        <span className="text-slate-600 font-normal">{d.label}</span>
                        <span className="font-bold text-slate-900 ml-0.5">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top 5 Models (col-span-6 of col-span-8) */}
                <div className="col-span-6 bg-white/40 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[22px] text-slate-800 mb-5">
                      Top 5 models{" "}
                      <span className="font-normal text-slate-500 text-[22px]">(Execution &amp; Success rates)</span>
                    </h3>
                    <div className="flex flex-col gap-3.5 flex-1">
                      {topModelsData.map((item, idx) => {
                        const pct = (item.count / item.max) * 100;
                        const opacities = [1.0, 0.88, 0.73, 0.53, 0.35];
                        const barBg = `rgba(0, 37, 116, ${opacities[idx]})`;
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="w-36 text-[15px] text-slate-700 shrink-0 truncate text-left">{item.name}</span>
                            <div className="flex-1 h-9 relative overflow-hidden rounded-xl">
                              <div
                                className="absolute left-0 top-0 bottom-0 flex items-center px-4 transition-all duration-500 rounded-xl"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: barBg,
                                }}
                              >
                                <span className="text-[14px] font-normal text-white whitespace-nowrap">
                                  {item.scans}&nbsp;&nbsp;&nbsp;&nbsp;{idx === 4 ? "" : item.successRate}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-between text-[13px] text-slate-500 mt-5 pt-3 border-t border-white/60">
                    {[0, 500, 1000, 1500, 2500, 3000].map((v) => <span key={v}>{v}</span>)}
                  </div>
                </div>
              </div>

              {/* Recent Scans */}
              <div className="bg-white/40 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[22px] text-slate-800">Recent scans</h3>
                  <button className="w-8 h-8 rounded-lg bg-white/60 border border-white/80 flex items-center justify-center hover:bg-white/80 transition-colors shadow-sm">
                    <img src="/GoToArrow.svg" alt="Go to" className="w-4 h-4 object-contain" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="text-[15px] text-slate-400 border-b border-slate-200/60">
                        <th className="pb-3 pl-4 pr-2 w-10"><input type="checkbox" className="w-4 h-4 rounded accent-[#0052FF] cursor-pointer" /></th>
                        <th className="pb-3 px-4 font-medium">Scan ID</th>
                        <th className="pb-3 px-4 font-medium">Project</th>
                        <th className="pb-3 px-4 font-medium">Device model</th>
                        <th className="pb-3 px-4 font-medium">Date &amp; time</th>
                        <th className="pb-3 px-4 font-medium">Status</th>
                        <th className="pb-3 pr-4 w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {recentScans.map((row, idx) => (
                        <tr
                          key={idx}
                          className="transition-colors cursor-pointer border-b border-slate-200/40 hover:bg-white/40 group"
                        >
                          <td className="py-2 pl-4 pr-2">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded accent-[#0052FF] cursor-pointer"
                            />
                          </td>
                          <td className="py-2 px-4 text-[16px] font-semibold text-slate-800">{row.id}</td>
                          <td className="py-2 px-4 text-[16px] text-slate-800">{row.project}</td>
                          <td className="py-2 px-4 text-[16px] text-slate-800">{row.model}</td>
                          <td className="py-2 px-4 text-[16px] text-slate-800">{row.datetime}</td>
                          <td className="py-2 px-4">
                            {row.type === "ongoing" && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-[14px] font-normal bg-[#0052FF]/10 text-black">
                                Ongoing | {(row as { progress?: string }).progress}
                              </span>
                            )}
                            {row.type === "completed" && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-[14px] font-normal bg-emerald-100/80 text-black">
                                Completed
                              </span>
                            )}
                            {row.type === "stopped" && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-[14px] font-normal bg-rose-100/80 text-black">
                                Stopped
                              </span>
                            )}
                          </td>
                          <td className="py-2 pr-4">
                            <MoreHorizontal className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-slate-600" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Column: Top 3 Projects (col-span-4) */}
            <div className="col-span-4">
              <div className="bg-white/40 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] rounded-2xl p-6 flex flex-col gap-4">
                <h3 className="text-[22px] text-slate-800 mb-1">Top 4 Projects</h3>
                <div className="flex flex-col gap-4">
                  {topProjects.slice(0, 4).map((proj, pIdx) => (
                    <div key={pIdx} className="flex flex-col gap-3 pb-5 border-b border-slate-300/70 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-[17px] font-medium text-slate-900">{proj.name}</h4>
                          <p className="text-[14px] text-slate-500 mt-0.5">{proj.sub}</p>
                        </div>
                        <span className="px-3 py-1 rounded-[10px] text-[13px] font-normal bg-[#C9D9F8]/60 text-[#1D5BD8] border border-[#1D5BD8]/10 shrink-0">
                          {proj.rules}
                        </span>
                      </div>
                      <div className="w-full h-10 rounded-xl overflow-hidden flex border border-white/40 shadow-inner">
                        {proj.segments.map((seg, sIdx) =>
                          seg.val > 0 ? (
                            <div
                              key={sIdx}
                              style={{ width: `${seg.val}%`, backgroundColor: seg.color }}
                              className="h-full flex items-center justify-center transition-all"
                              title={`${seg.label}: ${seg.pct}`}
                            >
                              {seg.label === "Completed" && (
                                <span className="text-[14px] font-normal text-white/90">{seg.pct}</span>
                              )}
                            </div>
                          ) : null
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-[14px] text-slate-500 mt-1">
                        {proj.segments.map((seg, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-1.5 min-w-0">
                            <span className="w-4.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                            <span className="truncate">
                              {seg.label} <strong className="text-slate-900 font-semibold ml-1">{seg.pct}</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

