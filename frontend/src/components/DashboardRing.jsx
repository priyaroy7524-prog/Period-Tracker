import React from 'react';

const DashboardRing = ({ currentDay = 14, totalDays = 28, isDarkMode }) => {
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (currentDay / totalDays) * circumference;

  const daysLeft = totalDays - currentDay;

  return (
    <div className={`p-8 rounded-3xl shadow-xl transition-all duration-300 flex flex-col items-center justify-center border ${
      isDarkMode 
        ? 'bg-pastel-darkCard border-purple-900/30 text-white' 
        : 'bg-white/80 backdrop-blur-md border-rose-100 text-gray-800'
    }`}>
      <h2 className="mb-6 text-xl font-semibold tracking-wide text-rose-500">
        Cycle Overview 🌸
      </h2>

      {/* Circular Ring Container */}
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          {/* Background Ring */}
          <circle
            stroke={isDarkMode ? "#3D3450" : "#FEE2E2"}
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Animated Progress Ring */}
          <circle
            stroke="url(#gradient)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-3xl font-extrabold tracking-tight">
            Day {currentDay}
          </span>
          <span className="text-xs text-gray-400 font-medium mt-0.5">
            of {totalDays} Days
          </span>
        </div>
      </div>

      {/* Days Left Status Badge */}
      <div className="px-4 py-2 mt-6 text-sm font-medium text-pink-600 bg-pink-100 rounded-full shadow-sm dark:bg-pink-950/50 dark:text-pink-300">
        ✨ Next period in <span className="font-bold">{daysLeft} days</span>
      </div>
    </div>
  );
};

export default DashboardRing;