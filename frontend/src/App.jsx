import React from 'react';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { useHealthCheck } from './hooks/useHealthCheck';

export function App() {
  const { backendStatus, aiStatus, refetch } = useHealthCheck();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header 
        backendStatus={backendStatus} 
        aiStatus={aiStatus} 
        onRefresh={refetch} 
      />
      <main className="flex-1">
        <Dashboard 
          backendStatus={backendStatus} 
          aiStatus={aiStatus} 
          onRefresh={refetch} 
        />
      </main>
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>AI-Powered Early Warning & Decision Intelligence System for Banking &bull; 24-Hour Hackathon Starter</p>
      </footer>
    </div>
  );
}

export default App;
