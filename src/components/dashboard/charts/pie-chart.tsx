// src/components/dashboard/charts/pie-chart.tsx
interface PieChartProps {
  passCount: number;
  failCount: number;
}

export const PieChart = ({ passCount, failCount }: PieChartProps) => {
  const total = passCount + failCount;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[280px]">
        <p className="text-muted-foreground text-sm">No data available</p>
      </div>
    );
  }

  const passPercentage = (passCount / total) * 100;
  const failPercentage = (failCount / total) * 100;

  const passAngle = (passPercentage / 100) * 360;
  const failAngle = (failPercentage / 100) * 360;

  const getCoordinatesForAngle = (angle: number, radius: number = 100) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: 120 + radius * Math.cos(rad),
      y: 120 + radius * Math.sin(rad),
    };
  };

  const passStart = getCoordinatesForAngle(0);
  const passEnd = getCoordinatesForAngle(passAngle);
  const failEnd = getCoordinatesForAngle(passAngle + failAngle);

  const passPath = [
    `M 120 120`,
    `L ${passStart.x} ${passStart.y}`,
    `A 100 100 0 ${passAngle > 180 ? 1 : 0} 1 ${passEnd.x} ${passEnd.y}`,
    "Z",
  ].join(" ");

  const failPath = [
    `M 120 120`,
    `L ${passEnd.x} ${passEnd.y}`,
    `A 100 100 0 ${failAngle > 180 ? 1 : 0} 1 ${failEnd.x} ${failEnd.y}`,
    "Z",
  ].join(" ");

  return (
    <div className="flex flex-col items-center gap-6">
      <svg width="240" height="240" viewBox="0 0 240 240">
        <path d={passPath} fill="#22c55e" stroke="white" strokeWidth="2" />
        <path d={failPath} fill="#dc2626" stroke="white" strokeWidth="2" />
        <circle cx="120" cy="120" r="60" fill="white" />
        <text
          x="120"
          y="115"
          textAnchor="middle"
          fontSize="24"
          fontWeight="bold"
          fill="#333"
        >
          {total}
        </text>
        <text x="120" y="135" textAnchor="middle" fontSize="12" fill="#666">
          Total Instances
        </text>
      </svg>

      <div className="flex gap-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <div className="text-sm">
            <span className="font-semibold">Pass: </span>
            <span>
              {passCount} ({passPercentage.toFixed(1)}%)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded" />
          <div className="text-sm">
            <span className="font-semibold">Failed: </span>
            <span>
              {failCount} ({failPercentage.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
