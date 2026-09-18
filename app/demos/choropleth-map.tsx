"use client";

import * as echarts from "echarts/core";
import { MapChart } from "echarts/charts";
import {
  GeoComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import {
  ChoroplethMap,
  type MapGeoJson,
} from "@/components/ui/choropleth-map";

echarts.use([
  MapChart,
  VisualMapComponent,
  GeoComponent,
  TooltipComponent,
  CanvasRenderer,
]);

export const notes =
  "Shades GeoJSON regions by value — join rows to features with the `name` accessor (or `nameProperty` for ISO codes) and drive the fill with `value`. Set `showLegend` for the color ramp; you pass the `echarts` instance and register only the modules you need.";

const sampleGeoJson: MapGeoJson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "US",
      properties: { name: "United States" },
      geometry: {
        type: "Polygon",
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
      type: "Feature",
      id: "VN",
      properties: { name: "Vietnam" },
      geometry: {
        type: "Polygon",
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

export function Demo() {
  return (
    <div className="h-64 min-w-0 max-w-full overflow-hidden">
      <ChoroplethMap
        echarts={echarts}
        geoJson={sampleGeoJson}
        data={[
          { country: "United States", count: 1200 },
          { country: "Vietnam", count: 850 },
        ]}
        name="country"
        value="count"
        showLegend
      />
    </div>
  );
}
