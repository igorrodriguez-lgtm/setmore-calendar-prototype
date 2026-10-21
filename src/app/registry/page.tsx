"use client";

import { useEffect, useState } from "react";
import { Button, ClipboardCopyIcon, Heading, NewWindowIcon, Text } from "@adaptavant/eds-core";

type Item = { name: string; type: string; title?: string; description?: string; dependencies?: string[] };

const DEMO_URL = "http://localhost:3001";

/** Built by `npx shadcn build` from registry.json into public/r. */
function useRegistry() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    fetch("/r/registry.json")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);
  return items;
}

function Copyable({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-8px bg-inverse py-2 pl-3 pr-2">
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-body-12 text-onPrimary">{text}</code>
      <Button
        size="small"
        variant="inversePrimary"
        iconStart={ClipboardCopyIcon}
        onClick={() => {
          navigator.clipboard?.writeText(text).catch(() => {});
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

const why: Record<string, string> = {
  theme: "EDS colours, radius and font as shadcn theme variables. Install once and everything looks like EDS.",
  button: "The most-used component: EDS options (variant, size, iconStart, isLoading) on shadcn's structure.",
  tooltip: "A component both systems have. Behaviour now comes from Radix.",
  "dropdown-menu": "A complex Radix component with EDS's parts and options. Can also be opened from code, which eds-core can't.",
  "time-picker": "An EDS-only component moved into the registry. Can be updated from code, which fixes the eds-core TimePicker limitation.",
};

const findings = [
  {
    title: "One command installs EDS into any app",
    body: "A fresh Next.js + Tailwind v4 app ran `npx shadcn add @eds/...` and got the components, their Radix packages and the EDS theme. No private npm package, no Tailwind v3 requirement.",
  },
  {
    title: "Guidance travels with each component",
    body: "Each item's `docs` text printed in the terminal on install. That is the text an AI assistant reads, so AI-written code gets EDS's rules up front.",
  },
  {
    title: "shadcn now has three foundations",
    body: "Radix (radix-*), Base UI (base-*) and React Aria (aria-*). New apps default to Base UI. Our Radix-based items lost their asChild prop until the app switched to a Radix style. The registry must pick a foundation; React Aria is the one EDS itself is built on.",
  },
  {
    title: "Teams own their copies",
    body: "Installed files are the app's own code, so a fix in the registry doesn't reach apps until they re-add the component (`shadcn add --overwrite`). This trade is what buys the speed; it needs a release habit or a drift check.",
  },
];

export default function RegistryPage() {
  const items = useRegistry();
  const all = items.map((i) => `@eds/${i.name}`).join(" ");
  return (
    <main className="mx-auto flex max-w-[880px] flex-col gap-8 px-6 py-10 text-primary">
      <header className="flex flex-col gap-3">
        <a href="/" className="text-body-12 text-secondary hover:underline">
          ← Back to the calendar
        </a>
        <Heading as="h1" className="text-heading-24">
          EDS as a shadcn registry
        </Heading>
        <Text as="p" className="text-body-14 text-secondary">
          Proof of concept. Instead of a locked package, EDS components are published as shadcn registry items that any app copies into its own code with one
          command, already styled as EDS. This prototype is acting as the EDS team&apos;s server.
        </Text>
        <div className="flex flex-wrap gap-2">
          <Button iconEnd={NewWindowIcon} onClick={() => window.open(DEMO_URL, "_blank", "noopener")}>
            Open the demo app
          </Button>
          <Button variant="neutralSecondary" onClick={() => window.open("/r/registry.json", "_blank", "noopener")}>
            View registry index
          </Button>
        </div>
        <Text as="p" className="text-body-12 text-tertiary">
          The demo app is a separate, brand-new Next.js project (Tailwind v4, shadcn) on port 3001, standing in for another team&apos;s product.
        </Text>
      </header>

      <section className="flex flex-col gap-3">
        <Heading as="h2" className="text-heading-16">
          1. Point a project at the registry
        </Heading>
        <Text as="p" className="text-body-14 text-secondary">
          One entry in the project&apos;s components.json. In production the URL would be the EDS docs site, with a token header to keep it private.
        </Text>
        <pre className="overflow-x-auto rounded-8px border border-secondary bg-canvas-secondary p-3 text-body-12">{`"registries": {
  "@eds": "http://localhost:3000/r/{name}.json"
}`}</pre>
      </section>

      <section className="flex flex-col gap-3">
        <Heading as="h2" className="text-heading-16">
          2. Install components
        </Heading>
        {all && <Copyable text={`npx shadcn add ${all}`} />}
        <ul className="flex flex-col divide-y divide-tertiary rounded-12px border border-secondary">
          {items.map((item) => (
            <li key={item.name} className="flex flex-col gap-2 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-body-14 font-stronger">
                  {item.title ?? item.name} <span className="font-regular text-tertiary">@eds/{item.name}</span>
                </span>
                <a href={`/r/${item.name}.json`} target="_blank" rel="noopener" className="text-body-12 text-link hover:underline">
                  Raw item
                </a>
              </div>
              <Text as="p" className="text-body-12 text-secondary">
                {why[item.name] ?? item.description}
              </Text>
              {item.dependencies && item.dependencies.length > 0 && (
                <Text as="p" className="text-body-12 text-tertiary">
                  Installs: {item.dependencies.join(", ")}
                </Text>
              )}
              <Copyable text={`npx shadcn add @eds/${item.name}`} />
            </li>
          ))}
          {items.length === 0 && (
            <li className="p-4 text-body-12 text-secondary">
              Registry not built yet. Run <code>npx shadcn@4.22.1 build</code> in the prototype folder.
            </li>
          )}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <Heading as="h2" className="text-heading-16">
          3. What we learned
        </Heading>
        <div className="grid gap-3 sm:grid-cols-2">
          {findings.map((f) => (
            <div key={f.title} className="rounded-12px border border-secondary p-4">
              <p className="text-body-14 font-stronger">{f.title}</p>
              <p className="mt-1 text-body-12 text-secondary">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <Heading as="h2" className="text-heading-16">
          Where the files are
        </Heading>
        <ul className="list-disc pl-5 text-body-12 text-secondary">
          <li>Registry definition: setmore-calendar-prototype/registry.json</li>
          <li>Component source: setmore-calendar-prototype/registry/eds/ui/</li>
          <li>Built items (what apps download): setmore-calendar-prototype/public/r/</li>
          <li>Demo app: ~/eds-registry-demo (components installed into src/components/ui/)</li>
        </ul>
      </section>
    </main>
  );
}
