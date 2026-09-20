import { lazy, Suspense, memo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Headphones, Map as MapIcon } from 'lucide-react';
import { useReceiptsContext } from '../context/useReceiptsContext';
import { categoryMeta } from '../components/categoryMeta';

const CATEGORY_COLORS: Record<string, string> = {
  music: '#e879f9', purchase: '#38bdf8', movie: '#fbbf24', event: '#fb7185',
  place: '#34d399', photo: '#a78bfa', message: '#2dd4bf', search: '#818cf8', note: '#a3e635',
};

const StatCard = memo(function StatCard({ icon: Icon, label, value, tint }: any) {
  return (
    <div className={`rounded-xl p-4 border bg-gradient-to-br ${tint} border-slate-800`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-center text-slate-200">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
          <div className="text-lg font-semibold text-slate-100 tabular-nums">{value}</div>
        </div>
      </div>
    </div>
  );
});

export const PatternInsights = memo(function PatternInsights() {
  const { categoryDistribution, monthlySpending, monthlyListening, placeFrequency, filteredReceipts } = useReceiptsContext();

  const totalSpend = monthlySpending.reduce((s, p) => s + p.value, 0);
  const totalMusic = monthlyListening.reduce((s, p) => s + p.value, 0);
  const totalUnique = new Set(filteredReceipts.map(r => r.timestamp.slice(0, 10))).size;

  const pieData = categoryDistribution.map(c => ({ name: c.category, value: c.count }));
  const topPlaces = placeFrequency.slice(0, 10);

  return (
    <div className="space-y-6">
      <header className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" /> Pattern insights
        </h1>
        <p className="mt-1 text-sm text-slate-400">Trends and frequencies across your filtered universe of receipts.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={BarChart3} label="Receipts total" value={filteredReceipts.length.toLocaleString()} tint="from-indigo-500/10 to-transparent" />
        <StatCard icon={TrendingUp} label="Recorded spend" value={`₹${totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} tint="from-sky-500/10 to-transparent" />
        <StatCard icon={Headphones} label="Music tracks played" value={totalMusic.toLocaleString()} tint="from-fuchsia-500/10 to-transparent" />
        <StatCard icon={MapIcon} label="Active days" value={totalUnique.toLocaleString()} tint="from-emerald-500/10 to-transparent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <section className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-sm font-semibold text-slate-200 mb-3">Monthly spending trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySpending} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickMargin={8} />
                <YAxis stroke="#64748b" fontSize={10} tickMargin={8} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: '#e2e8f0' }}
                  formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Spend']}
                />
                <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-sm font-semibold text-slate-200 mb-3">Category mix</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="#0f172a"
                >
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={CATEGORY_COLORS[d.name] ?? '#64748b'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v: any) => <span className="text-slate-300">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">Monthly listening volume (tracks)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyListening} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickMargin={8} />
              <YAxis stroke="#64748b" fontSize={10} tickMargin={8} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
                formatter={(v: any) => [`${Number(v).toLocaleString()} tracks`, 'Played']}
              />
              <Bar dataKey="value" fill="#e879f9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <MapIcon className="w-4 h-4 text-emerald-400" /> Top places by visit frequency
        </h2>
        {topPlaces.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">No location-tagged receipts in this filter set.</p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {topPlaces.map((p, i) => (
              <li key={p.name} className="py-2.5 flex items-center gap-3">
                <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-slate-800 text-slate-400 text-xs font-semibold tabular-nums">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-200 truncate">{p.name}</span>
                    <span className="text-xs font-semibold text-emerald-300 tabular-nums">{p.count}×</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      style={{ width: `${(p.count / (topPlaces[0]?.count ?? 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
});

export default PatternInsights;
