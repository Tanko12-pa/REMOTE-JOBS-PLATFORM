import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Sparkles,
  RefreshCw,
  Globe,
  Printer,
  Download,
  FileText,
  X,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { SALARY_TRENDS_DATA } from '../data/platformsData';

export const SalaryTrendVisualizerView: React.FC = () => {
  const [jobTitle, setJobTitle] = useState<string>('Software Developer');
  const [region, setRegion] = useState<string>('Worldwide Remote');
  const [experienceLevel, setExperienceLevel] = useState<string>('Mid-Level');
  const [isEstimating, setIsEstimating] = useState<boolean>(false);
  const [showPdfReportModal, setShowPdfReportModal] = useState<boolean>(false);
  const [estimateResult, setEstimateResult] = useState<any>({
    jobTitle: 'Software Developer',
    region: 'Worldwide Remote',
    experienceLevel: 'Mid-Level',
    currency: 'USD',
    minSalary: 55000,
    medianSalary: 88000,
    maxSalary: 142000,
    hourlyRateRange: '$40 - $75 / hr',
    marketDemand: 'Very High',
    keyFactors: [
      'Strong written asynchronous communication skills',
      'React & TypeScript production experience',
      'Multi-timezone distributed team autonomy',
    ],
  });

  const handleRunSalaryEstimator = async () => {
    setIsEstimating(true);
    try {
      const response = await fetch('/api/gemini/salary-estimator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, region, experienceLevel }),
      });

      const data = await response.json();
      if (data.success && data.estimate) {
        setEstimateResult(data.estimate);
      }
    } catch (err) {
      console.error('Salary Estimator Error', err);
    } finally {
      setIsEstimating(false);
    }
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-2xl p-6 border border-amber-400/30 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-2 border border-amber-400/30">
              <TrendingUp className="w-3.5 h-3.5" />
              Recharts Global Compensation Analytics
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Salary Trend Visualizer & AI Estimator
            </h2>
            <p className="text-xs text-emerald-200 mt-1 max-w-xl">
              Track multi-year compensation growth charts and query Gemini AI for regional compensation benchmarks across global markets.
            </p>
          </div>

          <button
            onClick={() => setShowPdfReportModal(true)}
            id="export-salary-pdf-report-btn"
            className="px-4 py-2.5 rounded-xl bg-[#FBBF24] hover:bg-[#facc15] text-[#064E3B] font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all shrink-0"
          >
            <Printer className="w-4 h-4" />
            Export Salary PDF Report
          </button>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-500" />
            Global Remote Compensation Trends (2022 - 2026)
          </h3>
          <span className="text-xs font-bold text-emerald-800 dark:text-amber-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full">
            Recharts Active
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SALARY_TRENDS_DATA}>
              <defs>
                <linearGradient id="colorSenior" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#006400" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#006400" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="year" stroke="#888888" fontSize={11} />
              <YAxis
                stroke="#888888"
                fontSize={11}
                tickFormatter={(val) => `$${val / 1000}k`}
              />
              <Tooltip
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Pay']}
                contentStyle={{
                  backgroundColor: '#064E3B',
                  borderColor: '#FFD700',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="Lead"
                stroke="#D97706"
                fillOpacity={0.3}
                fill="#D97706"
              />
              <Area
                type="monotone"
                dataKey="Senior"
                stroke="#006400"
                fillOpacity={0.8}
                fill="url(#colorSenior)"
              />
              <Area
                type="monotone"
                dataKey="MidLevel"
                stroke="#FFD700"
                fillOpacity={0.8}
                fill="url(#colorMid)"
              />
              <Area
                type="monotone"
                dataKey="Junior"
                stroke="#2563EB"
                fillOpacity={0.2}
                fill="#2563EB"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Salary Estimator Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estimator Input Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            AI Salary Estimator Query
          </h3>

          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Job Title / Field
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Region Focus
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                <option value="Worldwide Remote">Worldwide Remote</option>
                <option value="Canada Remote">Canada Remote</option>
                <option value="Nigeria Remote">Nigeria (USD Pay)</option>
                <option value="Ghana Remote">Ghana (USD Pay)</option>
                <option value="United Kingdom">United Kingdom (GBP)</option>
                <option value="USA Remote">USA Remote</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                <option value="Entry-Level">Entry-Level</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Executive Lead">Executive Lead</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleRunSalaryEstimator}
            disabled={isEstimating}
            id="run-salary-estimator-btn"
            className="w-full py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
          >
            {isEstimating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                Estimating Salary Benchmarks...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                Estimate Regional Salary Benchmarks
              </>
            )}
          </button>
        </div>

        {/* Estimate Results Card */}
        {estimateResult && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                  {estimateResult.jobTitle}
                </h4>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Globe className="w-3 h-3 text-emerald-600" />
                  {estimateResult.region} ({estimateResult.experienceLevel})
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-amber-300 text-xs font-black">
                Market Demand: {estimateResult.marketDemand}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Minimum</span>
                <span className="text-base font-extrabold text-slate-700 dark:text-slate-200">
                  ${estimateResult.minSalary?.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300/40 rounded-xl text-center">
                <span className="text-[10px] text-amber-800 dark:text-amber-300 font-extrabold block">
                  Median Pay
                </span>
                <span className="text-lg font-black text-emerald-900 dark:text-amber-400">
                  ${estimateResult.medianSalary?.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Top Percentile</span>
                <span className="text-base font-extrabold text-slate-700 dark:text-slate-200">
                  ${estimateResult.maxSalary?.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Estimated Hourly Rate Range: {estimateResult.hourlyRateRange}
              </span>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc pl-4">
                {estimateResult.keyFactors?.map((f: string, i: number) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setShowPdfReportModal(true)}
              id="generate-pdf-summary-report-btn"
              className="w-full py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#043e2f] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <FileText className="w-4 h-4 text-[#FBBF24]" />
              Generate Summary PDF Report for {estimateResult.jobTitle}
            </button>
          </div>
        )}
      </div>

      {/* Printable Summary PDF Report Modal */}
      {showPdfReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl max-w-3xl w-full p-6 border-2 border-[#FBBF24] shadow-2xl space-y-6 my-8 print:p-0 print:border-none print:shadow-none print:max-w-none">
            {/* Modal Actions Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-800 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#064E3B] dark:text-[#FBBF24]" />
                <h3 className="text-sm font-black text-[#064E3B] dark:text-emerald-100">
                  Regional Salary Summary PDF Report Preview
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerPrint}
                  id="print-pdf-report-trigger-btn"
                  className="px-3.5 py-1.5 rounded-xl bg-[#064E3B] hover:bg-[#043e2f] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Printer className="w-4 h-4 text-[#FBBF24]" />
                  Print / Save as PDF
                </button>

                <button
                  onClick={() => setShowPdfReportModal(false)}
                  className="p-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content Body */}
            <div className="space-y-6 print:text-black">
              {/* Header Banner */}
              <div className="p-6 bg-[#064E3B] text-white rounded-xl border border-[#FBBF24]/50 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FBBF24]">
                    Official Career Intelligence Report • 2026 Edition
                  </span>
                  <h1 className="text-2xl font-black text-white mt-1">
                    Regional Salary Insights Report
                  </h1>
                  <p className="text-xs text-emerald-100 mt-1">
                    Target Role: <strong>{estimateResult?.jobTitle || jobTitle}</strong> • Region Focus: <strong>{estimateResult?.region || region}</strong>
                  </p>
                </div>

                <div className="text-right text-[10px] text-emerald-100">
                  <p className="font-bold">Generated: {new Date().toLocaleDateString()}</p>
                  <p className="mt-0.5">Platform: Remote Jobs Suite</p>
                </div>
              </div>

              {/* Key Benchmark Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Minimum Compensation</span>
                  <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 block">
                    ${estimateResult?.minSalary?.toLocaleString()} / yr
                  </span>
                  <span className="text-[10px] text-slate-400">Entry / Regional Floor</span>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/50 rounded-xl border-2 border-[#FBBF24] text-center">
                  <span className="text-[10px] font-extrabold text-[#064E3B] dark:text-[#FBBF24] uppercase block">Median Pay Target</span>
                  <span className="text-2xl font-black text-[#064E3B] dark:text-[#FBBF24] mt-1 block">
                    ${estimateResult?.medianSalary?.toLocaleString()} / yr
                  </span>
                  <span className="text-[10px] text-amber-900 dark:text-amber-200 font-bold">Standard Market Rate</span>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Top Percentile Pay</span>
                  <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 block">
                    ${estimateResult?.maxSalary?.toLocaleString()} / yr
                  </span>
                  <span className="text-[10px] text-slate-400">Senior / Lead Ceiling</span>
                </div>
              </div>

              {/* Hourly & Demand Summary */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#064E3B] dark:text-[#FBBF24]" />
                  <div>
                    <span className="text-xs font-bold text-[#064E3B] dark:text-emerald-200">
                      Hourly Contract Rate Benchmark: {estimateResult?.hourlyRateRange || '$40 - $75 / hr'}
                    </span>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                      Experience Band: {estimateResult?.experienceLevel || experienceLevel} • Market Demand: <strong>{estimateResult?.marketDemand || 'High'}</strong>
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-[#064E3B] text-[#FBBF24] text-xs font-bold shrink-0">
                  Demand: {estimateResult?.marketDemand || 'Very High'}
                </span>
              </div>

              {/* Regional Compensation Breakdown Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-[#064E3B] dark:text-emerald-100 uppercase tracking-wider">
                  Regional USD Compensation Comparison Matrix
                </h4>
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#064E3B] text-white text-[11px]">
                      <tr>
                        <th className="p-2.5 font-bold">Region Focus</th>
                        <th className="p-2.5 font-bold">Min USD</th>
                        <th className="p-2.5 font-bold">Median USD</th>
                        <th className="p-2.5 font-bold">Top USD</th>
                        <th className="p-2.5 font-bold">Cost of Living Adj.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      <tr className="bg-amber-50/50 dark:bg-amber-950/20 font-bold">
                        <td className="p-2.5 text-[#064E3B] dark:text-[#FBBF24] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#064E3B]" />
                          {estimateResult?.region || region} (Target)
                        </td>
                        <td className="p-2.5">${estimateResult?.minSalary?.toLocaleString()}</td>
                        <td className="p-2.5 font-black text-[#064E3B] dark:text-[#FBBF24]">
                          ${estimateResult?.medianSalary?.toLocaleString()}
                        </td>
                        <td className="p-2.5">${estimateResult?.maxSalary?.toLocaleString()}</td>
                        <td className="p-2.5 text-emerald-700 dark:text-emerald-300">High Purchasing Power</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold">Worldwide Remote</td>
                        <td className="p-2.5">$55,000</td>
                        <td className="p-2.5">$88,000</td>
                        <td className="p-2.5">$142,000</td>
                        <td className="p-2.5">Global Standard</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold">USA Remote</td>
                        <td className="p-2.5">$85,000</td>
                        <td className="p-2.5 font-bold">$125,000</td>
                        <td className="p-2.5">$185,000</td>
                        <td className="p-2.5 text-slate-500">High Baseline</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold">Canada Remote</td>
                        <td className="p-2.5">$65,000</td>
                        <td className="p-2.5">$95,000</td>
                        <td className="p-2.5">$150,000</td>
                        <td className="p-2.5 text-slate-500">Medium High</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold">West Africa (Nigeria / Ghana)</td>
                        <td className="p-2.5">$35,000</td>
                        <td className="p-2.5 font-bold">$60,000</td>
                        <td className="p-2.5">$110,000</td>
                        <td className="p-2.5 text-emerald-700 font-extrabold">Ultra High Local Power</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Key Factors & Negotiation Tips */}
              <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#FBBF24]" />
                  Key Factors Maximizing Compensation
                </h4>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-5">
                  {estimateResult?.keyFactors?.map((factor: string, idx: number) => (
                    <li key={idx}>{factor}</li>
                  ))}
                  <li>Demonstrate proven asynchronous documentation hygiene in cross-timezone interviews.</li>
                  <li>Inquire about hardware stipends, learning allowances, and USD wire transaction coverage.</li>
                </ul>
              </div>

              {/* Footer Stamp */}
              <div className="pt-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <p>Report generated by AI Studio Remote Job Aggregator & Salary Estimator.</p>
                <p>Page 1 of 1</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
