import React, { useState } from 'react';
import { LayoutDashboard, PlayCircle, FileInput, Activity, Cpu } from 'lucide-react';
import { Generator } from './features/Generator';
import { Scheduler } from './features/Scheduler';
import { Analysis } from './features/Analysis';
import { Process, AlgorithmType } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'scheduler' | 'analysis'>('generator');
  const [processes, setProcesses] = useState<Process[]>([]);
  const [lastRunData, setLastRunData] = useState<{processes: Process[], algorithm: AlgorithmType} | null>(null);

  const handleGenerate = (data: Process[]) => {
    setProcesses(data);
    setActiveTab('scheduler');
  };

  const handleSimulationComplete = (finalProcesses: Process[], steps: any, algo: AlgorithmType) => {
    setLastRunData({ processes: finalProcesses, algorithm: algo });
  };

  return (
    <div className="h-screen bg-bg text-navy font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-20 bg-surface border-b border-input px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center shadow-lg">
            <Cpu className="text-purple w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-navy">OS Scheduler<span className="text-purple">.sim</span></h1>
            <p className="text-[10px] text-navy/40 font-bold uppercase tracking-widest">Interactive Dashboard</p>
          </div>
        </div>

        <nav className="flex items-center bg-input/30 p-1.5 rounded-full">
          <TabButton 
            active={activeTab === 'generator'} 
            onClick={() => setActiveTab('generator')} 
            icon={<FileInput size={18} />} 
            label="Generator" 
          />
          <TabButton 
            active={activeTab === 'scheduler'} 
            onClick={() => setActiveTab('scheduler')} 
            icon={<PlayCircle size={18} />} 
            label="Scheduler" 
          />
          <TabButton 
            active={activeTab === 'analysis'} 
            onClick={() => setActiveTab('analysis')} 
            icon={<LayoutDashboard size={18} />} 
            label="Analysis" 
          />
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-hidden">
        {activeTab === 'generator' && (
          <div className="h-full overflow-y-auto">
             <Generator onGenerate={handleGenerate} />
          </div>
        )}
        
        {activeTab === 'scheduler' && (
          <div className="h-full">
            <Scheduler 
              initialProcesses={processes} 
              onSimulationComplete={handleSimulationComplete} 
            />
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="h-full">
            <Analysis lastRun={lastRunData} />
          </div>
        )}
      </main>
    </div>
  );
}

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
      active 
        ? 'bg-navy text-white shadow-lg' 
        : 'text-navy/50 hover:text-navy hover:bg-white'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default App;