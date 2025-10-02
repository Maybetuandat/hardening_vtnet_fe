// src/components/dashboard/charts/stacked-bar-chart.tsx
import { WorkloadStats } from "@/types/dashboard";

interface StackedBarChartProps {
  data: WorkloadStats[];
}

export const StackedBarChart = ({ data }: StackedBarChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] space-y-3">
        <p className="text-muted-foreground text-sm">
          No workload data available
        </p>
        <p className="text-xs text-muted-foreground text-center max-w-md">
          Instances need to be assigned to workloads to display statistics
        </p>
      </div>
    );
  }

  const maxTotal = Math.max(...data.map((w) => w.total));
  const chartHeight = 250;

  return (
    <div className="space-y-4">
      <div className="relative" style={{ height: `${chartHeight + 40}px` }}>
        <div className="absolute left-0 top-0 bottom-10 flex flex-col justify-between text-xs text-muted-foreground">
          <span>{maxTotal}</span>
          <span>{Math.round(maxTotal * 0.75)}</span>
          <span>{Math.round(maxTotal * 0.5)}</span>
          <span>{Math.round(maxTotal * 0.25)}</span>
          <span>0</span>
        </div>

        <div className="absolute left-12 right-0 top-0 bottom-10 flex items-end justify-around gap-4">
          {data.map((workload, index) => {
            const passHeight = (workload.pass_count / maxTotal) * chartHeight;
            const failHeight = (workload.fail_count / maxTotal) * chartHeight;
            const totalHeight = passHeight + failHeight;

            return (
              <div
                key={index}
                className="flex flex-col items-center flex-1 max-w-[80px]"
              >
                <div
                  className="w-full rounded-t-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  style={{ height: `${totalHeight}px`, minHeight: "4px" }}
                  title={`${workload.workload_name}\nPass: ${workload.pass_count}\nFailed: ${workload.fail_count}\nTotal: ${workload.total}`}
                >
                  {workload.fail_count > 0 && (
                    <div
                      className="w-full relative bg-red-600"
                      style={{ height: `${(failHeight / totalHeight) * 100}%` }}
                    >
                      {failHeight > 20 && (
                        <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold">
                          {workload.fail_count}
                        </span>
                      )}
                    </div>
                  )}

                  {workload.pass_count > 0 && (
                    <div
                      className="w-full relative bg-green-500"
                      style={{ height: `${(passHeight / totalHeight) * 100}%` }}
                    >
                      {passHeight > 20 && (
                        <span className="absolute inset-0 flex items-center justify-center text-gray-800 text-xs font-semibold">
                          {workload.pass_count}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div
                  className="mt-2 text-xs text-center font-medium truncate w-full"
                  title={workload.workload_name}
                >
                  {workload.workload_name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center gap-6 pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-sm font-medium">Active (Pass)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded" />
          <span className="text-sm font-medium">Inactive (Failed)</span>
        </div>
      </div>
    </div>
  );
};
