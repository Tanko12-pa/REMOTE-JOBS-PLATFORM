import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GitMerge, Layers, Award, TrendingUp } from 'lucide-react';
import { JOB_CATEGORIES } from '../data/platformsData';
import { JobCategory } from '../types';

export const JobCategoriesD3RoadmapView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<JobCategory>(JOB_CATEGORIES[0]);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous SVG contents
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 640;
    const height = 360;

    // Create D3 Hierarchical tree data structure
    const treeData = {
      name: selectedCategory.name,
      level: 'Root',
      children: selectedCategory.careerLevels.map((lvl) => ({
        name: lvl.title,
        level: lvl.level,
        pay: lvl.avgPay,
        desc: lvl.description,
      })),
    };

    const root = d3.hierarchy(treeData);
    const treeLayout = d3.tree().size([height - 60, width - 200]);
    treeLayout(root);

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', 'translate(80, 30)');

    // Links (Connections)
    svg
      .selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr(
        'd',
        d3
          .linkHorizontal()
          .x((d: any) => d.y)
          .y((d: any) => d.x) as any
      )
      .attr('fill', 'none')
      .attr('stroke', '#006400')
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', '4,4');

    // Nodes
    const nodes = svg
      .selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    // Node Circles
    nodes
      .append('circle')
      .attr('r', (d: any) => (d.depth === 0 ? 10 : 8))
      .attr('fill', (d: any) => (d.depth === 0 ? '#FFD700' : '#006400'))
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2);

    // Node Labels
    nodes
      .append('text')
      .attr('dy', '0.31em')
      .attr('x', (d: any) => (d.children ? -14 : 14))
      .attr('text-anchor', (d: any) => (d.children ? 'end' : 'start'))
      .text((d: any) => d.data.name)
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#064E3B');

    // Pay labels
    nodes
      .append('text')
      .attr('dy', '1.6em')
      .attr('x', (d: any) => (d.children ? -14 : 14))
      .attr('text-anchor', (d: any) => (d.children ? 'end' : 'start'))
      .text((d: any) => (d.data.pay ? `💰 ${d.data.pay}` : ''))
      .attr('font-size', '9px')
      .attr('fill', '#D97706')
      .attr('font-weight', 'semibold');
  }, [selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-2xl p-6 border border-amber-400/30 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-2 border border-amber-400/30">
              <GitMerge className="w-3.5 h-3.5" />
              D3 Interactive Career Path Engine
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Visual Career Path Roadmap
            </h2>
            <p className="text-xs text-emerald-200 mt-1 max-w-xl">
              Explore step-by-step career progression from entry-level to lead remote roles rendered via D3 tree diagrams.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory.id}
              onChange={(e) => {
                const found = JOB_CATEGORIES.find((c) => c.id === e.target.value);
                if (found) setSelectedCategory(found);
              }}
              id="roadmap-category-selector"
              className="px-4 py-2.5 rounded-xl bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-md border border-amber-300 cursor-pointer"
            >
              {JOB_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* D3 Diagram Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            D3 Progression Tree: {selectedCategory.name}
          </h3>
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 rounded-full">
            Avg Field Range: {selectedCategory.avgSalaryRange}
          </span>
        </div>

        {/* SVG Container */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <svg ref={svgRef} className="w-full h-auto min-w-[500px]" />
        </div>

        {/* Levels Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
          {selectedCategory.careerLevels.map((lvl, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {lvl.level}
                </span>
                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                  {lvl.avgPay}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{lvl.title}</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                {lvl.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
