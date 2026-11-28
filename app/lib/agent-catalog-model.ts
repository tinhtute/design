import type { ComponentPropsDoc } from './props';

export interface AgentGuide {
  useWhen: string;
  avoidWhen: string;
  anatomy: string[];
  states: string[];
  rules: string[];
}

export interface CatalogItem {
  slug: string;
  title: string;
  group: string;
  type: string;
  description: string;
  aliases: string[];
  links: { demo: string; registry: string };
  install: string;
  props: ComponentPropsDoc[];
  example: string | null;
  guide: AgentGuide | null;
}

export const CATALOG_PATH = '/agent-catalog.json';

export function agentContext(item: CatalogItem): string {
  const { guide, example } = item;
  const props = item.props.map(({ displayName, props, inheritsDomProps }) =>
    [
      displayName + (inheritsDomProps ? ' (inherited props omitted)' : ''),
      ...props.map((prop) =>
        [
          '- ' + prop.name + (prop.required ? ' (required)' : ' (optional)') + ': ' + prop.type,
          prop.defaultValue === null ? '' : 'Default: ' + prop.defaultValue + '.',
          prop.description,
        ]
          .filter(Boolean)
          .join(' '),
      ),
    ].join('\n'),
  );

  return [
    '# ' + item.title,
    item.description,
    'Install: ' + item.install,
    'Setup: https://design.tinhtute.me/docs#configuration',
    'Demo: ' + item.links.demo,
    'Registry: ' + item.links.registry,
    guide &&
      [
        'Use when: ' + guide.useWhen,
        'Avoid when: ' + guide.avoidWhen,
        'Anatomy: ' + guide.anatomy.join(', '),
        'States: ' + guide.states.join(', '),
        ...guide.rules.map((rule) => '- ' + rule),
      ].join('\n'),
    props.length > 0 && '## Props\n' + props.join('\n\n'),
    example && '## Example\n```tsx\n' + example + '\n```',
  ]
    .filter(Boolean)
    .join('\n\n');
}
