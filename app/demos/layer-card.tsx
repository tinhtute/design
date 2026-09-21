'use client';

import { Badge } from '@/components/ui/badge';
import { LayerCard } from '@/components/ui/layer-card';
import { Text } from '@/components/ui/text';

export const notes =
  'Card surface for grouping related content. Render children directly for a flat card (bring your own padding) or compose `Secondary` + `Primary` for the layered treatment with an elevated header strip over a raised inner card.';

export const deps = ['badge', 'text'];

export function Demo() {
  return (
    <LayerCard>
      <LayerCard.Secondary className="justify-between">
        <span>Production deploy</span>
        <Badge variant="success" appearance="dot">
          Live
        </Badge>
      </LayerCard.Secondary>
      <LayerCard.Primary>
        <Text variant="heading" as="h3">
          api-gateway
        </Text>
        <Text variant="secondary" size="sm">
          Version 4f9c2e71 · deployed 12 minutes ago via wrangler
        </Text>
      </LayerCard.Primary>
    </LayerCard>
  );
}
