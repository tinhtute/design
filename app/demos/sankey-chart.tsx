"use client";

import * as echarts from "echarts/core";
import { SankeyChart as EChartsSankey } from "echarts/charts";
import { TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { SankeyChart } from "@/components/ui/sankey-chart";

echarts.use([EChartsSankey, TooltipComponent, CanvasRenderer]);

export const notes =
  "Flow diagram for proportional splits between stages — traffic, cost, requests. Pass `nodes` (name/value) and `links` as source/target index pairs; register only the Sankey chart, tooltip, and renderer on your echarts instance to keep the bundle small.";

export function Demo() {
  return (
    <div className="h-48 min-w-0 max-w-full overflow-hidden">
      <SankeyChart
        echarts={echarts}
        height={192}
        nodes={[
          { name: "Ingress", value: 80 },
          { name: "Workers", value: 80 },
          { name: "Origin", value: 75 },
          { name: "Cache", value: 5 },
        ]}
        links={[
          { source: 0, target: 1, value: 80 },
          { source: 1, target: 2, value: 75 },
          { source: 1, target: 3, value: 5 },
        ]}
      />
    </div>
  );
}
