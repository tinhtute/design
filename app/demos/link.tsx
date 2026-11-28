'use client';

import { Link } from '@/components/ui/link';
import { Text } from '@/components/ui/text';

export const notes =
  'Inline text link for navigation inside prose or UI. `variant` controls decoration (inline, current, plain); for external destinations add `Link.ExternalIcon` with target=_blank and rel=noopener. Use `render` or a LinkProvider to plug in your router.';

export const deps = ['text'];

export function Demo() {
  return (
    <Text>
      Deploy your first Worker from the{' '}
      <Link href="https://developers.cloudflare.com/workers/">Workers docs</Link>, browse the{' '}
      <Link href="/" variant="plain">
        component catalog
      </Link>
      , or check the{' '}
      <Link href="https://github.com/cloudflare/kumo" target="_blank" rel="noopener noreferrer">
        source on GitHub <Link.ExternalIcon />
      </Link>
      .
    </Text>
  );
}
