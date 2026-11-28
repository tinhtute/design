type NavItem = readonly [id: string, label: string];

// Each group answers one question about the item; no catch-all group.
export const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Action',
    items: [
      ['button', 'Button'],
      ['button-group', 'Button group'],
      ['toolbar', 'Toolbar'],
      ['link', 'Link'],
      ['clipboard-text', 'Clipboard text'],
      ['inline-copy-text', 'Inline copy text'],
    ],
  },
  {
    title: 'Form',
    items: [
      ['field', 'Field'],
      ['label', 'Label'],
      ['input', 'Input'],
      ['input-area', 'Input area'],
      ['input-group', 'Input group'],
      ['sensitive-input', 'Sensitive input'],
      ['tag-input', 'Tag input'],
    ],
  },
  {
    title: 'Selection',
    items: [
      ['checkbox', 'Checkbox'],
      ['radio', 'Radio'],
      ['switch', 'Switch'],
      ['slider', 'Slider'],
      ['select', 'Select'],
      ['combobox', 'Combobox'],
      ['autocomplete', 'Autocomplete'],
      ['date-picker', 'Date picker'],
      ['date-range-picker', 'Date range picker'],
    ],
  },
  {
    title: 'Display',
    items: [
      ['text', 'Text'],
      ['code', 'Code'],
      ['badge', 'Badge'],
      ['meter', 'Meter'],
    ],
  },
  {
    title: 'Feedback',
    items: [
      ['banner', 'Banner'],
      ['empty', 'Empty'],
      ['loader', 'Loader'],
      ['toasty', 'Toasty'],
    ],
  },
  {
    title: 'Layout',
    items: [
      ['surface', 'Surface'],
      ['layer-card', 'Layer card'],
      ['collapsible', 'Collapsible'],
      ['grid', 'Grid'],
      ['page-header', 'Page header'],
    ],
  },
  {
    title: 'Navigation',
    items: [
      ['sidebar', 'Sidebar'],
      ['tabs', 'Tabs'],
      ['breadcrumbs', 'Breadcrumbs'],
      ['pagination', 'Pagination'],
      ['menubar', 'Menu bar'],
      ['command-palette', 'Command palette'],
      ['table-of-contents', 'Table of contents'],
    ],
  },
  {
    title: 'Overlay',
    items: [
      ['dialog', 'Dialog'],
      ['layer-dialog', 'Layer dialog'],
      ['popover', 'Popover'],
      ['tooltip', 'Tooltip'],
      ['dropdown-menu', 'Dropdown menu'],
    ],
  },
  {
    title: 'Data',
    items: [
      ['table', 'Table'],
      ['chart', 'Chart'],
      ['timeseries-chart', 'Timeseries chart'],
      ['sankey-chart', 'Sankey chart'],
      ['bubble-map', 'Bubble map'],
      ['choropleth-map', 'Choropleth map'],
      ['globe-map', 'Globe map'],
    ],
  },
  {
    title: 'Patterns',
    items: [
      ['data-table', 'Data table'],
      ['filter-bar', 'Filter bar'],
      ['dashboard', 'Dashboard'],
      ['resource-list-page', 'Resource list page'],
      ['delete-resource', 'Delete resource'],
      ['file-upload', 'File upload'],
    ],
  },
];
