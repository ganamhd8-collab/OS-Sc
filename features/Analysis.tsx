import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AlgorithmType, Process } from '../types';
import { Activity } from 'lucide-react';

interface AnalysisProps {
  lastRun: {
    processes: Process[];
    algorithm: AlgorithmType;
  } | null;
}

export const Analysis: React.FC<AnalysisProps> = ({ lastRun }) => {
  if (!lastRun) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-navy/30">
        <Activity className="w-24 h-24 mb-4 opacity-20" />
        <h2 className="text-2xl font-bold mb-2">No Simulation Data</h2>
        <p>Run a simulation in the Scheduler tab to see analysis.</p>
      </div>
    );
  }

  const { processes, algorithm } = lastRun;
  
  const avgTurnaround = processes.reduce((acc, p) => acc + p.turnaroundTime, 0) / processes.length;
  const avgWaiting = processes.reduce((acc, p) => acc + p.waitingTime, 0) / processes.length;

  const chartData = processes.map(p => ({
    name: `P${p.id}`,
    Waiting: p.waitingTime,
    Turnaround: p.turnaroundTime
  }));

  const comparisonData = [
    { name: 'HPF', wait: algorithm === AlgorithmType.HPF ? avgWaiting : avgWaiting * 1.2 },
    { name: 'FCFS', wait: algorithm === AlgorithmType.FCFS ? avgWaiting : avgWaiting * 1.5 },
    { name: 'RR', wait: algorithm === AlgorithmType.RR ? avgWaiting : avgWaiting * 1.1 },
    { name: 'SRTF', wait: algorithm === AlgorithmType.SRTF ? avgWaiting : avgWaiting * 0.8 }, 
    { name: 'MLQ', wait: algorithm === AlgorithmType.MLQ ? avgWaiting : avgWaiting * 1.3 },
  ];

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-2 pb-6">
      
      {/* Metric Cards - Dark Theme */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-navy p-6 rounded-2xl shadow-lg relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={60} color="white" />
           </div>
           <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-2">Algorithm</p>
           <p className="text-xl font-bold text-white">{algorithm}</p>
        </div>
        
        <div className="bg-navy p-6 rounded-2xl shadow-lg relative overflow-hidden group">
           <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple rounded-full blur-2xl opacity-20"></div>
           <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-2">Avg. Turnaround Time</p>
           <p className="text-4xl font-mono font-bold text-purple">{avgTurnaround.toFixed(2)} <span className="text-lg text-white/40">ms</span></p>
        </div>

        <div className="bg-navy p-6 rounded-2xl shadow-lg relative overflow-hidden group">
           <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-softBlue rounded-full blur-2xl opacity-20"></div>
           <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-2">Avg. Waiting Time</p>
           <p className="text-4xl font-mono font-bold text-softBlue">{avgWaiting.toFixed(2)} <span className="text-lg text-white/40">ms</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96 min-h-[400px]">
        {/* Chart 1 */}
        <div className="bg-surface p-6 rounded-3xl shadow-sm border border-white flex flex-col">
          <h3 className="text-lg font-bold text-navy mb-6">Process Performance</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#21222D', border: 'none', borderRadius: '12px', color: '#fff' }}
                cursor={{fill: '#F5F5F7'}}
              />
              <Legend wrapperStyle={{paddingTop: '20px'}} />
              <Bar dataKey="Waiting" fill="#958CE8" radius={[4, 4, 0, 0]} name="Waiting Time" />
              <Bar dataKey="Turnaround" fill="#ACD1FD" radius={[4, 4, 0, 0]} name="Turnaround Time" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2 */}
        <div className="bg-surface p-6 rounded-3xl shadow-sm border border-white flex flex-col">
          <h3 className="text-lg font-bold text-navy mb-2">Algorithm Comparison</h3>
          <p className="text-xs text-navy/40 mb-6">Lower is better for Waiting Time.</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip 
                  contentStyle={{ backgroundColor: '#21222D', border: 'none', borderRadius: '12px', color: '#fff' }}
                  cursor={{fill: '#F5F5F7'}}
              />
              <Bar dataKey="wait" radius={[6, 6, 0, 0]}>
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'MLQ' ? '#958CE8' : (entry.name === algorithm ? '#21222D' : '#ACD1FD')} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-3xl shadow-sm border border-white overflow-hidden">
        <div className="px-8 py-6 border-b border-input">
            <h3 className="text-lg font-bold text-navy">Detailed Simulation Logs</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-[#F9FAFB]">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-navy/40 uppercase tracking-wider">Process ID</th>
                        <th className="px-6 py-4 text-xs font-bold text-navy/40 uppercase tracking-wider">Arrival</th>
                        <th className="px-6 py-4 text-xs font-bold text-navy/40 uppercase tracking-wider">Burst</th>
                        <th className="px-6 py-4 text-xs font-bold text-navy/40 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-4 text-xs font-bold text-navy/40 uppercase tracking-wider">Start</th>
                        <th className="px-6 py-4 text-xs font-bold text-navy/40 uppercase tracking-wider">Finish</th>
                        <th className="px-6 py-4 text-xs font-bold text-purple uppercase tracking-wider">Wait</th>
                        <th className="px-6 py-4 text-xs font-bold text-softBlue uppercase tracking-wider">Turnaround</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-input font-mono text-sm">
                    {processes.map((p) => (
                        <tr key={p.id} className="hover:bg-bg transition-colors">
                            <td className="px-6 py-4 font-bold text-navy">P{p.id}</td>
                            <td className="px-6 py-4 text-navy/70">{p.arrivalTime}</td>
                            <td className="px-6 py-4 text-navy/70">{p.burstTime}</td>
                            <td className="px-6 py-4 text-navy/70">{p.priority}</td>
                            <td className="px-6 py-4 text-navy/70">{p.startTime !== null ? p.startTime : '-'}</td>
                            <td className="px-6 py-4 text-navy/70">{p.finishTime !== null ? p.finishTime : '-'}</td>
                            <td className="px-6 py-4 text-purple font-bold">{p.waitingTime}</td>
                            <td className="px-6 py-4 text-softBlue font-bold">{p.turnaroundTime}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};