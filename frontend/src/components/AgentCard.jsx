import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const AgentCard = ({ title, role, icon: Icon, description, techTag, status = "Scaffolded" }) => {
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all group flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 rounded-lg bg-slate-800/80 text-sky-400 group-hover:bg-sky-500/10 transition-colors">
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300">
            {status}
          </span>
        </div>
        <h3 className="text-base font-semibold text-white mb-1 group-hover:text-sky-300 transition-colors">
          {title}
        </h3>
        <p className="text-xs font-medium text-sky-400/90 mb-2">{role}</p>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          {description}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="font-mono text-[11px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
          {techTag}
        </span>
        <span className="text-slate-500 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70" /> Ready
        </span>
      </div>
    </div>
  );
};
