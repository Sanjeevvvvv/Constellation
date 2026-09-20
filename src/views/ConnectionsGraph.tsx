import { memo, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { SimulationNodeDatum } from 'd3-force';
import { forceSimulation, forceManyBody, forceLink, forceCenter, forceCollide } from 'd3-force';
import { Network, Info } from 'lucide-react';
import { useReceiptsContext } from '../context/useReceiptsContext';
import { categoryMeta } from '../components/categoryMeta';
import type { ReceiptCategory } from '../types/receipt';

interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  kind: 'category' | 'tag' | 'location';
  count: number;
  category?: ReceiptCategory;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  music: '#e879f9', purchase: '#38bdf8', movie: '#fbbf24', event: '#fb7185',
  place: '#34d399', photo: '#a78bfa', message: '#2dd4bf', search: '#818cf8', note: '#a3e635',
};

function buildGraph(allReceipts: any[], limit = 120): { nodes: GraphNode[]; links: GraphLink[] } {
  const receipts = allReceipts.slice(0, Math.max(limit, 120));
  const nodeMap = new Map<string, GraphNode>();
  const linkMap = new Map<string, GraphLink>();

  const add = (n: GraphNode) => { if (!nodeMap.has(n.id)) nodeMap.set(n.id, n); };
  const linkKey = (a: string, b: string) => a < b ? `${a}||${b}` : `${b}||${a}`;
  const bump = (a: string, b: string, v = 1) => {
    const k = linkKey(a, b);
    const ex = linkMap.get(k);
    if (ex) ex.value += v;
    else linkMap.set(k, { source: a, target: b, value: v });
  };

  const tagCounts = new Map<string, number>();
  const locCounts = new Map<string, number>();
  for (const r of receipts) {
    for (const t of r.tags ?? []) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    const ln = r.location?.name;
    if (ln) locCounts.set(ln, (locCounts.get(ln) ?? 0) + 1);
  }
  const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k]) => k);
  const topLocs = [...locCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k]) => k);

  const catCounts = new Map<string, number>();
  for (const r of receipts) catCounts.set(r.category, (catCounts.get(r.category) ?? 0) + 1);
  for (const [cat, count] of catCounts) {
    add({ id: `cat:${cat}`, label: cat, kind: 'category', count, category: cat as any });
  }
  for (const t of topTags) {
    add({ id: `tag:${t}`, label: t, kind: 'tag', count: tagCounts.get(t) ?? 0 });
  }
  for (const l of topLocs) {
    add({ id: `loc:${l}`, label: l, kind: 'location', count: locCounts.get(l) ?? 0 });
  }

  for (const r of receipts) {
    const cNode = `cat:${r.category}`;
    for (const t of r.tags ?? []) {
      if (!topTags.includes(t)) continue;
      bump(cNode, `tag:${t}`);
    }
    const ln = r.location?.name;
    if (ln && topLocs.includes(ln)) bump(cNode, `loc:${ln}`);
    for (let i = 0; i < (r.tags ?? []).length; i++) {
      for (let j = i + 1; j < (r.tags ?? []).length; j++) {
        const a = r.tags![i], b = r.tags![j];
        if (!topTags.includes(a) || !topTags.includes(b)) continue;
        bump(`tag:${a}`, `tag:${b}`, 1);
      }
    }
  }

  const nodes = [...nodeMap.values()];
  const links = [...linkMap.values()];
  return { nodes, links };
}

export const ConnectionsGraph = memo(function ConnectionsGraph() {
  const { filteredReceipts } = useReceiptsContext();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [size, setSize] = useState({ w: 800, h: 520 });
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const simRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const cr = e.contentRect;
        setSize({ w: Math.max(400, Math.floor(cr.width)), h: Math.max(380, Math.min(640, Math.max(380, Math.floor(cr.width * 0.62)))) });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const graph = useMemo(() => buildGraph(filteredReceipts), [filteredReceipts]);

  useEffect(() => {
    const nodesCopy = graph.nodes.map(n => ({ ...n })) as any[];
    const linksCopy = graph.links.map(l => ({ ...l }));
    setLinks(linksCopy);
    if (simRef.current) simRef.current.stop();
    const sim = forceSimulation(nodesCopy as any)
      .force('link', forceLink(linksCopy as any).id((d: any) => d.id).distance(40).strength(0.4))
      .force('charge', forceManyBody().strength(-110))
      .force('collide', forceCollide(26))
      .force('center', forceCenter(size.w / 2, size.h / 2).strength(0.6))
      .on('tick', () => setNodes([...nodesCopy] as any));
    simRef.current = sim;
    return () => { sim.stop(); };
  }, [graph, size.w, size.h]);

  const nodeById = useMemo(() => {
    const m = new Map<string, GraphNode>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

  const neighbors = useMemo(() => {
    const s = new Set<string>();
    if (!selected) return s;
    s.add(selected);
    for (const l of links) {
      const a = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const b = typeof l.target === 'string' ? l.target : (l.target as any).id;
      if (a === selected) s.add(b);
      else if (b === selected) s.add(a);
    }
    return s;
  }, [links, selected]);

  const activeNodeList = Array.from(nodeById.values());

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!activeNodeList.length) return;
    if (e.key === 'Escape') { setSelected(null); return; }
    if (e.key === 'Enter' && selected) return;
    if (!selected) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setSelected(activeNodeList[0].id);
        e.preventDefault();
      }
      return;
    }
    const cur = nodeById.get(selected);
    if (!cur) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      const cur = nodeById.get(selected);
      if (!cur) return;
      const sorted = [...activeNodeList].sort((a, b) => {
        const da = Math.hypot((a.x ?? 0) - (cur.x ?? 0), (a.y ?? 0) - (cur.y ?? 0));
        const db = Math.hypot((b.x ?? 0) - (cur.x ?? 0), (b.y ?? 0) - (cur.y ?? 0));
        return da - db;
      });
      const next = sorted.find(n => n.id !== selected);
      if (next) setSelected(next.id);
      e.preventDefault();
    }
  }, [selected, nodeById, activeNodeList]);

  const selNode = selected ? nodeById.get(selected) : undefined;

  const maxCount = Math.max(1, ...nodes.map(n => n.count));

  return (
    <div className="space-y-5">
      <header className="pb-2 border-b border-slate-800 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-300 flex-shrink-0">
          <Network className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-100">Connections</h1>
          <p className="mt-1 text-sm text-slate-400">Categories, tags, and places drawn together by the receipts they share. Click a node or use arrow keys to navigate, Enter to confirm.</p>
        </div>
      </header>

      <div
        ref={containerRef}
        className="relative rounded-2xl border border-slate-800 bg-slate-950/40 overflow-hidden"
      >
        <svg
          ref={svgRef}
          role="img"
          aria-label="Interactive graph of constellation connections"
          width="100%"
          height={size.h}
          viewBox={`0 0 ${size.w} ${size.h}`}
          preserveAspectRatio="xMidYMid meet"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:rounded-2xl"
        >
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>
          </defs>
          {links.map((l, i) => {
            const a = nodeById.get(typeof l.source === 'string' ? l.source : (l.source as any).id);
            const b = nodeById.get(typeof l.target === 'string' ? l.target : (l.target as any).id);
            if (!a || !b) return null;
            const dim = selected && !neighbors.has(a.id) && !neighbors.has(b.id);
            const w = 0.5 + Math.min(2.5, l.value * 0.35);
            return (
              <line
                key={i}
                x1={a.x ?? 0}
                y1={a.y ?? 0}
                x2={b.x ?? 0}
                y2={b.y ?? 0}
                stroke={dim ? '#1e293b' : '#475569'}
                strokeOpacity={dim ? 0.25 : 0.7}
                strokeWidth={w}
              />
            );
          })}
          {nodes.map(n => {
            const isSel = n.id === selected;
            const dim = selected && !neighbors.has(n.id);
            const r = 5 + Math.min(22, (n.count / maxCount) * 20);
            let fill = '#64748b';
            if (n.kind === 'category') fill = CATEGORY_COLORS[n.category as string] ?? '#64748b';
            if (n.kind === 'tag') fill = '#fbbf24';
            if (n.kind === 'location') fill = '#34d399';
            const labelTooLong = n.label.length > 16;
            const label = labelTooLong ? n.label.slice(0, 15) + '…' : n.label;
            return (
              <g
                key={n.id}
                transform={`translate(${n.x ?? 0}, ${n.y ?? 0})`}
                style={{ cursor: 'pointer', opacity: dim ? 0.25 : 1 }}
                onClick={() => setSelected(isSel ? null : n.id)}
                tabIndex={-1}
              >
                {isSel ? <circle r={r + 10} fill="url(#glow)" /> : null}
                <circle
                  r={r}
                  fill={fill}
                  fillOpacity={0.85}
                  stroke={isSel ? '#fff' : '#0f172a'}
                  strokeWidth={isSel ? 2 : 1}
                />
                <text
                  y={r + 12}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isSel ? '#f1f5f9' : '#cbd5e1'}
                  style={{ pointerEvents: 'none' }}
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
        {selNode ? (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-80 rounded-xl border border-indigo-500/30 bg-slate-900/85 backdrop-blur p-3 text-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-semibold text-slate-100 truncate">{selNode.label}</span>
              <span className="text-[10px] uppercase tracking-wide text-slate-400 px-1.5 py-0.5 rounded-full bg-slate-800 border border-slate-700">{selNode.kind}</span>
            </div>
            <div className="text-xs text-slate-400">
              Appears in <span className="text-slate-200 font-semibold">{selNode.count}</span> receipt{selNode.count === 1 ? '' : 's'}.
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-2 text-xs text-indigo-300 hover:text-indigo-200 min-h-[36px] px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/70 border border-slate-800 rounded-lg px-2 py-1">
            <Info className="w-3.5 h-3.5" />
            Arrow keys to navigate · Enter / click to select · Esc to dismiss
          </div>
        )}
      </div>
    </div>
  );
});

export default ConnectionsGraph;
