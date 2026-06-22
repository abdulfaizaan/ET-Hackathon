import React from 'react';
import { Activity, AlertTriangle, CheckCircle2, ChevronRight, FileText, Settings, Webhook } from 'lucide-react';
import { MOCK_EQUIPMENT } from '../lib/mockData';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Plant Operations Overview
        </h1>
        <p className="text-slate-600 mt-2">Connecting the unconnected. Real-time insights powered by GraphRAG.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <StatCard title="Active Anomalies" value="3" icon={AlertTriangle} bg="bg-red-50 text-red-600 border border-red-100" color="text-red-600" />
        <StatCard title="Knowledge Nodes Map" value="1,245" icon={Webhook} bg="bg-blue-50 text-blue-600 border border-blue-100" color="text-blue-600" />
        <StatCard title="Documents Handled" value="84" icon={FileText} bg="bg-green-50 text-green-700 border border-green-100" color="text-green-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipment Status */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-500" />
            Equipment Status
          </h2>
          <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-3 font-bold">Tag</th>
                  <th className="pb-3 font-bold">Name</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold hidden md:table-cell">Last Maintenance</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_EQUIPMENT.map((eq, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={eq.tag} 
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 font-mono text-sm font-bold text-slate-700">{eq.tag}</td>
                    <td className="py-4 font-medium text-slate-800">{eq.name}</td>
                    <td className="py-4">
                      <StatusBadge status={eq.status} />
                    </td>
                    <td className="py-4 text-sm text-slate-500 hidden md:table-cell">{eq.lastMaintenance}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Copilot Shortcut */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
               onClick={() => navigate('/rca')}>
            <div className="absolute inset-0 bg-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col h-full items-start">
              <div className="p-3 bg-blue-100 rounded-xl mb-4 text-blue-600">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Perform Fast RCA</h3>
              <p className="text-slate-600 text-sm mb-4">Identify systemic failure patterns instantly using Graph-based insights.</p>
              <div className="mt-auto flex items-center text-blue-600 text-sm font-bold">
                Run Analysis <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 cursor-pointer group hover:border-blue-500 hover:shadow-md transition-all"
               onClick={() => navigate('/copilot')}>
            <h3 className="text-slate-900 font-bold mb-1">Field Tech Copilot</h3>
            <p className="text-slate-600 text-sm">Ask maintenance questions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, bg, color }: { title: string, value: string, icon: any, bg: string, color: string }) {
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex items-center gap-4">
      <div className={cn("p-4 rounded-xl", bg)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs = {
    operational: { icon: CheckCircle2, cls: 'bg-green-50 text-green-700 border-green-200', text: 'Operational' },
    warning: { icon: AlertTriangle, cls: 'bg-red-50 text-red-600 border-red-200', text: 'Warning' },
    critical: { icon: AlertTriangle, cls: 'bg-red-100 text-red-700 border-red-300 font-bold', text: 'Critical' },
    offline: { icon: Activity, cls: 'bg-slate-100 text-slate-600 border-slate-200', text: 'Offline' }
  };
  
  const config = configs[status as keyof typeof configs] || configs.offline;
  const Icon = config.icon;

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] uppercase font-bold tracking-wider", config.cls)}>
      <Icon className="w-3.5 h-3.5" />
      {config.text}
    </span>
  );
}
