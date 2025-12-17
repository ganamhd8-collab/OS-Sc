import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Layers, Cpu, FastForward } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { AlgorithmType, Process, SimulationStep } from '../types';

interface SchedulerProps {
  initialProcesses: Process[];
  onSimulationComplete: (processes: Process[], steps: SimulationStep[], algo: AlgorithmType) => void;
}

export const Scheduler: React.FC<SchedulerProps> = ({ initialProcesses, onSimulationComplete }) => {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>(AlgorithmType.HPF);
  const [timeQuantum, setTimeQuantum] = useState<number>(2);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<SimulationStep[]>([]);
  const [activeProcessId, setActiveProcessId] = useState<number | null>(null);
  
  // Multilevel Specific State
  const [readyQueueL1, setReadyQueueL1] = useState<Process[]>([]); // Foreground (Purple)
  const [readyQueueL2, setReadyQueueL2] = useState<Process[]>([]); // Background (Blue)
  const [generalReadyQueue, setGeneralReadyQueue] = useState<Process[]>([]);

  const [isComplete, setIsComplete] = useState(false);

  // Initialize
  useEffect(() => {
    resetSimulation();
  }, [initialProcesses]);

  const resetSimulation = () => {
    const deepCopy = initialProcesses.map(p => ({ 
      ...p, 
      remainingTime: p.burstTime, 
      waitingTime: 0, 
      turnaroundTime: 0, 
      startTime: null, 
      finishTime: null 
    }));
    setProcesses(deepCopy);
    setCurrentTime(0);
    setSteps([]);
    setIsRunning(false);
    setActiveProcessId(null);
    setGeneralReadyQueue([]);
    setReadyQueueL1([]);
    setReadyQueueL2([]);
    setIsComplete(false);
  };

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && !isComplete) {
      interval = setInterval(() => {
        tick();
      }, 500); 
    }
    return () => clearInterval(interval);
  }, [isRunning, isComplete, currentTime, processes, activeProcessId]);


  const tick = () => {
    let nextProcesses = [...processes];
    let nextActiveId = activeProcessId;
    let nextSteps = [...steps];
    let stepTime = currentTime;

    const available = nextProcesses.filter(p => p.arrivalTime <= stepTime && p.remainingTime > 0);
    let selected: Process | null = null;

    if (algorithm === AlgorithmType.MLQ) {
        // MLQ Logic: Q1 (Priority >= 5) > Q2 (Priority < 5)
        const q1 = available.filter(p => p.priority >= 5);
        const q2 = available.filter(p => p.priority < 5);

        // Update visual queues state
        // We only show processes waiting, not the one currently running
        setReadyQueueL1(q1.filter(p => p.id !== nextActiveId));
        setReadyQueueL2(q2.filter(p => p.id !== nextActiveId));
        setGeneralReadyQueue([]);

        // Priority Logic
        if (q1.length > 0) {
             // Simplify: FCFS within Q1 for demo
             selected = q1.reduce((prev, curr) => (prev.arrivalTime < curr.arrivalTime ? prev : curr));
        } else if (q2.length > 0) {
             selected = q2.reduce((prev, curr) => (prev.arrivalTime < curr.arrivalTime ? prev : curr));
        }

    } else {
        // Standard Algos
        setReadyQueueL1([]);
        setReadyQueueL2([]);

        if (available.length > 0) {
            if (algorithm === AlgorithmType.FCFS) {
                available.sort((a, b) => a.arrivalTime - b.arrivalTime || a.id - b.id);
                selected = available[0];
            } else if (algorithm === AlgorithmType.HPF) {
                available.sort((a, b) => b.priority - a.priority || a.arrivalTime - b.arrivalTime);
                if (nextActiveId) {
                    const currentRunning = nextProcesses.find(p => p.id === nextActiveId);
                    if (currentRunning && currentRunning.remainingTime > 0) {
                        selected = currentRunning;
                    } else {
                        selected = available[0];
                    }
                } else {
                    selected = available[0];
                }
            } else if (algorithm === AlgorithmType.SRTF) {
                available.sort((a, b) => a.remainingTime - b.remainingTime || a.arrivalTime - b.arrivalTime);
                selected = available[0];
            } else if (algorithm === AlgorithmType.RR) {
                // Simplified RR for visualization: just sort by arrival for now (limitations of state in one file)
                available.sort((a, b) => a.arrivalTime - b.arrivalTime);
                selected = available[0];
            }
        }
        setGeneralReadyQueue(available.filter(p => p.id !== selected?.id));
    }


    // Execution
    if (selected) {
        nextActiveId = selected.id;
        const pIndex = nextProcesses.findIndex(p => p.id === selected!.id);
        
        if (nextProcesses[pIndex].startTime === null) {
            nextProcesses[pIndex].startTime = stepTime;
        }

        nextProcesses[pIndex].remainingTime -= 1;

        if (nextProcesses[pIndex].remainingTime <= 0) {
            nextProcesses[pIndex].finishTime = stepTime + 1;
            nextProcesses[pIndex].remainingTime = 0;
            nextProcesses[pIndex].turnaroundTime = (stepTime + 1) - nextProcesses[pIndex].arrivalTime;
            nextProcesses[pIndex].waitingTime = nextProcesses[pIndex].turnaroundTime - nextProcesses[pIndex].burstTime;
            nextActiveId = null;
        }
    } else {
        nextActiveId = null;
    }

    setProcesses(nextProcesses);
    setActiveProcessId(nextActiveId);
    
    nextSteps.push({ time: stepTime, processId: nextActiveId });
    setSteps(nextSteps);
    
    const allDone = nextProcesses.every(p => p.remainingTime === 0);
    if (allDone) {
        setIsRunning(false);
        setIsComplete(true);
        onSimulationComplete(nextProcesses, nextSteps, algorithm);
    } else {
        setCurrentTime(prev => prev + 1);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      
      {/* Controls Bar */}
      <div className="bg-surface p-4 rounded-2xl shadow-sm border border-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
           <div className="relative min-w-[250px]">
             <select 
               className="w-full h-12 pl-4 pr-10 rounded-xl bg-input text-navy font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple"
               value={algorithm}
               onChange={(e) => {
                 setAlgorithm(e.target.value as AlgorithmType);
                 resetSimulation();
               }}
               disabled={isRunning || isComplete}
             >
               {Object.values(AlgorithmType).map((algo) => (
                 <option key={algo} value={algo}>{algo}</option>
               ))}
             </select>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-navy/50">
               ▼
             </div>
           </div>

           {algorithm === AlgorithmType.RR && (
              <div className="w-32">
                 <Input 
                   type="number" 
                   value={timeQuantum} 
                   onChange={(e) => setTimeQuantum(parseInt(e.target.value))}
                   placeholder="Quant."
                   className="h-12"
                 />
              </div>
           )}
        </div>

        <div className="flex items-center gap-3">
          <Button 
             variant="secondary"
             size="icon"
             onClick={resetSimulation}
             title="Reset"
          >
             <RotateCcw size={20} />
          </Button>

          {!isRunning ? (
             <Button 
                variant="primary"
                size="icon"
                onClick={() => !isComplete && setIsRunning(true)}
                disabled={isComplete}
             >
                <Play size={24} fill="currentColor" />
             </Button>
          ) : (
             <Button 
                variant="primary"
                size="icon"
                onClick={() => setIsRunning(false)}
             >
                <Pause size={24} fill="currentColor" />
             </Button>
          )}
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* Left: Gantt Chart Container (Dark Navy) */}
        <div className="flex-1 bg-navy rounded-3xl shadow-xl overflow-hidden flex flex-col relative p-6">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-white/90 font-bold text-lg flex items-center gap-2">
                <Cpu className="text-purple" /> CPU Timeline
              </h2>
              <div className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-white font-mono">
                 <Clock size={16} className="text-softBlue" />
                 <span>T = {currentTime}</span>
              </div>
           </div>

           {/* The Gantt Chart Track */}
           <div className="w-full bg-white/5 h-32 rounded-2xl relative overflow-hidden flex items-center px-2 mb-8 border border-white/5">
              <div className="absolute left-0 h-full flex transition-all duration-500 ease-linear" style={{ transform: `translateX(-${Math.max(0, (steps.length * 40) - 800)}px)` }}>
                 {steps.map((step, idx) => (
                   <div key={idx} className="w-10 flex-shrink-0 flex flex-col justify-center items-center h-full border-r border-white/5 relative group">
                      {step.processId ? (
                        <div 
                          className="w-8 h-20 rounded-lg shadow-lg flex items-center justify-center text-xs font-bold text-navy transition-all"
                          style={{ 
                            backgroundColor: processes.find(p => p.id === step.processId)?.color 
                          }}
                        >
                          P{step.processId}
                        </div>
                      ) : (
                        <div className="w-8 h-2 bg-white/10 rounded-full"></div>
                      )}
                      <span className="absolute bottom-2 text-[10px] text-white/30 font-mono">{step.time}</span>
                   </div>
                 ))}
                 {/* Current Head */}
                 <div className="w-1 h-full bg-softBlue absolute right-0 top-0 shadow-[0_0_15px_#ACD1FD] z-10"></div>
              </div>
           </div>

           {/* Multilevel Queue Split View */}
           {algorithm === AlgorithmType.MLQ ? (
             <div className="flex-1 grid grid-rows-2 gap-4">
                {/* Queue 1 (Top) - Purple Theme */}
                <div className="bg-[#2B2C3B] rounded-xl p-4 border border-purple/20 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-purple"></div>
                   <div className="flex justify-between text-purple text-xs font-bold uppercase tracking-wider mb-2 pl-3">
                      <span>Foreground Queue (High Priority)</span>
                      <span>Q1</span>
                   </div>
                   <div className="flex gap-2 pl-3 overflow-x-auto">
                      {readyQueueL1.length === 0 && <span className="text-white/20 text-sm italic">Empty</span>}
                      {readyQueueL1.map(p => (
                         <div key={p.id} className="w-10 h-10 rounded-lg bg-purple text-white flex items-center justify-center font-bold text-xs shadow-lg animate-pulse">
                            P{p.id}
                         </div>
                      ))}
                   </div>
                </div>

                {/* Queue 2 (Bottom) - Blue Theme */}
                <div className="bg-[#2B2C3B] rounded-xl p-4 border border-softBlue/20 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-softBlue"></div>
                   <div className="flex justify-between text-softBlue text-xs font-bold uppercase tracking-wider mb-2 pl-3">
                      <span>Background Queue (Low Priority)</span>
                      <span>Q2</span>
                   </div>
                   <div className="flex gap-2 pl-3 overflow-x-auto">
                      {readyQueueL2.length === 0 && <span className="text-white/20 text-sm italic">Empty</span>}
                      {readyQueueL2.map(p => (
                         <div key={p.id} className="w-10 h-10 rounded-lg bg-softBlue text-navy flex items-center justify-center font-bold text-xs shadow-lg animate-pulse">
                            P{p.id}
                         </div>
                      ))}
                   </div>
                </div>
             </div>
           ) : (
             /* Standard Ready Queue */
             <div className="flex-1 bg-[#2B2C3B] rounded-xl p-4 border border-white/5">
                <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">Ready Queue</div>
                <div className="flex gap-3 flex-wrap">
                   {generalReadyQueue.length === 0 && <span className="text-white/20 text-sm italic">Waiting for processes...</span>}
                   {generalReadyQueue.map(p => (
                      <div key={p.id} className="flex flex-col items-center gap-1">
                         <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm text-navy shadow-md" style={{ backgroundColor: p.color }}>
                            P{p.id}
                         </div>
                         <span className="text-[10px] text-white/50 font-mono">{p.remainingTime}s</span>
                      </div>
                   ))}
                </div>
             </div>
           )}
        </div>

        {/* Right: Process List Status (Active) */}
        <div className="w-80 bg-surface rounded-3xl shadow-sm border border-white p-6 overflow-y-auto">
           <h3 className="text-navy font-bold text-lg mb-4">Process Status</h3>
           <div className="space-y-3">
             {processes.sort((a,b) => a.id - b.id).map(p => (
               <div key={p.id} className={`p-3 rounded-xl border flex items-center justify-between ${p.remainingTime === 0 ? 'bg-green-50 border-green-200 opacity-50' : 'bg-white border-input'}`}>
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                     <span className="font-bold text-navy text-sm">P{p.id}</span>
                  </div>
                  
                  {p.remainingTime === 0 ? (
                     <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md">DONE</span>
                  ) : (
                     <div className="text-right">
                       <span className="text-xs text-navy/40 block">REM</span>
                       <span className="text-sm font-mono font-bold text-navy">{p.remainingTime}s</span>
                     </div>
                  )}
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};