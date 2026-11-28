import Link from 'next/link';
import { SiteBar } from '@/components/site-frame';

export default function NotFound() {
  return (
    <div className="mono-index min-h-dvh bg-kumo-base text-kumo-default">
      <SiteBar />
      <main className="mx-auto grid max-w-3xl gap-4 px-4 py-8 sm:px-8">
        <h1 className="font-heading text-2xl">Page not found</h1>
        <p className="text-sm text-kumo-subtle">
          This address does not match a page. Find a component in the showroom or return to the
          documentation.
        </p>
        <ul className="flex flex-wrap gap-4 text-sm">
          <li>
            <Link className="underline underline-offset-4" href="/">
              Go to showroom
            </Link>
          </li>
          <li>
            <Link className="underline underline-offset-4" href="/docs">
              Go to docs
            </Link>
          </li>
        </ul>
      </main>
    </div>
  );
}
