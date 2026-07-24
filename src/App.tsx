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
  { icon: <img src="/Disk.svg" alt="Disk" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />, value: "740", label: "Device under test" },
  { icon: <img src="/Box.svg" alt="Box" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />, value: "12.3K", label: "Total scans" },
  { icon: <img src="/ShieldCorrect.svg" alt="ShieldCorrect" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />, value: "98.2%", label: "Scan accuracy rate" },
  { icon: <img src="/Zap.svg" alt="Zap" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />, value: "64", label: "Total models" },
];

const topProjects = [
  {
    name: "ZCOM Suyash", sub: "ZCOM Suyash", rules: "5 Rules",
    segments: [
      { label: "Completed", pct: "20%", val: 20, color: "#69cb89" },
      { label: "Ongoing", pct: "8%", val: 8, color: "#5e88dc" },
      { label: "Failed", pct: "12%", val: 12, color: "#e67d65" },
      { label: "Yet to start", pct: "50%", val: 50, color: "#cccccc" },
      { label: "TSTL", pct: "5%", val: 5, color: "#c694ff" },
      { label: "MFC", pct: "5%", val: 5, color: "#e4ba00" },
    ],
  },
  {
    name: "Scaler ZH240", sub: "Scaler Inc", rules: "5 Rules",
    segments: [
      { label: "Completed", pct: "20%", val: 20, color: "#69cb89" },
      { label: "Ongoing", pct: "8%", val: 8, color: "#5e88dc" },
      { label: "Failed", pct: "0%", val: 0, color: "#e67d65" },
      { label: "Yet to start", pct: "72%", val: 72, color: "#cccccc" },
      { label: "TSTL", pct: "0%", val: 0, color: "#c694ff" },
      { label: "MFC", pct: "0%", val: 0, color: "#e4ba00" },
    ],
  },
  {
    name: "Scaler ZH240", sub: "Scaler Inc", rules: "5 Rules",
    segments: [
      { label: "Completed", pct: "20%", val: 20, color: "#69cb89" },
      { label: "Ongoing", pct: "0%", val: 0, color: "#5e88dc" },
      { label: "Failed", pct: "0%", val: 0, color: "#e67d65" },
      { label: "Yet to start", pct: "80%", val: 80, color: "#cccccc" },
      { label: "TSTL", pct: "0%", val: 0, color: "#c694ff" },
      { label: "MFC", pct: "0%", val: 0, color: "#e4ba00" },
    ],
  },
  {
    name: "Nordic Telecom", sub: "Nordic Systems", rules: "6 Rules",
    segments: [
      { label: "Completed", pct: "35%", val: 35, color: "#69cb89" },
      { label: "Ongoing", pct: "15%", val: 15, color: "#5e88dc" },
      { label: "Failed", pct: "8%", val: 8, color: "#e67d65" },
      { label: "Yet to start", pct: "32%", val: 32, color: "#cccccc" },
      { label: "TSTL", pct: "5%", val: 5, color: "#c694ff" },
      { label: "MFC", pct: "5%", val: 5, color: "#e4ba00" },
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
        className="fixed inset-0 -z-10 bg-[#f8fafc]"
      />

      {/* ── Header (Sticky across both mobile & desktop) ───────────────────── */}
      <header className="sticky top-0 z-50 w-full transition-all  backdrop-blur-md">
        <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
          {/* Desktop view: All inline, Mobile/Tablet: Logo and profile top, navbar bottom */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 select-none shrink-0">
              <img src="/logo.svg" alt="Murugan AI" className="h-6 sm:h-7 md:h-8 lg:h-9 w-auto object-contain" />
            </div>

            {/* Navigation Bar with Search icon wrapper */}
            <div className="flex items-center gap-1 lg:flex-1 lg:justify-center">
              <nav className="flex items-center gap-0.5 sm:gap-1 bg-white p-1 rounded-full border border-slate-200/80 shadow-sm w-full max-w-fit lg:flex-1 lg:justify-center">
                {["Dashboard", "Applications", "DUT", "Configuration"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setActiveNav(item)}
                    className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm lg:text-base font-semibold transition-all duration-200 whitespace-nowrap flex-1 ${activeNav === item
                        ? "bg-[#004FEC] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                  >
                    {item}
                  </button>
                ))}
                {/* Search icon - only visible on small screens, merged with navbar */}
                <div className="lg:hidden h-4 w-px bg-slate-200 mx-0.5 sm:mx-1 shrink-0" />
                <button
                  title="Search"
                  className="lg:hidden p-1.5 sm:p-2 md:p-2.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all shrink-0 flex items-center justify-center"
                >
                  <img src="/SearchIcon.svg" alt="Search" className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 object-contain" />
                </button>
              </nav>

              {/* Search icon - only visible on desktop, separate from navbar */}
              <button
                title="Search"
                className="hidden lg:flex rounded-full bg-white border border-slate-200/80 shadow-sm hover:bg-slate-50 transition-all items-center justify-center cursor-pointer shrink-0 h-[52px] w-[52px]"
              >
                <img src="/SearchIcon.svg" alt="Search" className="w-5 h-5 object-contain" />
              </button>
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden border border-slate-200/80 shadow-sm bg-white flex items-center justify-center p-0.5 cursor-pointer hover:opacity-90 transition-opacity">
                <img src={profileImage} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 pt-2 sm:pt-4 pb-6 sm:pb-8 flex flex-col gap-5 sm:gap-6">

        {/* Welcome row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl md:text-[28px] font-light tracking-tight sm:pl-2 md:pl-4 bg-gradient-to-r from-black via-[#001D6E] to-[#004FEC] bg-clip-text text-transparent">
            Good morning Admin
          </h1>
          <div className="flex items-center gap-1 bg-white/60 backdrop-blur-xl border border-white/80 rounded-full p-1 shadow-sm overflow-x-auto max-w-full mx-auto sm:mx-0">
            {["This Week", "This Month", "Custom"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTimeframe(t)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap ${activeTimeframe === t
                    ? "bg-[#004FEC] text-white shadow"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── 3-Column Responsive Bento Layout ───────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Row 1: Responsive 3-Section Grid (Stats, Timeline, Attention Required) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-stretch">

            {/* Section 1: 4 Glass-Blurred Compact Stat Cards (lg:col-span-4) */}
            <div className="md:col-span-2 lg:col-span-4 grid grid-cols-2 gap-3 sm:gap-3.5 h-full">
              {kpiCards.map((card, i) => (
                <div
                  key={i}
                  className="bg-transparent backdrop-blur-lg border border-white/90 rounded-2xl p-2.5 sm:p-3.5 md:p-4 lg:p-5 flex flex-col justify-center items-start h-full hover:bg-white/70 transition-all duration-200 relative overflow-hidden"
                  style={{ boxShadow: "inset 3px 3px 6px rgba(0,0,0,0.05), inset -3px -3px 6px rgba(255,255,255,0.9), 0 2px 15px -2px rgba(0,0,0,0.03)" }}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="shrink-0 flex items-center justify-center">
                      {card.icon}
                    </div>
                    <div
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] xl:text-[64px] text-black tracking-normal leading-none"
                      style={{ fontFamily: '"mozilla-headline-condensed", sans-serif', fontWeight: 600 }}
                    >
                      {card.value}
                    </div>
                  </div>
                  <div className="text-sm sm:text-base md:text-base lg:text-lg xl:text-xl font-normal text-slate-900 tracking-tight mt-1.5 sm:mt-2 lg:mt-3 text-left leading-snug" style={{ fontFamily: '"ManropeLocal", "Manrope", sans-serif' }}>
                    {card.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Section 2: Scan Activity Timeline Line Chart (lg:col-span-4) */}
            <div className="md:col-span-1 lg:col-span-4 relative flex flex-col h-full">
              <div className="bg-white border border-sky-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] rounded-2xl p-4 sm:p-5 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg sm:text-[22px] text-slate-800 font-manrope">Scan activity 3 timeline</h3>
                  <span className="text-[12px] sm:text-[13px] text-slate-500 font-normal">May, 2026</span>
                </div>
                <div className="flex-1 min-h-[160px] w-full flex items-center justify-center overflow-hidden">
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

            {/* Section 3: Attention Required (lg:col-span-4) */}
            <div className="md:col-span-1 lg:col-span-4 bg-white border border-sky-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] rounded-2xl p-4 sm:p-6 flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-[22px] text-slate-800">Attention required</h3>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                  <img src="/GoToArrow.svg" alt="Go to" className="w-4 h-4 object-cover" />
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
                  <div key={i} className="flex items-center gap-3 sm:gap-4 py-3 first:pt-0 last:pb-0">
                    {alert.isExclamation ? (
                      <img src="/Warning.svg" alt="Warning" className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 object-contain" />
                    ) : (
                      <img src="/Message.svg" alt="Message" className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 object-contain" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-[16px] font-medium text-slate-900 leading-snug">{alert.title}</div>
                      <div className="text-xs sm:text-[14px] text-slate-400 mt-0.5">{alert.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Row 2: Lower Content (Pie Chart, Top 5 Models, Recent Scans, Top 4 Projects) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

            {/* Left + Center Area (lg:col-span-8) */}
            <div className="lg:col-span-8 flex flex-col gap-4 w-full">

              {/* Scan Status Distribution & Top 5 Models */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                {/* Scan Status Distribution (md:col-span-6) */}
                <div className="md:col-span-6 bg-white border border-sky-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative">
                  <h3 className="text-lg sm:text-[22px] text-slate-800 tracking-tight">Scan status distribution</h3>

                  {/* Speedometer Gauge Donut Chart */}
                  <div className="relative flex justify-center items-center my-3 min-h-[180px] sm:min-h-[200px] w-full overflow-hidden">
                    <PieChart data={scanStatusPieData} size={260} innerRadius={102} startAngle={225} endAngle={495}>
                      {scanStatusPieData.map((_, idx) => (
                        <PieSlice key={idx} index={idx} />
                      ))}
                      <PieCenter defaultLabel="Total Scans" />
                    </PieChart>
                  </div>

                  {/* Horizontal Inline Legend */}
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-600 pt-3 border-t border-white/60">
                    {scanStatusPieData.map((d) => (
                      <div key={d.label} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-1 rounded-sm shrink-0" style={{ background: d.color }} />
                        <span className="text-slate-600 font-normal">{d.label}</span>
                        <span className="font-bold text-slate-900 ml-0.5">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top 5 Models (md:col-span-6) */}
                <div className="md:col-span-6 bg-white border border-sky-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] rounded-2xl p-3 sm:p-4 md:p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-[22px] xl:text-[24px] text-slate-800 mb-3 sm:mb-4 md:mb-5">
                      Top 5 models{" "}
                      <span className="font-normal text-slate-500 text-xs sm:text-sm md:text-base lg:text-[22px] xl:text-[24px] block sm:inline">(Execution &amp; Success rates)</span>
                    </h3>
                    <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3 lg:gap-3.5 flex-1">
                      {topModelsData.map((item, idx) => {
                        const pct = (item.count / item.max) * 100;
                        const opacities = [1.0, 0.88, 0.73, 0.53, 0.35];
                        return (
                          <div key={idx} className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3">
                            <span className="w-20 sm:w-24 md:w-28 lg:w-32 xl:w-36 text-[10px] sm:text-xs md:text-[13px] lg:text-[14px] xl:text-[15px] text-slate-700 shrink-0 truncate text-left">{item.name}</span>
                            <div className="flex-1 h-6 sm:h-7 md:h-8 lg:h-9 relative overflow-hidden rounded-xl bg-slate-100/90 flex items-center">
                              {/* Background progress bar */}
                              <div
                                className="absolute left-0 top-0 bottom-0 transition-all duration-500 rounded-xl"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: `rgba(0, 79, 236, ${opacities[idx]})`,
                                }}
                              />
                              {/* Base text (dark slate for greyed track area) */}
                              <span className="absolute left-0 px-2 sm:px-2.5 md:px-3 lg:px-3.5 xl:px-4 text-[9px] sm:text-[10px] md:text-xs lg:text-[13px] xl:text-[14px] font-semibold text-slate-700 whitespace-nowrap">
                                {item.scans}&nbsp;&nbsp;&nbsp;&nbsp;{idx === 4 ? "" : item.successRate}
                              </span>
                              {/* Overlay text (white for filled bar area, clipped to filled width) */}
                              <div
                                className="absolute left-0 top-0 bottom-0 overflow-hidden flex items-center transition-all duration-500 rounded-xl"
                                style={{ width: `${pct}%` }}
                              >
                                <span className="px-2 sm:px-2.5 md:px-3 lg:px-3.5 xl:px-4 text-[9px] sm:text-[10px] md:text-xs lg:text-[13px] xl:text-[14px] font-semibold text-white whitespace-nowrap">
                                  {item.scans}&nbsp;&nbsp;&nbsp;&nbsp;{idx === 4 ? "" : item.successRate}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] text-slate-500 mt-3 sm:mt-4 md:mt-5 pt-2 sm:pt-3 border-t border-white/60">
                    {[0, 500, 1000, 1500, 2500, 3000].map((v) => <span key={v}>{v}</span>)}
                  </div>
                </div>
              </div>

              {/* Recent Scans */}
              <div className="bg-white border border-sky-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] rounded-2xl p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <h3 className="text-lg sm:text-[22px] text-slate-800">Recent scans</h3>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                    <img src="/GoToArrow.svg" alt="Go to" className="w-4 h-4 object-contain" />
                  </button>
                </div>
                <div className="overflow-x-auto max-w-full">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="text-xs sm:text-[15px] text-slate-400 border-b border-slate-200/60">
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
                          <td className="py-1.5 pl-4 pr-2">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded accent-[#0052FF] cursor-pointer"
                            />
                          </td>
                          <td className="py-1.5 px-4 text-xs sm:text-[15px] font-semibold text-slate-800">{row.id}</td>
                          <td className="py-1.5 px-4 text-xs sm:text-[15px] text-slate-800">{row.project}</td>
                          <td className="py-1.5 px-4 text-xs sm:text-[15px] text-slate-800">{row.model}</td>
                          <td className="py-1.5 px-4 text-xs sm:text-[15px] text-slate-800">{row.datetime}</td>
                          <td className="py-1.5 px-4 whitespace-nowrap">
                            {row.type === "ongoing" && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-normal bg-[#0052FF]/10 text-black">
                                Ongoing | {(row as { progress?: string }).progress}
                              </span>
                            )}
                            {row.type === "completed" && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-normal bg-emerald-100/80 text-black">
                                Completed
                              </span>
                            )}
                            {row.type === "stopped" && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-normal bg-rose-100/80 text-black">
                                Stopped
                              </span>
                            )}
                          </td>
                          <td className="py-1.5 pr-4">
                            <MoreHorizontal className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-slate-600" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Column: Top 4 Projects (lg:col-span-4) */}
            <div className="lg:col-span-4 w-full flex flex-col">
              <div className="bg-white border border-sky-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] rounded-2xl p-4 sm:p-6 flex flex-col justify-between h-full relative overflow-hidden">
                <div>
                  <h3 className="text-lg sm:text-[22px] text-slate-800 mb-3 sm:mb-4">Top 4 Projects</h3>
                  <div className="flex flex-col gap-4">
                    {topProjects.slice(0, 4).map((proj, pIdx) => (
                      <div key={pIdx} className="flex flex-col gap-2.5 pb-4 border-b border-slate-200/60 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-base sm:text-[17px] font-medium text-slate-900">{proj.name}</h4>
                            <p className="text-xs sm:text-[14px] text-slate-500 mt-0.5">{proj.sub}</p>
                          </div>
                          <span className="px-3 py-1 rounded-[10px] text-xs sm:text-[13px] font-normal bg-[#C9D9F8]/60 text-black border border-[#1D5BD8]/10 shrink-0">
                            {proj.rules}
                          </span>
                        </div>
                        <div className="w-full h-9 sm:h-12 rounded-md overflow-hidden flex border border-white/40 shadow-inner">
                          {proj.segments.map((seg, sIdx) =>
                            seg.val > 0 ? (
                              <div
                                key={sIdx}
                                style={{ width: `${seg.val}%`, backgroundColor: seg.color }}
                                className="h-full flex items-center justify-center transition-all"
                                title={`${seg.label}: ${seg.pct}`}
                              >
                                {seg.label === "Completed" && (
                                  <span className="text-xs sm:text-[14px] font-semibold text-white/90">{seg.pct}</span>
                                )}
                              </div>
                            ) : null
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-x-2 sm:gap-x-3 gap-y-1.5 text-xs sm:text-[13px] text-slate-500 mt-0.5">
                          {proj.segments.map((seg, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-1.5 min-w-0">
                              <span className="w-3 h-1.5 sm:w-4 sm:h-1.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                              <span className="truncate">
                                {seg.label} <strong className="text-slate-900 font-semibold ml-0.5">{seg.pct}</strong>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom View More Button with White Gradient Overlay & Shadow */}
                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-center relative z-10">
                  <button className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-semibold text-xs sm:text-sm shadow-[0_4px_14px_0_rgba(255,255,255,1),0_4px_12px_rgba(0,0,0,0.06)] transition-all flex items-center justify-center gap-2 hover:shadow-[0_6px_20px_0_rgba(255,255,255,1),0_6px_16px_rgba(0,0,0,0.08)]">
                    View all projects
                    <img src="/GoToArrow.svg" alt="Arrow" className="w-3.5 h-3.5 object-contain" />
                  </button>
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

