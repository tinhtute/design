'use client';

import { GlobeMap, type GlobeMapMarker } from '@/components/ui/globe-map';

const locations: GlobeMapMarker[] = [
  { name: 'SFO', description: 'San Francisco', latitude: 37.77, longitude: -122.42 },
  { name: 'ORD', description: 'Chicago', latitude: 41.88, longitude: -87.63 },
  { name: 'IAD', description: 'Ashburn', latitude: 39.04, longitude: -77.49 },
  { name: 'GRU', description: 'São Paulo', latitude: -23.55, longitude: -46.63 },
  { name: 'LHR', description: 'London', latitude: 51.51, longitude: -0.13 },
  { name: 'FRA', description: 'Frankfurt', latitude: 50.11, longitude: 8.68 },
  { name: 'DXB', description: 'Dubai', latitude: 25.2, longitude: 55.27 },
  { name: 'JNB', description: 'Johannesburg', latitude: -26.2, longitude: 28.05 },
  { name: 'BOM', description: 'Mumbai', latitude: 19.08, longitude: 72.88 },
  { name: 'SIN', description: 'Singapore', latitude: 1.35, longitude: 103.82 },
  { name: 'HAN', description: 'Hanoi', latitude: 21.03, longitude: 105.85 },
  { name: 'NRT', description: 'Tokyo', latitude: 35.68, longitude: 139.69 },
  { name: 'SYD', description: 'Sydney', latitude: -33.87, longitude: 151.21 },
];

export const notes =
  'SVG orthographic globe with hatched land from a bundled Natural Earth mask (d3-geo only, no echarts or GeoJSON fetch). Drag to rotate; `autoRotate` spins it. Markers take `longitude`/`latitude`/`name`, with per-marker `color`/`radius` overrides and a hover tooltip.';

export function Demo() {
  return (
    <div className="mx-auto w-full max-w-md">
      <GlobeMap
        markers={locations}
        landColor="var(--text-color-kumo-inactive)"
        landHatchSpacing={8}
        oceanColor="transparent"
        showGraticule
        markerColor="var(--color-kumo-brand)"
        markerRadius={6}
        defaultRotation={[-60, -20, 0]}
        aria-label="Example network locations"
      />
    </div>
  );
}
