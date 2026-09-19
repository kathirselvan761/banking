import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Cpu,
  Layers,
  Bot,
  Sliders,
  CreditCard,
  MessageSquareWarning,
} from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    {
      to: '/dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/customers',
      label: 'Customer Risk',
      icon: Users,
      badge: null,
    },
    {
      to: '/explainability',
      label: 'SHAP Explainability',
      icon: Cpu,
      badge: 'XAI',
    },
    {
      to: '/recurring-issues',
      label: 'Recurring Issues',
      icon: Layers,
      badge: 'SBERT',
    },
    {
      to: '/alerts',
      label: 'Risk Alerts',
      icon: ShieldAlert,
      badge: 'LIVE',
    },
    {
      to: '/investigation',
      label: 'Agent Investigation',
      icon: Bot,
      badge: 'LOOP',
    },
    {
      to: '/what-if',
      label: 'What-If Simulator',
      icon: Sliders,
      badge: null,
    },
    {
      to: '/transactions',
      label: 'Transactions & Anomaly',
      icon: CreditCard,
      badge: null,
    },
    {
      to: '/complaints',
      label: 'Complaints & NLP',
      icon: MessageSquareWarning,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between border-r border-slate-800/80 bg-slate-950/60 p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Intelligence Architecture
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Orchestration</span>
          <span className="text-emerald-400 font-mono font-bold">FastAPI</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Agent Framework</span>
          <span className="text-sky-400 font-mono font-bold">LangGraph</span>
        </div>
        <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
          Decision Intelligence &bull; Human Final Approval
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
