'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force';
import { AlertTriangle, Loader2, Maximize2, RotateCcw, Search, X, ZoomIn, ZoomOut } from 'lucide-react';

import { useNepaliIME } from '../lib/useNepaliIME';

import type {
  LegalResearchSubgraphNode,
  LegalResearchSubgraphEdge,
  LegalResearchSubgraphHub,
} from '@/generated/wokil-api';
import {
  getLegalResearchSubgraphOptions,
  searchLegalResearchGraphOptions,
} from '@/generated/wokil-api/@tanstack/react-query.gen';

import type { DocumentTarget } from './DocumentPanel';

// --- Force simulation types ------------------------------------------------

interface SimNode extends SimulationNodeDatum {
  id: string;
  kind: string;
  label: string;
  value: number;
  isRepealed: boolean;
  detail: string | null;
  isDangling: boolean;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  kind: string;
  dangling: boolean;
  label: string | null;
}

// --- Colour by kind --------------------------------------------------------

const KIND_COLORS: Record<string, string> = {
  document: '#d4954b',
  missing: '#9ca3af',
  judge: '#6366f1',
  advocate: '#0ea5e9',
  petitioner: '#f59e0b',
  respondent: '#ef4444',
  case_type: '#64748b',
  bench: '#8b5cf6',
};

function kindColor(kind: string): string {
  return KIND_COLORS[kind] ?? '#9ca3af';
}

function kindColorDim(kind: string): string {
  const c = kindColor(kind);
  return c + '40';
}

// --- Node radius from value ------------------------------------------------

function nodeRadius(value: number): number {
  return Math.max(8, Math.min(28, 6 + Math.sqrt(value) * 3.5));
}

// --- Adjacency index for highlight-on-hover --------------------------------

function buildAdjacency(links: SimLink[]): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  for (const l of links) {
    const sId = typeof l.source === 'string' ? l.source : (l.source as SimNode).id;
    const tId = typeof l.target === 'string' ? l.target : (l.target as SimNode).id;
    if (!adj.has(sId)) adj.set(sId, new Set());
    if (!adj.has(tId)) adj.set(tId, new Set());
    adj.get(sId)!.add(tId);
    adj.get(tId)!.add(sId);
  }
  return adj;
}

// --- Truncation & suppressed-hubs notice -----------------------------------

function GraphNotices({
  truncated,
  suppressedHubs,
}: {
  truncated: Record<string, number>;
  suppressedHubs: LegalResearchSubgraphHub[];
}) {
  const truncEntries = Object.entries(truncated).filter(([, v]) => v > 0);
  if (truncEntries.length === 0 && suppressedHubs.length === 0) return null;

  return (
    <div className="px-4 py-2.5 text-xs text-muted-foreground border-t border-border space-y-1">
      {truncEntries.length > 0 && (
        <p>
          Not shown:{' '}
          {truncEntries.map(([kind, count]) => `${count} ${kind}`).join(', ')}
        </p>
      )}
      {suppressedHubs.length > 0 && (
        <p>
          Also connected to:{' '}
          {suppressedHubs.map((h) => `${h.name} (${h.role}, ${h.document_count} docs)`).join(', ')}
        </p>
      )}
    </div>
  );
}

// --- Legend -----------------------------------------------------------------

function GraphLegend({ kinds }: { kinds: string[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-4 py-2.5 text-[11px] text-muted-foreground border-t border-border">
      {kinds.map((kind) => (
        <span key={kind} className="flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full border border-white/20"
            style={{ backgroundColor: kindColor(kind) }}
          />
          {kind}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-6 border-t-2 border-dashed" style={{ borderColor: '#9ca3af' }} />
        not in corpus
      </span>
    </div>
  );
}

// --- Tooltip (HTML overlay, not SVG) ---------------------------------------

interface TooltipData {
  screenX: number;
  screenY: number;
  node: SimNode;
  connections: number;
}

function GraphTooltip({ data }: { data: TooltipData }) {
  const { node, connections, screenX, screenY } = data;
  return (
    <div
      className="absolute z-10 pointer-events-none bg-popover border border-border rounded-lg shadow-lg px-3 py-2.5 min-w-[180px] max-w-[260px]"
      style={{
        left: screenX,
        top: screenY,
        transform: 'translate(-50%, -100%) translateY(-12px)',
      }}
    >
      <p className="text-sm font-medium text-foreground leading-tight truncate">{node.label}</p>
      <div className="mt-1.5 space-y-0.5 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: kindColor(node.kind) }}
          />
          <span>{node.kind}</span>
        </div>
        {node.detail && <p className="truncate">{node.detail}</p>}
        <p>{connections} connection{connections === 1 ? '' : 's'}</p>
        {node.isRepealed && (
          <p className="text-destructive font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Repealed
          </p>
        )}
      </div>
      {!node.isDangling && (
        <p className="mt-1.5 text-[10px] text-accent">
          {node.id.startsWith('document:') ? 'Click to open · Double-click to explore' : 'Click to explore neighbourhood'}
        </p>
      )}
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45 bg-popover border-r border-b border-border"
      />
    </div>
  );
}

// --- SVG graph with live simulation ----------------------------------------

function GraphCanvas({
  rawNodes,
  rawEdges,
  seed,
  onClickNode,
  onDoubleClickNode,
}: {
  rawNodes: LegalResearchSubgraphNode[];
  rawEdges: LegalResearchSubgraphEdge[];
  seed: string;
  onClickNode: (nodeId: string) => void;
  onDoubleClickNode: (nodeId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<Simulation<SimNode, SimLink> | null>(null);

  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [links, setLinks] = useState<SimLink[]>([]);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [panning, setPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const adjacency = useMemo(() => buildAdjacency(links), [links]);

  // --- Initialise simulation -----------------------------------------------
  useEffect(() => {
    const nodeMap = new Map<string, SimNode>();
    const simNodes: SimNode[] = rawNodes.map((n) => {
      const sn: SimNode = {
        id: n.id,
        kind: n.kind,
        label: n.label,
        value: n.value,
        isRepealed: n.is_repealed ?? false,
        detail: n.detail ?? null,
        isDangling: n.kind === 'missing',
      };
      nodeMap.set(n.id, sn);
      return sn;
    });

    const simLinks: SimLink[] = rawEdges
      .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
      .map((e) => ({
        source: e.source,
        target: e.target,
        kind: e.kind,
        dangling: e.dangling,
        label: e.label ?? null,
      }));

    const w = containerRef.current?.clientWidth ?? 600;
    const h = containerRef.current?.clientHeight ?? 500;

    const sim = forceSimulation<SimNode>(simNodes)
      .force(
        'link',
        forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(100)
          .strength(0.7),
      )
      .force('charge', forceManyBody<SimNode>().strength((d) => -150 - d.value * 10))
      .force('center', forceCenter(w / 2, h / 2))
      .force('collide', forceCollide<SimNode>().radius((d) => nodeRadius(d.value) + 8).strength(0.8))
      .force('x', forceX<SimNode>(w / 2).strength(0.03))
      .force('y', forceY<SimNode>(h / 2).strength(0.03))
      .alphaDecay(0.02)
      .on('tick', () => {
        setNodes([...simNodes]);
        setLinks([...simLinks]);
      });

    simRef.current = sim;
    return () => { sim.stop(); };
  }, [rawNodes, rawEdges]);

  // --- Node drag -----------------------------------------------------------
  const handleNodePointerDown = useCallback(
    (e: React.PointerEvent, nodeId: string) => {
      e.stopPropagation();
      e.preventDefault();
      (e.target as Element).setPointerCapture(e.pointerId);
      setDraggedNode(nodeId);
      setTooltip(null);
      const sim = simRef.current;
      if (!sim) return;
      sim.alphaTarget(0.3).restart();
      const node = sim.nodes().find((n) => n.id === nodeId);
      if (node) {
        node.fx = node.x;
        node.fy = node.y;
      }
    },
    [],
  );

  const handleNodePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggedNode) return;
      const sim = simRef.current;
      if (!sim) return;
      const node = sim.nodes().find((n) => n.id === draggedNode);
      if (!node) return;
      const rect = svgRef.current!.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      node.fx = (mx - transform.x) / transform.k;
      node.fy = (my - transform.y) / transform.k;
    },
    [draggedNode, transform],
  );

  const handleNodePointerUp = useCallback(
    () => {
      if (!draggedNode) return;
      const sim = simRef.current;
      if (sim) {
        sim.alphaTarget(0);
        const node = sim.nodes().find((n) => n.id === draggedNode);
        if (node) {
          node.fx = null;
          node.fy = null;
        }
      }
      setDraggedNode(null);
    },
    [draggedNode],
  );

  // --- Canvas pan ----------------------------------------------------------
  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0 || draggedNode) return;
      setPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
      (e.target as Element).setPointerCapture(e.pointerId);
    },
    [transform.x, transform.y, draggedNode],
  );

  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (draggedNode) {
        handleNodePointerMove(e);
        return;
      }
      if (!panning) return;
      setTransform((t) => ({
        ...t,
        x: panStart.current.tx + (e.clientX - panStart.current.x),
        y: panStart.current.ty + (e.clientY - panStart.current.y),
      }));
    },
    [panning, draggedNode, handleNodePointerMove],
  );

  const handleCanvasPointerUp = useCallback(() => {
    setPanning(false);
    handleNodePointerUp();
  }, [handleNodePointerUp]);

  // --- Zoom ----------------------------------------------------------------
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.92 : 1.08;
    setTransform((t) => {
      const newK = Math.max(0.15, Math.min(5, t.k * factor));
      const rect = svgRef.current!.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      return {
        k: newK,
        x: mx - ((mx - t.x) / t.k) * newK,
        y: my - ((my - t.y) / t.k) * newK,
      };
    });
  }, []);

  const zoomToFit = useCallback(() => {
    if (nodes.length === 0 || !containerRef.current) return;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of nodes) {
      const r = nodeRadius(n.value);
      if (n.x! - r < minX) minX = n.x! - r;
      if (n.x! + r > maxX) maxX = n.x! + r;
      if (n.y! - r < minY) minY = n.y! - r;
      if (n.y! + r > maxY) maxY = n.y! + r;
    }
    const pad = 60;
    const gw = maxX - minX + pad * 2;
    const gh = maxY - minY + pad * 2;
    const k = Math.min(w / gw, h / gh, 2);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    setTransform({ k, x: w / 2 - cx * k, y: h / 2 - cy * k });
  }, [nodes]);

  // Auto fit on first render
  const hasAutoFit = useRef(false);
  useEffect(() => {
    if (nodes.length > 0 && !hasAutoFit.current) {
      const timer = setTimeout(() => { zoomToFit(); hasAutoFit.current = true; }, 600);
      return () => clearTimeout(timer);
    }
  }, [nodes, zoomToFit]);

  // Reset auto-fit when seed changes
  useEffect(() => { hasAutoFit.current = false; }, [seed]);

  // --- Hover with tooltip --------------------------------------------------
  const handleNodeHover = useCallback(
    (e: React.PointerEvent, node: SimNode | null) => {
      if (draggedNode) return;
      if (node) {
        setHoveredNode(node.id);
        const rect = containerRef.current!.getBoundingClientRect();
        const sx = node.x! * transform.k + transform.x;
        const sy = node.y! * transform.k + transform.y;
        setTooltip({
          screenX: sx,
          screenY: sy,
          node,
          connections: adjacency.get(node.id)?.size ?? 0,
        });
      } else {
        setHoveredNode(null);
        setTooltip(null);
      }
    },
    [transform, adjacency, draggedNode],
  );

  // --- Visibility helpers --------------------------------------------------
  const isHighlighted = useCallback(
    (nodeId: string) => {
      if (!hoveredNode) return true;
      if (nodeId === hoveredNode) return true;
      return adjacency.get(hoveredNode)?.has(nodeId) ?? false;
    },
    [hoveredNode, adjacency],
  );

  const isEdgeHighlighted = useCallback(
    (source: string, target: string) => {
      if (!hoveredNode) return true;
      return source === hoveredNode || target === hoveredNode;
    },
    [hoveredNode],
  );

  // --- Click handling (single vs double) -----------------------------------
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleNodeClick = useCallback(
    (nodeId: string, isDangling: boolean) => {
      if (isDangling) return;
      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
        clickTimer.current = null;
        onDoubleClickNode(nodeId);
      } else {
        clickTimer.current = setTimeout(() => {
          clickTimer.current = null;
          onClickNode(nodeId);
        }, 250);
      }
    },
    [onClickNode, onDoubleClickNode],
  );

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <svg
        ref={svgRef}
        className="w-full h-full"
        onWheel={handleWheel}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        style={{ cursor: draggedNode ? 'grabbing' : panning ? 'grabbing' : 'grab' }}
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 6"
            refX="10"
            refY="3"
            markerWidth="8"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0,0 L10,3 L0,6" fill="var(--color-border)" opacity="0.5" />
          </marker>
          <marker
            id="arrow-highlight"
            viewBox="0 0 10 6"
            refX="10"
            refY="3"
            markerWidth="8"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0,0 L10,3 L0,6" fill="var(--color-foreground)" opacity="0.6" />
          </marker>
        </defs>

        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          {/* Edges */}
          {links.map((link, i) => {
            const s = link.source as SimNode;
            const t = link.target as SimNode;
            const sId = s.id;
            const tId = t.id;
            const highlighted = isEdgeHighlighted(sId, tId);
            const edgeActive = hoveredNode && highlighted;
            return (
              <g key={i}>
                <line
                  x1={s.x}
                  y1={s.y}
                  x2={t.x}
                  y2={t.y}
                  stroke={
                    edgeActive
                      ? 'var(--color-foreground)'
                      : link.dangling
                        ? '#9ca3af'
                        : 'var(--color-border)'
                  }
                  strokeWidth={edgeActive ? 1.5 : 1}
                  strokeDasharray={link.dangling ? '5 3' : undefined}
                  opacity={highlighted ? (link.dangling ? 0.5 : 0.6) : 0.08}
                  markerEnd={link.kind === 'cites' ? `url(#arrow${edgeActive ? '-highlight' : ''})` : undefined}
                  style={{ transition: 'opacity 0.2s' }}
                />
                {/* Edge label — visible on hover or always at high zoom */}
                {link.label && highlighted && transform.k > 0.6 && (
                  <text
                    x={(s.x! + t.x!) / 2}
                    y={(s.y! + t.y!) / 2 - 4}
                    textAnchor="middle"
                    style={{
                      fontSize: 8,
                      fill: edgeActive ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                      opacity: edgeActive ? 0.8 : 0.4,
                      pointerEvents: 'none',
                    }}
                  >
                    {link.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const r = nodeRadius(node.value);
            const isSeed = node.id === seed;
            const highlighted = isHighlighted(node.id);
            const isHovered = hoveredNode === node.id;
            const showLabel = transform.k > 0.5;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                onPointerDown={(e) => {
                  if (!node.isDangling) handleNodePointerDown(e, node.id);
                }}
                onPointerEnter={(e) => handleNodeHover(e, node)}
                onPointerLeave={(e) => handleNodeHover(e, null)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeClick(node.id, node.isDangling);
                }}
                style={{
                  cursor: node.isDangling ? 'default' : draggedNode === node.id ? 'grabbing' : 'pointer',
                  transition: 'opacity 0.2s',
                  opacity: highlighted ? 1 : 0.12,
                }}
              >
                {/* Glow on hover */}
                {isHovered && !node.isDangling && (
                  <circle
                    r={r + 5}
                    fill="none"
                    stroke={kindColor(node.kind)}
                    strokeWidth={2}
                    opacity={0.3}
                  />
                )}

                {/* Main circle */}
                <circle
                  r={r}
                  fill={kindColor(node.kind)}
                  opacity={node.isDangling ? 0.25 : 0.85}
                  stroke={
                    isSeed
                      ? 'var(--color-foreground)'
                      : node.isRepealed
                        ? '#ef4444'
                        : isHovered
                          ? 'var(--color-foreground)'
                          : 'rgba(255,255,255,0.2)'
                  }
                  strokeWidth={isSeed ? 3 : node.isRepealed ? 2.5 : isHovered ? 2 : 0.5}
                  strokeDasharray={node.isRepealed && !isSeed ? '4 2' : undefined}
                />

                {/* Repealed cross mark */}
                {node.isRepealed && (
                  <>
                    <line x1={-r * 0.5} y1={-r * 0.5} x2={r * 0.5} y2={r * 0.5} stroke="#ef4444" strokeWidth={2} />
                    <line x1={r * 0.5} y1={-r * 0.5} x2={-r * 0.5} y2={r * 0.5} stroke="#ef4444" strokeWidth={2} />
                  </>
                )}

                {/* Seed ring */}
                {isSeed && (
                  <circle
                    r={r + 3}
                    fill="none"
                    stroke="var(--color-foreground)"
                    strokeWidth={1.5}
                    strokeDasharray="3 2"
                    opacity={0.4}
                  />
                )}

                {/* Node label */}
                {showLabel && (
                  <text
                    y={r + 13}
                    textAnchor="middle"
                    style={{
                      fontSize: Math.max(9, Math.min(11, 10 / transform.k)),
                      fill: isHovered ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                      fontWeight: isHovered || isSeed ? 600 : 400,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  >
                    {node.label.length > 20 ? node.label.slice(0, 18) + '…' : node.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* HTML tooltip overlay */}
      {tooltip && !draggedNode && <GraphTooltip data={tooltip} />}

      {/* Controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        <button
          type="button"
          className="p-1.5 rounded-lg bg-card/90 backdrop-blur border border-border hover:bg-surface-low text-muted-foreground"
          onClick={zoomToFit}
          title="Fit to view"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          className="p-1.5 rounded-lg bg-card/90 backdrop-blur border border-border hover:bg-surface-low text-muted-foreground"
          onClick={() => setTransform((t) => ({ ...t, k: Math.min(5, t.k * 1.3) }))}
          title="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          className="p-1.5 rounded-lg bg-card/90 backdrop-blur border border-border hover:bg-surface-low text-muted-foreground"
          onClick={() => setTransform((t) => ({ ...t, k: Math.max(0.15, t.k / 1.3) }))}
          title="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Hint */}
      <div className="absolute top-3 left-3 text-[10px] text-muted-foreground/50 pointer-events-none select-none">
        Drag nodes · Scroll to zoom · Click to navigate
      </div>
    </div>
  );
}

// --- Graph search bar ------------------------------------------------------

function GraphSearchBar({ onSelect }: { onSelect: (nodeId: string) => void }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const ime = useNepaliIME(query, setQuery);

  const { data: hits } = useQuery({
    ...searchLegalResearchGraphOptions({ query: { q: query, limit: 12 } }),
    enabled: query.length >= 2,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showIME = ime.suggestions.length > 0 && ime.composing;
  const showHits = !showIME && open && hits && hits.length > 0;

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1">
        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e: any) => { ime.onChange(e); setOpen(true); }}
          onKeyDown={ime.onKeyDown as any}
          onFocus={() => { if (query.length >= 2) setOpen(true); }}
          placeholder={ime.enabled ? 'नेपालीमा खोज्नुहोस्…' : 'Search graph…'}
          className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-32"
        />
        <button
          type="button"
          onClick={ime.toggle}
          className={`px-1 py-0.5 rounded text-[9px] font-bold transition-colors ${
            ime.enabled
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-surface-low'
          }`}
          title={ime.enabled ? 'Switch to English' : 'Switch to Nepali'}
        >
          ने
        </button>
        {query && (
          <button type="button" onClick={() => { setQuery(''); setOpen(false); }} className="text-muted-foreground">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {showIME && (
        <div className="absolute top-full left-0 mt-1 min-w-[200px] max-w-[320px] rounded-lg border border-border bg-popover shadow-lg z-30 overflow-hidden">
          {ime.suggestions.map((s, i) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); ime.select(i); }}
              className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors ${
                i === ime.activeIndex ? 'bg-accent/10 text-foreground' : 'text-foreground hover:bg-surface-low'
              }`}
            >
              <span className="text-muted-foreground text-xs w-4 text-right shrink-0">{i + 1}</span>
              <span>{s}</span>
            </button>
          ))}
          <div className="px-3 py-1 text-[10px] text-muted-foreground border-t border-border bg-surface-low">
            {ime.composing} · ↑↓ navigate · 1-9 select · Space commit
          </div>
        </div>
      )}

      {showHits && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-64 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg z-20">
          {hits.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => { onSelect(h.id); setQuery(''); setOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-surface-low flex items-center gap-2 text-xs"
            >
              <span
                className="inline-block w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: kindColor(h.kind) }}
              />
              <span className="truncate flex-1 text-foreground">{h.label}</span>
              {h.detail && <span className="text-muted-foreground truncate max-w-[80px]">{h.detail}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main export -----------------------------------------------------------

interface CitationGraphProps {
  seed: string;
  onOpenDocument: (target: DocumentTarget) => void;
  onClose: () => void;
}

export function CitationGraph({ seed, onOpenDocument, onClose }: CitationGraphProps) {
  const [currentSeed, setCurrentSeed] = useState(seed);
  const [history, setHistory] = useState<string[]>([]);

  // Sync when the parent passes a new seed (e.g. opening graph from a different document)
  useEffect(() => {
    setCurrentSeed(seed);
    setHistory([]);
  }, [seed]);

  const subgraphQuery = useQuery({
    ...getLegalResearchSubgraphOptions({ query: { node: currentSeed } }),
    retry: false,
  });

  const kinds = useMemo(() => {
    if (!subgraphQuery.data) return [];
    const seen = new Set<string>();
    for (const n of subgraphQuery.data.nodes) {
      if (n.kind !== 'missing') seen.add(n.kind);
    }
    return Array.from(seen).sort();
  }, [subgraphQuery.data]);

  const navigateToSeed = useCallback(
    (newSeed: string) => {
      setHistory((h) => [...h, currentSeed]);
      setCurrentSeed(newSeed);
    },
    [currentSeed],
  );

  const goBack = useCallback(() => {
    const prev = history[history.length - 1];
    if (prev) {
      setHistory((h) => h.slice(0, -1));
      setCurrentSeed(prev);
    }
  }, [history]);

  const handleClick = useCallback(
    (nodeId: string) => {
      if (nodeId.startsWith('document:')) {
        const docId = parseInt(nodeId.split(':')[1], 10);
        onOpenDocument({ documentId: docId });
      } else {
        navigateToSeed(nodeId);
      }
    },
    [onOpenDocument, navigateToSeed],
  );

  const handleDoubleClick = useCallback(
    (nodeId: string) => {
      navigateToSeed(nodeId);
    },
    [navigateToSeed],
  );

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-card border-l border-border shadow-2xl flex flex-col pt-16 lg:pt-0">
      <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
        <div className="min-w-0 flex items-center gap-3">
          {history.length > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="p-1.5 rounded-lg hover:bg-surface-low text-muted-foreground shrink-0"
              title="Go back"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <div className="min-w-0">
            <h3 className="font-heading text-base font-semibold text-foreground">Citation graph</h3>
            <p className="mt-0.5 text-xs text-muted-foreground truncate">
              {subgraphQuery.data?.seed_label ?? currentSeed}
              {subgraphQuery.data && (
                <span className="ml-2 text-muted-foreground/60">
                  · {subgraphQuery.data.nodes.length} nodes · {subgraphQuery.data.edges.length} edges
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <GraphSearchBar onSelect={navigateToSeed} />
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-low text-muted-foreground"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        {subgraphQuery.isPending && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Loading graph…
            </p>
          </div>
        )}
        {subgraphQuery.isError && (
          <div className="flex items-center justify-center h-full px-6">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              Could not load the citation graph.
            </p>
          </div>
        )}
        {subgraphQuery.isSuccess && subgraphQuery.data.nodes.length > 0 && (
          <GraphCanvas
            rawNodes={subgraphQuery.data.nodes}
            rawEdges={subgraphQuery.data.edges}
            seed={currentSeed}
            onClickNode={handleClick}
            onDoubleClickNode={handleDoubleClick}
          />
        )}
        {subgraphQuery.isSuccess && subgraphQuery.data.nodes.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-muted-foreground">No connections found.</p>
          </div>
        )}
      </div>

      {subgraphQuery.data && (
        <>
          <GraphNotices
            truncated={subgraphQuery.data.truncated}
            suppressedHubs={subgraphQuery.data.suppressed_hubs}
          />
          {kinds.length > 0 && <GraphLegend kinds={kinds} />}
        </>
      )}
    </div>
  );
}
