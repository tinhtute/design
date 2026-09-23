'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  InformationCircleIcon as InfoIcon,
  Alert02Icon as WarningIcon,
  AlertDiamondIcon as WarningOctagonIcon,
} from '@hugeicons/core-free-icons';
import { Banner } from '@/components/ui/banner';

export const notes =
  'Full-width inline message for product notices — place it above the content it describes. `variant` sets severity (default → error), `title`/`description` carry the copy, `icon` adds a leading glyph, and the `action` slot takes a `Banner.Action` CTA that self-styles to the variant.';

export function Demo() {
  return (
    <div className="grid gap-3">
      <Banner
        icon={<HugeiconsIcon icon={InfoIcon} />}
        title="New region available"
        description="Workers can now be deployed to the eu-west region."
      />
      <Banner
        variant="alert"
        icon={<HugeiconsIcon icon={WarningIcon} />}
        title="Approaching request limits"
        description="This account has used 80% of its monthly request quota."
        action={<Banner.Action variant="secondary">Upgrade</Banner.Action>}
      />
      <Banner
        variant="error"
        icon={<HugeiconsIcon icon={WarningOctagonIcon} />}
        title="Deployment failed"
        description="Worker api-gateway failed to deploy to production."
        action={<Banner.Action variant="secondary">Retry</Banner.Action>}
      />
    </div>
  );
}
