"use client";

import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { Chart } from "@/components/ui/chart";

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

export const notes =
  "Low-level Apache ECharts wrapper for full control over the option object — pass your own `echarts` instance and register only the modules you need to keep bundles small. Size it with `height` or `aspectRatio`; HTML tooltip content goes through `dangerousHtmlFormatter`.";

export function Demo() {
  return (
    <div className="h-48 min-w-0 max-w-full overflow-hidden">
      <Chart
        echarts={echarts}
        height={192}
        options={{
          tooltip: { trigger: "axis" },
          grid: { top: 16, right: 16, bottom: 8, left: 8, containLabel: true },
          xAxis: {
            type: "category",
            data: [
              "00:00",
              "01:00",
              "02:00",
              "03:00",
              "04:00",
              "05:00",
              "06:00",
              "07:00",
            ],
          },
          yAxis: { type: "value" },
          series: [
            {
              name: "Requests",
              type: "line",
              smooth: true,
              data: [820, 932, 901, 934, 1290, 1330, 1120, 980],
            },
          ],
        }}
      />
    </div>
  );
}
