import React from 'react';

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return <div className="flex items-center justify-center h-40 text-center text-slate-500">No invoice data to display.</div>;
  }

  let cumulativeAngle = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
      <div className="relative w-40 h-40">
        <svg viewBox="-1 -1 2 2" className="transform -rotate-90">
          {data.map(({ value, color, label }) => {
            const percent = value / total;
            const [startX, startY] = getCoordinatesForPercent(cumulativeAngle);
            cumulativeAngle += percent;
            const [endX, endY] = getCoordinatesForPercent(cumulativeAngle);

            const largeArcFlag = percent > 0.5 ? 1 : 0;

            const pathData = [
              `M ${startX} ${startY}`,
              `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              `L 0 0`,
            ].join(' ');

            return <path key={label} d={pathData} fill={color} />;
          })}
        </svg>
      </div>
      <ul className="space-y-1">
        {data.map(({ label, value, color }) => (
          <li key={label} className="flex items-center text-sm">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{label}:</span>
            <span className="ml-2 text-slate-500 dark:text-slate-400">{value} ({((value / total) * 100).toFixed(0)}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PieChart;
