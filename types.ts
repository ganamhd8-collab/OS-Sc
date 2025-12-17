export enum AlgorithmType {
  HPF = 'Non-Preemptive Highest Priority First',
  FCFS = 'First Come First Serve',
  RR = 'Round Robin',
  SRTF = 'Preemptive Shortest Remaining Time First',
  MLQ = 'Multilevel Queue'
}

export interface Process {
  id: number;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  color: string;
  
  // Simulation State
  remainingTime: number;
  startTime: number | null;
  finishTime: number | null;
  waitingTime: number;
  turnaroundTime: number;
  queueLevel?: 1 | 2; // For MLQ
}

export interface GeneratorConfig {
  count: number;
  arrivalMean: number;
  arrivalSd: number;
  burstMean: number;
  burstSd: number;
  priorityLambda: number;
}

export interface SimulationStep {
  time: number;
  processId: number | null; // null if idle
}

export interface SimulationStats {
  algorithm: AlgorithmType;
  avgTurnaround: number;
  avgWaiting: number;
  processes: Process[];
}