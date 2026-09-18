"use client";

import { useState } from "react";
import { Pagination } from "@/components/ui/pagination";

export const notes =
  "Page navigation for long lists and tables. Controlled via `page`/`setPage` with `perPage`/`totalCount` (or `hasNextPage` when the total is unknown); compose `Pagination.Info` and `Pagination.Controls`, which render a labelled `nav` landmark.";

export function Demo() {
  const [page, setPage] = useState(1);

  return (
    <Pagination page={page} setPage={setPage} perPage={10} totalCount={80}>
      <Pagination.Info />
      <Pagination.Controls />
    </Pagination>
  );
}
