"use client";

import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";

export const notes =
  "Calendar date picker built on react-day-picker. `mode` selects single, multiple, or range; control the value with `selected` + `onChange`. Days are keyboard navigable.";

export function Demo() {
  const [date, setDate] = useState<Date>();

  return <DatePicker mode="single" selected={date} onChange={setDate} />;
}
