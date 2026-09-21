'use client';

import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { TimeseriesChart } from '@/components/ui/timeseries-chart';

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

export const notes =
  'Time-series line or bar chart with markers, thresholds, and a cursor-following tooltip. You pass the `echarts` instance — register only the modules you need to keep bundles small.';

export function Demo() {
  return (
    <div className="h-48 min-w-0 max-w-full overflow-hidden">
      <TimeseriesChart
        echarts={echarts}
        data={[
          {
            name: 'Requests',
            color: '#124b68',
            data: [
              [0, 10],
              [60_000, 18],
              [120_000, 12],
            ],
          },
        ]}
      />
    </div>
  );
}
