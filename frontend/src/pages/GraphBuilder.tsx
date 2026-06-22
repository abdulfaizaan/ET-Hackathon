import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MOCK_GRAPH } from '../lib/mockData';
import { GraphNode, GraphEdge } from '../types';
import { FileSearch, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { cn } from '../lib/utils';

export default function GraphBuilder() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .call(d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 4]).on('zoom', (event) => {
        g.attr('transform', event.transform);
      }));

    const g = svg.append('g');

    // Make deep copies as D3 modifies objects
    const nodes = MOCK_GRAPH.nodes.map(d => ({ ...d }));
    const links = MOCK_GRAPH.links.map(d => ({ ...d }));

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(50));

    // Colors per group
    const color = d3.scaleOrdinal<number, string>()
      .domain([1, 2, 3, 4, 5])
      .range(['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444']);

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', d => Math.sqrt(d.value) * 1.5);

    const linkLabels = g.append('g')
      .selectAll('text')
      .data(links)
      .join('text')
      .attr('fill', '#64748b')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .attr('text-anchor', 'middle')
      .text(d => d.label);

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    node.append('circle')
      .attr('r', 24)
      .attr('fill', (d: any) => color(d.group))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 3)
      .attr('class', 'shadow-md')
      .on('click', (event, d: any) => {
        setSelectedNode(d);
      });

    node.append('text')
      .attr('dx', 30)
      .attr('dy', 4)
      .text((d: any) => d.label)
      .attr('fill', '#0f172a')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('font-family', 'sans-serif');

    // Add icons based on type
    node.append('text')
      .attr('font-family', 'FontAwesome, sans-serif') // Fallback symbol
      .attr('font-size', '14px')
      .attr('text-anchor', 'middle')
      .attr('dy', '5px')
      .attr('fill', '#fff')
      .text((d: any) => {
        if (d.type === 'equipment') return '⛭';
        if (d.type === 'document') return '📄';
        if (d.type === 'work_order') return '📋';
        if (d.type === 'regulation') return '⚠';
        return '💡';
      });

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkLabels
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2 - 5)
        .attr('transform', (d: any) => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          // Keep text upright
          return `rotate(${angle > 90 || angle < -90 ? angle + 180 : angle}, ${(d.source.x + d.target.x) / 2}, ${(d.source.y + d.target.y) / 2})`;
        });

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col pt-4 md:pt-8 md:px-8 bg-slate-50">
      <header className="px-4 md:px-0 mb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Graph Explorer
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Visualizing semantic links between equipment, documents, and concepts.
          </p>
        </div>
      </header>

      <div className="flex-1 relative bg-white border border-slate-200 md:rounded-2xl overflow-hidden shadow-sm" ref={containerRef}>
        {/* Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white/90 p-2 rounded-lg backdrop-blur-sm border border-slate-200 z-10 shadow-sm">
          <button className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"><ZoomIn className="w-4 h-4" /></button>
          <button className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"><ZoomOut className="w-4 h-4" /></button>
          <button className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"><Maximize className="w-4 h-4" /></button>
        </div>

        {/* Legend Overlay */}
        <div className="hidden sm:block absolute top-4 left-4 bg-white/90 p-3 rounded-lg backdrop-blur-sm border border-slate-200 z-10 min-w-[140px] shadow-sm">
          <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Node Types</div>
          <div className="flex flex-col gap-1.5">
            <LegendItem color="bg-emerald-500" label="Equipment" />
            <LegendItem color="bg-blue-500" label="Document" />
            <LegendItem color="bg-amber-500" label="Work Order" />
            <LegendItem color="bg-indigo-500" label="Regulation" />
            <LegendItem color="bg-red-500" label="Concept/Issue" />
          </div>
        </div>

        {/* Node inspector panel */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:min-w-80 bg-white border border-slate-200 p-4 rounded-xl shadow-lg z-20 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-slate-900 text-lg">{selectedNode.label}</h3>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-900 text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-700 mb-4 inline-block px-2 py-0.5 bg-blue-50 border border-blue-100 rounded">
              Type: {selectedNode.type}
            </div>
            
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
              <FileSearch className="w-4 h-4" /> View Underlying Data
            </button>
          </div>
        )}

        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
      <div className={cn("w-3 h-3 rounded-full shadow-inner", color)} />
      {label}
    </div>
  );
}
