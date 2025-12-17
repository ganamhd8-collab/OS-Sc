import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Layers, Clock, Zap, Plus, Trash2, Shuffle, Grid } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { GeneratorConfig, Process } from '../types';
import { generateNormal, generatePoisson, getProcessColor } from '../utils/math';

interface GeneratorProps {
  onGenerate: (processes: Process[]) => void;
}

export const Generator: React.FC<GeneratorProps> = ({ onGenerate }) => {
  const [mode, setMode] = useState<'random' | 'manual'>('random');
  const [focusedRowId, setFocusedRowId] = useState<number | null>(null);

  // Random Configuration State
  const [config, setConfig] = useState<GeneratorConfig>({
    count: 10,
    arrivalMean: 5,
    arrivalSd: 2,
    burstMean: 8,
    burstSd: 3,
    priorityLambda: 3
  });

  // Manual Input State
  const [manualProcesses, setManualProcesses] = useState<Process[]>([
    {
      id: 1,
      arrivalTime: 0,
      burstTime: 5,
      priority: 2,
      color: getProcessColor(1),
      remainingTime: 5,
      startTime: null,
      finishTime: null,
      waitingTime: 0,
      turnaroundTime: 0,
      queueLevel: 1
    }
  ]);

  const [previewData, setPreviewData] = useState<Process[]>([]);

  // Update preview when manual processes change
  useEffect(() => {
    if (mode === 'manual') {
      setPreviewData(manualProcesses);
    }
  }, [manualProcesses, mode]);

  const generateRandomData = () => {
    const newProcesses: Process[] = [];
    for (let i = 0; i < config.count; i++) {
      newProcesses.push({
        id: i + 1,
        arrivalTime: Math.max(0, generateNormal(config.arrivalMean, config.arrivalSd)),
        burstTime: Math.max(1, generateNormal(config.burstMean, config.burstSd)),
        priority: Math.max(1, generatePoisson(config.priorityLambda)),
        color: getProcessColor(i + 1),
        remainingTime: 0,
        startTime: null,
        finishTime: null,
        waitingTime: 0,
        turnaroundTime: 0,
        queueLevel: 1 
      });
    }
    // Correct remainingTime
    newProcesses.forEach(p => p.remainingTime = p.burstTime);
    // Sort by arrival initially
    newProcesses.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    setPreviewData(newProcesses);
    return newProcesses;
  };

  const handleGenerate = () => {
    if (mode === 'random') {
      const data = generateRandomData();
      onGenerate(data);
    } else {
      // For manual, just sort by arrival time before sending
      const sorted = [...manualProcesses].sort((a, b) => a.arrivalTime - b.arrivalTime);
      onGenerate(sorted);
    }
  };

  // Manual Mode Handlers
  const addManualRow = () => {
    const nextId = manualProcesses.length + 1;
    const newProcess: Process = {
      id: nextId,
      arrivalTime: 0,
      burstTime: 1,
      priority: 1,
      color: getProcessColor(nextId),
      remainingTime: 1,
      startTime: null,
      finishTime: null,
      waitingTime: 0,
      turnaroundTime: 0,
      queueLevel: 1
    };
    setManualProcesses([...manualProcesses, newProcess]);
  };

  const updateManualRow = (id: number, field: keyof Process, value: number) => {
    setManualProcesses(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, [field]: value };
        if (field === 'burstTime') {
          updated.remainingTime = value;
        }
        return updated;
      }
      return p;
    }));
  };

  const deleteManualRow = (id: number) => {
    const filtered = manualProcesses.filter(p => p.id !== id);
    // Re-index to keep IDs sequential visually
    const reindexed = filtered.map((p, index) => ({
      ...p,
      id: index + 1,
      color: getProcessColor(index + 1)
    }));
    setManualProcesses(reindexed);
  };

  return (
    <div className="h-full flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header & Mode Switch */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-navy tracking-tight">Process Generator</h2>
          <p className="text-navy/50">Create processes via random distribution or manual entry.</p>
        </div>

        <div className="bg-white p-1 rounded-full shadow-sm border border-input flex">
          <button
            onClick={() => { setMode('random'); setPreviewData([]); }}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${
              mode === 'random' ? 'bg-purple text-white shadow-md' : 'text-navy/50 hover:text-navy'
            }`}
          >
            <Shuffle size={16} />
            Random
          </button>
          <button
             onClick={() => { setMode('manual'); setPreviewData(manualProcesses); }}
             className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${
              mode === 'manual' ? 'bg-purple text-white shadow-md' : 'text-navy/50 hover:text-navy'
            }`}
          >
            <Grid size={16} />
            Manual
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        
        {/* INPUT SECTION (LEFT) */}
        <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2">
            
          {mode === 'random' ? (
            <>
              {/* Random: General */}
              <div className="bg-surface p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple/10 rounded-lg text-purple">
                    <Layers size={20} />
                  </div>
                  <h3 className="font-bold text-navy">General Settings</h3>
                </div>
                <Input 
                  label="Process Count" 
                  type="number" 
                  value={config.count}
                  onChange={(e) => setConfig({...config, count: parseInt(e.target.value) || 0})}
                />
                <div className="mt-4">
                   <Input 
                    label="Priority Lambda" 
                    subLabel="Poisson Dist."
                    type="number" 
                    value={config.priorityLambda}
                    onChange={(e) => setConfig({...config, priorityLambda: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              {/* Random: Arrival */}
              <div className="bg-surface p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-white">
                 <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-softBlue/20 rounded-lg text-blue-500">
                    <Clock size={20} />
                  </div>
                  <h3 className="font-bold text-navy">Arrival Time</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Mean" 
                    type="number" 
                    value={config.arrivalMean}
                    onChange={(e) => setConfig({...config, arrivalMean: parseFloat(e.target.value) || 0})}
                  />
                  <Input 
                    label="Std Dev" 
                    type="number" 
                    value={config.arrivalSd}
                    onChange={(e) => setConfig({...config, arrivalSd: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

               {/* Random: Burst */}
               <div className="bg-surface p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-white">
                 <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-500">
                    <Zap size={20} />
                  </div>
                  <h3 className="font-bold text-navy">Burst Time</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Mean" 
                    type="number" 
                    value={config.burstMean}
                    onChange={(e) => setConfig({...config, burstMean: parseFloat(e.target.value) || 0})}
                  />
                  <Input 
                    label="Std Dev" 
                    type="number" 
                    value={config.burstSd}
                    onChange={(e) => setConfig({...config, burstSd: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
            </>
          ) : (
            /* Manual Instructions / Legend */
             <div className="bg-navy p-8 rounded-3xl shadow-lg text-white flex flex-col justify-between h-full min-h-[300px] relative overflow-hidden">
                <div className="relative z-10">
                   <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                      <Grid size={32} className="text-softBlue" />
                   </div>
                   <h3 className="text-2xl font-bold mb-4">Manual Input Mode</h3>
                   <p className="text-white/60 leading-relaxed mb-6">
                     Define your own test cases by manually entering the arrival time, burst time, and priority for each process.
                   </p>
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-purple flex items-center justify-center text-xs font-bold">1</div>
                         <span className="text-sm font-medium">Add rows using the button below</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-softBlue text-navy flex items-center justify-center text-xs font-bold">2</div>
                         <span className="text-sm font-medium">Click cells to edit values</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">3</div>
                         <span className="text-sm font-medium">Generate to run simulation</span>
                      </div>
                   </div>
                </div>
                
                {/* Decoration */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple rounded-full blur-3xl opacity-20 pointer-events-none"></div>
                <div className="absolute top-10 -right-10 w-32 h-32 bg-softBlue rounded-full blur-2xl opacity-10 pointer-events-none"></div>
             </div>
          )}
        </div>

        {/* DATA DISPLAY / EDIT SECTION (RIGHT) */}
        <div className="lg:col-span-2 flex flex-col bg-surface rounded-3xl shadow-sm border border-white overflow-hidden relative">
          
          {/* Section Header */}
          <div className="p-6 border-b border-input flex justify-between items-center bg-white sticky top-0 z-20">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
              {mode === 'random' ? <Save className="w-5 h-5 text-purple" /> : <Grid className="w-5 h-5 text-purple" />}
              {mode === 'random' ? 'Generated Preview' : 'Input Table'}
            </h2>
            <div className="flex items-center gap-4">
              <span className="bg-input text-navy px-3 py-1 rounded-full text-xs font-mono font-bold">
                {previewData.length} PROCESSES
              </span>
              <Button onClick={handleGenerate} size="md" icon={<RefreshCw size={18} />}>
                Generate & Save
              </Button>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-[#FAFAFC] relative">
            {mode === 'random' ? (
              // Random Preview List
              <div className="p-4 space-y-3">
                {previewData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-navy/30 py-20">
                    <Settings className="w-16 h-16 mb-4 opacity-20" />
                    <p>Click Generate to create random data.</p>
                  </div>
                ) : (
                  previewData.map((p) => (
                    <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-black/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: p.color }}>
                          P{p.id}
                        </div>
                        <div>
                          <div className="text-xs text-navy/40 font-bold uppercase tracking-wider">Arrival</div>
                          <div className="font-mono text-navy font-bold">{p.arrivalTime}</div>
                        </div>
                        <div className="w-px h-8 bg-input mx-2"></div>
                        <div>
                           <div className="text-xs text-navy/40 font-bold uppercase tracking-wider">Burst</div>
                           <div className="font-mono text-navy font-bold">{p.burstTime}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                            <div className="text-xs text-navy/40 font-bold uppercase tracking-wider">Priority</div>
                            <div className="font-mono text-navy font-bold">{p.priority}</div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(Math.min(5, p.priority))].map((_, i) => (
                            <div key={i} className="w-1.5 h-6 rounded-full bg-softBlue"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Manual Input Table
              <div className="min-w-full inline-block align-middle">
                 <table className="min-w-full">
                    <thead className="bg-navy sticky top-0 z-10 shadow-md">
                       <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-20">ID</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Arrival Time</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Burst Time</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Priority</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider w-20">Action</th>
                       </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-input">
                       {manualProcesses.map((p) => (
                          <tr 
                            key={p.id} 
                            className={`transition-colors ${focusedRowId === p.id ? 'bg-[#ACD1FD]/20' : 'bg-white hover:bg-bg'}`}
                            onClick={() => setFocusedRowId(p.id)}
                          >
                             <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-white text-xs" style={{ backgroundColor: p.color }}>
                                   P{p.id}
                                </div>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                                <input 
                                  type="number" 
                                  min="0"
                                  value={p.arrivalTime}
                                  onChange={(e) => updateManualRow(p.id, 'arrivalTime', parseInt(e.target.value) || 0)}
                                  className="w-full bg-input/50 border-none rounded-lg px-3 py-2 text-sm font-mono font-bold text-navy focus:ring-2 focus:ring-purple focus:bg-white transition-all"
                                />
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                                <input 
                                  type="number" 
                                  min="1"
                                  value={p.burstTime}
                                  onChange={(e) => updateManualRow(p.id, 'burstTime', Math.max(1, parseInt(e.target.value) || 1))}
                                  className="w-full bg-input/50 border-none rounded-lg px-3 py-2 text-sm font-mono font-bold text-navy focus:ring-2 focus:ring-purple focus:bg-white transition-all"
                                />
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                                <input 
                                  type="number" 
                                  min="1"
                                  value={p.priority}
                                  onChange={(e) => updateManualRow(p.id, 'priority', Math.max(1, parseInt(e.target.value) || 1))}
                                  className="w-full bg-input/50 border-none rounded-lg px-3 py-2 text-sm font-mono font-bold text-navy focus:ring-2 focus:ring-purple focus:bg-white transition-all"
                                />
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteManualRow(p.id); }}
                                  className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                                  title="Delete Process"
                                >
                                   <Trash2 size={18} />
                                </button>
                             </td>
                          </tr>
                       ))}
                       {/* Add Row Button Row */}
                       <tr>
                          <td colSpan={5} className="px-6 py-4 bg-bg/50 border-dashed border-2 border-input m-4">
                             <button 
                                onClick={addManualRow}
                                className="w-full flex items-center justify-center gap-2 py-3 text-navy/60 font-bold hover:text-purple hover:bg-purple/5 rounded-xl transition-all border border-transparent hover:border-purple/20"
                             >
                                <Plus size={20} />
                                Add Process Row
                             </button>
                          </td>
                       </tr>
                    </tbody>
                 </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};