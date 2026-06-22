import React, { useState } from 'react';
import { Search, BrainCircuit, Loader2, AlertTriangle, FileCheck, ArrowRight, Settings2 } from 'lucide-react';
import { RootCauseAnalysisResult } from '../types';
import { MOCK_RCA_RESPONSES } from '../lib/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';

export default function RCA() {
  const [tag, setTag] = useState('P-201');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RootCauseAnalysisResult | null>(null);

  const handleAnalyze = () => {
    if (!tag.trim()) return;
    setLoading(true);
    setResult(null);

    // Simulate Agent execution
    setTimeout(() => {
      const resp = MOCK_RCA_RESPONSES[tag.toUpperCase()];
      if (resp) {
        setResult(JSON.parse(resp));
      } else {
        // Fallback for demo
        setResult({
          equipmentTag: tag.toUpperCase(),
          issueDescription: 'No systemic patterns easily identifiable from historical logs.',
          likelyCauses: [
            { cause: 'Unknown operational stress.', probability: 0.3, supportingEvidence: [] }
          ],
          recommendedActions: ['Perform manual inspection.', 'Review SCADA logs.']
        });
      }
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
          <BrainCircuit className="w-8 h-8 text-blue-600" />
          1-Click Root Cause Analysis
        </h1>
        <p className="text-slate-600 mt-2">
          Agentic AI correlates work history, P&IDs, and manuals to expose systemic failure patterns instantly.
        </p>
      </header>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 md:p-6 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Target Equipment Tag</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all uppercase font-mono shadow-sm"
              placeholder="e.g. P-201"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading || !tag}
          className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? (
             <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Graph...</>
          ) : (
            <><Settings2 className="w-5 h-5" /> Generate RCA</>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            {/* Overview Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                <div>
                  <div className="text-[10px] text-blue-600 uppercase tracking-widest font-bold">Analysis Complete</div>
                  <h2 className="text-xl font-bold text-slate-900 font-mono mt-1">Tag: {result.equipmentTag}</h2>
                </div>
                <div className="flex gap-2">
                   <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-[10px] uppercase tracking-wider text-slate-600 font-bold">Graph Synthesized</span>
                   <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md text-[10px] uppercase tracking-wider font-bold">92% Confidence</span>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-[10px] font-bold tracking-widest text-slate-500 mb-2 uppercase">Identified Pattern</h3>
                <p className="text-lg text-slate-800 leading-relaxed font-medium">
                  {result.issueDescription}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Top Correlated Root Causes</h3>
                {result.likelyCauses.map((cause, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col md:flex-row gap-4">
                    <div className="hidden md:flex flex-col items-center justify-center min-w-[80px] bg-white border border-slate-200 shadow-sm rounded-lg p-2">
                       <span className="text-2xl font-bold text-blue-600">{Math.round(cause.probability * 100)}%</span>
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center mt-1">Likelihood</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 md:hidden">
                        <span className="text-lg font-bold text-blue-600">{Math.round(cause.probability * 100)}%</span>
                        <span className="text-xs text-slate-500 font-bold uppercase">Likelihood</span>
                      </div>
                      <p className="text-slate-800 font-medium mb-3">{cause.cause}</p>
                      
                      {cause.supportingEvidence.length > 0 && (
                        <div className="space-y-2 mt-2 pt-2 border-t border-slate-200">
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Evidence Graph Traversal:</p>
                          {cause.supportingEvidence.map(ev => (
                            <div key={ev.id} className="flex items-start gap-2 text-sm bg-white border border-slate-200 shadow-sm p-2.5 rounded-lg">
                              <FileCheck className={cn(
                                "w-4 h-4 mt-0.5 shrink-0",
                                ev.type === 'manual' ? 'text-blue-500' : 'text-pink-500'
                              )} />
                              <div>
                                <span className="font-bold text-slate-700 text-xs mr-2">{ev.source}:</span>
                                <span className="text-slate-600 italic text-xs">{ev.snippet}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-700 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Recommended Engineer Actions
              </h3>
              <ul className="space-y-3">
                {result.recommendedActions.map((act, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-800 bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <span className="font-medium text-sm">{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
