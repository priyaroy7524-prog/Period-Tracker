import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const dummyData = [
  { month: 'May', cycleLength: 28 },
  { month: 'Jun', cycleLength: 29 },
  { month: 'Jul', cycleLength: 27 },
  { month: 'Aug', cycleLength: 28 },
  { month: 'Sep', cycleLength: 30 },
  { month: 'Oct', cycleLength: 28 },
];

const HistoryChart = ({ data = dummyData, isDarkMode }) => {
  return (
    <div className={`p-6 rounded-3xl shadow-xl transition-all border ${
      isDarkMode 
        ? 'bg-pastel-darkCard border-purple-900/30 text-white' 
        : 'bg-white/80 backdrop-blur-md border-rose-100 text-gray-800'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-rose-500">
          Cycle History Trends 📈
        </h3>
        <span className="text-xs text-gray-400">Past 6 Months</span>
      </div>

      <div className="h-48 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCycle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EC4899" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke={isDarkMode ? '#A78BFA' : '#9CA3AF'} fontSize={12} />
            <YAxis domain={[20, 35]} stroke={isDarkMode ? '#A78BFA' : '#9CA3AF'} fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#1E1B2E' : '#FFF', 
                borderRadius: '12px',
                borderColor: '#F472B6' 
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="cycleLength" 
              stroke="#EC4899" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorCycle)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoryChart;