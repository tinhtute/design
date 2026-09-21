'use client';

import * as echarts from 'echarts/core';
import { MapChart, ScatterChart } from 'echarts/charts';
import { GeoComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { BubbleMap, type MapGeoJson } from '@/components/ui/bubble-map';

echarts.use([MapChart, ScatterChart, GeoComponent, TooltipComponent, CanvasRenderer]);

const sampleGeoJson: MapGeoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'US',
      properties: { name: 'United States' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-125, 25],
            [-65, 25],
            [-65, 50],
            [-125, 50],
            [-125, 25],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'VN',
      properties: { name: 'Vietnam' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [102, 8],
            [110, 8],
            [110, 24],
            [102, 24],
            [102, 8],
          ],
        ],
      },
    },
  ],
};

export const notes =
  'Proportional bubbles plotted by lng/lat over a blank GeoJSON land base — good for PoP or traffic maps. `lng`/`lat`/`name`/`value` are key or function accessors on your rows; `minRadius`/`maxRadius`, `roam`, and `projection` tune the view.';

export function Demo() {
  return (
    <div className="h-64 min-w-0 max-w-full overflow-hidden">
      <BubbleMap
        echarts={echarts}
        geoJson={sampleGeoJson}
        data={[
          { city: 'San Francisco', lon: -122.4, lat: 37.7, count: 120 },
          { city: 'Hanoi', lon: 105.8, lat: 21.0, count: 85 },
        ]}
        lng="lon"
        lat="lat"
        name="city"
        value="count"
      />
    </div>
  );
}
