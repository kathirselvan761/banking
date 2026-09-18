import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-white">
        {/* Top Navigation */}
        <Navbar />

        {/* Dashboard Shell with Sidebar and Main Viewport */}
        <div className="flex flex-1 w-full">
          <Sidebar />

          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <AppRoutes />
          </main>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/60 py-4 px-6 text-center text-xs text-slate-500">
          <p>
            Banking AI Early Warning & Delinquency Prevention System &bull; Production Prototype
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
