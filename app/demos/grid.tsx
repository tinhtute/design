"use client";

import { Grid, GridItem } from "@/components/ui/grid";
import { LayerCard } from "@/components/ui/layer-card";
import { Text } from "@/components/ui/text";

export const notes =
  "Responsive layout grid with preset column variants (`2up`, `3up`, `4up`, `2-1`…) and `gap` sizes. Place each cell in `GridItem`; columns collapse at smaller breakpoints.";

export function Demo() {
  return (
    <Grid variant="3up" gap="sm">
      <GridItem>
        <LayerCard>
          <Text>Workers — 12 deployed</Text>
        </LayerCard>
      </GridItem>
      <GridItem>
        <LayerCard>
          <Text>KV namespaces — 4</Text>
        </LayerCard>
      </GridItem>
      <GridItem>
        <LayerCard>
          <Text>R2 buckets — 7</Text>
        </LayerCard>
      </GridItem>
    </Grid>
  );
}
