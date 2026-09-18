import type { ComponentType } from "react";

import * as badge from "./badge";
import * as button from "./button";
import * as dialog from "./dialog";
import * as timeseriesChart from "./timeseries-chart";

export interface DemoModule {
  Demo: ComponentType;
  notes: string;
}

export const DEMOS: Record<string, DemoModule> = {
  badge,
  button,
  dialog,
  "timeseries-chart": timeseriesChart,
};
