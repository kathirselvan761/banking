import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  CreditCard,
  MessageSquareWarning,
  Cpu,
  HelpCircle,
} from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    {
      to: '/dashboard',
      label: 'Risk Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/customers',
      label: 'Customer Directory',
      icon: Users,
      badge: null,
    },
    {
      to: '/alerts',
      label: 'High-Risk Alerts',
      icon: ShieldAlert,
      badge: 'LIVE',
    },
    {
      to: '/transactions',
      label: 'Transactions & Outliers',
      icon: CreditCard,
      badge: null,
    },
    {
      to: '/complaints',
      label: 'Grievance Intelligence',
      icon: MessageSquareWarning,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between border-r border-slate-800/80 bg-slate-950/60 p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Portfolio Navigation
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30 shadow-sm shadow-sky-950/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* AI Engine Status Card */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>AI Intelligence Stack</span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Risk Scoring:</span>
              <span className="text-sky-300">XGBoost</span>
            </div>
            <div className="flex justify-between">
              <span>Explainability:</span>
              <span className="text-indigo-300">TreeSHAP</span>
            </div>
            <div className="flex justify-between">
              <span>Sentiment:</span>
              <span className="text-pink-300">FinBERT</span>
            </div>
            <div className="flex justify-between">
              <span>Anomalies:</span>
              <span className="text-purple-300">IsoForest</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer information */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span>Telemetry Protocol:</span>
          <span className="text-slate-300 font-mono">v2.4.0</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Decision Intelligence Early Warning System
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
