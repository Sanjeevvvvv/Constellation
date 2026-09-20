import { memo } from 'react';
import { MapPin, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useReceiptsContext } from '../context/useReceiptsContext';

const COLORS = ['#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#022c22', '#0f766e'];

export const PlacesFrequency = memo(function PlacesFrequency() {
  const { placeFrequency, filteredReceipts } = useReceiptsContext();

  const top = placeFrequency.slice(0, 20);
  const totalTagged = filteredReceipts.filter(r => r.location?.name).length;
  const uniquePlaces = placeFrequency.length;
  const chartData = top.slice(0, 15).map(p => ({ name: p.name.length > 14 ? p.name.slice(0, 13) + '…' : p.name, full: p.name, count: p.count }));

  return (
    <div className="space-y-6">
      <header className="pb-2 border-b border-slate-800 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 flex-shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-100">Places</h1>
          <p className="mt-1 text-sm text-slate-400">
            Frequency and pattern view across all categories. No real geographic coordinates exist in this dataset — this view surfaces visit patterns by name only.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl p-4 border border-slate-800 bg-gradient-to-br from-emerald-500/10 to-transparent">
          <div className="text-xs uppercase tracking-wide text-slate-400">Unique places named</div>
          <div className="mt-1 text-2xl font-semibold text-slate-100 tabular-nums">{uniquePlaces.toLocaleString()}</div>
        </div>
        <div className="rounded-xl p-4 border border-slate-800 bg-gradient-to-br from-teal-500/10 to-transparent">
          <div className="text-xs uppercase tracking-wide text-slate-400">Location-tagged receipts</div>
          <div className="mt-1 text-2xl font-semibold text-slate-100 tabular-nums">{totalTagged.toLocaleString()}</div>
        </div>
        <div className="rounded-xl p-4 border border-slate-800 bg-gradient-to-br from-green-500/10 to-transparent">
          <div className="text-xs uppercase tracking-wide text-slate-400">Top place visits</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-100 tabular-nums">{top[0]?.count ?? 0}×</span>
            <span className="text-sm text-slate-400 truncate">{top[0]?.name ?? '—'}</span>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" /> Visit count — top 15 places
        </h2>
        {chartData.length === 0 ? (
          <p className="text-sm text-slate-500 py-10 text-center">No location-tagged receipts in this filter set.</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={110} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
                  formatter={(v: any) => [`${Number(v)} visits`, 'Count']}
                  labelFormatter={(l, p: any) => (p?.[0]?.payload?.full ?? l)}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">Full ranked list</h2>
        {top.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">No places to show.</p>
        ) : (
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 divide-y divide-slate-800">
            {top.map((p, i) => (
              <li key={p.name} className="py-2.5 flex items-center gap-3 col-span-1">
                <span className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-slate-800 text-slate-400 text-xs font-semibold tabular-nums flex-shrink-0">{i + 1}</span>
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="flex-1 min-w-0 text-sm text-slate-200 truncate">{p.name}</span>
                <span className="text-xs font-semibold text-emerald-300 tabular-nums flex-shrink-0">{p.count}×</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
});

export default PlacesFrequency;
