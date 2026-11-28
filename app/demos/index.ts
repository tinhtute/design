import type { ComponentType } from 'react';

import * as autocomplete from './autocomplete';
import * as badge from './badge';
import * as banner from './banner';
import * as breadcrumbs from './breadcrumbs';
import * as bubbleMap from './bubble-map';
import * as button from './button';
import * as buttonGroup from './button-group';
import * as chart from './chart';
import * as checkbox from './checkbox';
import * as choroplethMap from './choropleth-map';
import * as clipboardText from './clipboard-text';
import * as code from './code';
import * as collapsible from './collapsible';
import * as combobox from './combobox';
import * as commandPalette from './command-palette';
import * as dashboard from './dashboard';
import * as dataTable from './data-table';
import * as datePicker from './date-picker';
import * as dateRangePicker from './date-range-picker';
import * as deleteResource from './delete-resource';
import * as dialog from './dialog';
import * as dropdownMenu from './dropdown-menu';
import * as empty from './empty';
import * as field from './field';
import * as fileUpload from './file-upload';
import * as filterBar from './filter-bar';
import * as globeMap from './globe-map';
import * as grid from './grid';
import * as inlineCopyText from './inline-copy-text';
import * as input from './input';
import * as inputArea from './input-area';
import * as inputGroup from './input-group';
import * as label from './label';
import * as layerCard from './layer-card';
import * as layerDialog from './layer-dialog';
import * as link from './link';
import * as loader from './loader';
import * as menubar from './menubar';
import * as meter from './meter';
import * as pageHeader from './page-header';
import * as pagination from './pagination';
import * as popover from './popover';
import * as radio from './radio';
import * as resourceListPage from './resource-list-page';
import * as sankeyChart from './sankey-chart';
import * as select from './select';
import * as sensitiveInput from './sensitive-input';
import * as sidebar from './sidebar';
import * as slider from './slider';
import * as surface from './surface';
import * as switch_ from './switch';
import * as table from './table';
import * as tableOfContents from './table-of-contents';
import * as tabs from './tabs';
import * as tagInput from './tag-input';
import * as text from './text';
import * as timeseriesChart from './timeseries-chart';
import * as toasty from './toasty';
import * as toolbar from './toolbar';
import * as tooltip from './tooltip';

export interface DemoModule {
  Demo: ComponentType;
  notes: string;
  /** Extra registry items the demo imports beyond the featured item's registryDependencies */
  deps?: string[];
}

export const DEMOS: Record<string, DemoModule> = {
  autocomplete,
  badge,
  banner,
  breadcrumbs,
  'bubble-map': bubbleMap,
  button,
  'button-group': buttonGroup,
  chart,
  checkbox,
  'choropleth-map': choroplethMap,
  'clipboard-text': clipboardText,
  code,
  collapsible,
  combobox,
  'command-palette': commandPalette,
  dashboard,
  'data-table': dataTable,
  'date-picker': datePicker,
  'date-range-picker': dateRangePicker,
  'delete-resource': deleteResource,
  dialog,
  'dropdown-menu': dropdownMenu,
  empty,
  field,
  'file-upload': fileUpload,
  'filter-bar': filterBar,
  'globe-map': globeMap,
  grid,
  'inline-copy-text': inlineCopyText,
  input,
  'input-area': inputArea,
  'input-group': inputGroup,
  label,
  'layer-card': layerCard,
  'layer-dialog': layerDialog,
  link,
  loader,
  menubar,
  meter,
  'page-header': pageHeader,
  pagination,
  popover,
  radio,
  'resource-list-page': resourceListPage,
  'sankey-chart': sankeyChart,
  select,
  'sensitive-input': sensitiveInput,
  sidebar,
  slider,
  surface,
  switch: switch_,
  table,
  'table-of-contents': tableOfContents,
  tabs,
  'tag-input': tagInput,
  text,
  'timeseries-chart': timeseriesChart,
  toasty,
  toolbar,
  tooltip,
};
