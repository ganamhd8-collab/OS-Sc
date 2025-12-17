# OS Scheduler Simulator

A modern, interactive operating system scheduler simulation dashboard for educational purposes. This application visualizes various CPU scheduling algorithms, providing insights into their behavior and performance metrics.

## Features

- **Interactive Simulation**: Watch CPU scheduling in real-time with a visual Gantt chart.
- **Algorithms Supported**:
  - Non-Preemptive Highest Priority First (HPF)
  - First Come First Serve (FCFS)
  - Round Robin (RR) with configurable time quantum
  - Preemptive Shortest Remaining Time First (SRTF)
  - Multilevel Queue (MLQ) simulation
- **Process Generation**: 
  - Random generation using Normal and Poisson distributions for realistic simulation.
  - Manual entry mode for specific test cases.
- **Analytics Dashboard**: 
  - Calculate and visualize Average Turnaround Time and Waiting Time.
  - Compare performance across different algorithms.
  - Detailed step-by-step execution logs.

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts

## Usage

1. **Generator**: Configure the number of processes and their arrival/burst time distributions, or manually enter process data.
2. **Scheduler**: Select an algorithm and run the simulation. View the Gantt chart and ready queues in real-time.
3. **Analysis**: Analyze the results with bar charts and detailed metrics tables.

## License

MIT
