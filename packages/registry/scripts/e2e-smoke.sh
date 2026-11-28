#!/usr/bin/env bash
#
# e2e-smoke.sh — prove a fresh consumer can install the full @therealtinhtute/design
# catalog from the locally built registry and render it with the theme.
#
# Flow: build+validate the registry -> exact-set of 63 names -> serve public/
# -> isolated add of button/badge/dialog/chart each in a fresh consumer
# -> full-set add in the main consumer -> build -> CSS + license + lockfile
# asserts -> SSR render-check.
#
# Requires: pnpm, node, python3, jq. Network access for consumer deps.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
REGISTRY_PUBLIC="$ROOT/packages/registry/public"
SCRIPTS_DIR="$ROOT/packages/registry/scripts"
SHADCN=(pnpm --filter @therealtinhtute/registry exec shadcn)
PORT="${E2E_PORT:-8791}"
BASE_URL="http://127.0.0.1:$PORT/r"
WORK="$(mktemp -d /tmp/therealtinhtute-e2e.XXXXXX)"
CONSUMER="$WORK/consumer"
BASE_CONSUMER="$WORK/base"
SERVER_PID=""
FAILED=0

EXPECTED_NAMES=(
  autocomplete
  badge
  banner
  breadcrumbs
  bubble-map
  button
  button-group
  chart
  checkbox
  choropleth-map
  clipboard-text
  code
  collapsible
  combobox
  command-palette
  dashboard
  data-table
  date-picker
  date-range-picker
  delete-resource
  dialog
  dropdown-menu
  empty
  field
  file-upload
  filter-bar
  globe-map
  grid
  inline-copy-text
  input
  input-area
  input-group
  label
  layer-card
  layer-dialog
  link
  loader
  menubar
  meter
  page-header
  pagination
  popover
  radio
  resource-list-page
  sankey-chart
  select
  sensitive-input
  sidebar
  slider
  surface
  switch
  table
  table-of-contents
  tabs
  tag-input
  text
  theme-default
  third-party-licenses
  timeseries-chart
  toasty
  toolbar
  tooltip
  utils
)

step() { printf '\n== %s ==\n' "$*"; }
ok() { printf 'OK   %s\n' "$*"; }
fail() { printf 'FAIL %s\n' "$*"; FAILED=$((FAILED + 1)); }

cleanup() {
  if [ -n "$SERVER_PID" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
  rm -rf "$WORK"
}
trap cleanup EXIT

scaffold_consumer() {
  local dest="$1"
  mkdir -p "$dest/src"
  cat > "$dest/pnpm-workspace.yaml" <<'EOF'
allowBuilds:
  esbuild: true
EOF


  cat > "$dest/package.json" <<'EOF'
{
  "name": "therealtinhtute-e2e-consumer",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "vite build"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.0",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.1.0",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "vite": "^6.0.5"
  }
}
EOF

  cat > "$dest/tsconfig.json" <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
EOF

  cat > "$dest/vite.config.ts" <<'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
EOF

  cat > "$dest/index.html" <<'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>e2e consumer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

  cat > "$dest/src/globals.css" <<'EOF'
@import "tailwindcss";
EOF

  cat > "$dest/components.json" <<'EOF'
{
  "$schema": "https://ui.shadcn.com/schema/config.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
EOF

  cat > "$dest/src/main.tsx" <<'EOF'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div>ok</div>
  </StrictMode>,
);
EOF
}

write_isolated_main() {
  local dest="$1"
  local item="$2"
  case "$item" in
    button)
      cat > "$dest/src/main.tsx" <<'EOF'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import { Button } from "@/components/ui/button";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Button>Click me</Button>
  </StrictMode>,
);
EOF
      ;;
    badge)
      cat > "$dest/src/main.tsx" <<'EOF'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import { Badge } from "@/components/ui/badge";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Badge>v1</Badge>
  </StrictMode>,
);
EOF
      ;;
    dialog)
      cat > "$dest/src/main.tsx" <<'EOF'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import { Dialog } from "@/components/ui/dialog";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div>{String(!!Dialog)}</div>
  </StrictMode>,
);
EOF
      ;;
    chart)
      cat > "$dest/src/main.tsx" <<'EOF'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import { Chart } from "@/components/ui/chart";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div>{String(!!Chart)}</div>
  </StrictMode>,
);
EOF
      ;;
    *)
      echo "unknown isolated item: $item" >&2
      return 1
      ;;
  esac
}

# --- 1. build + validate the registry artifact ------------------------------
step "build + validate registry"
pnpm --filter @therealtinhtute/registry validate
pnpm --filter @therealtinhtute/registry build
pnpm --filter @therealtinhtute/registry validate:build >/dev/null
ok "registry built + schema-validated"

# --- 2. exact-set of 63 names ----------------------------------------------
step "exact-set: 63 registry names"
BUILT_REGISTRY="$REGISTRY_PUBLIC/r/registry.json"
if [ ! -f "$BUILT_REGISTRY" ]; then
  fail "missing $BUILT_REGISTRY"
  exit 1
fi
GOT_SORTED="$(jq -r '.items[].name' "$BUILT_REGISTRY" | LC_ALL=C sort)"
EXP_SORTED="$(printf '%s\n' "${EXPECTED_NAMES[@]}" | LC_ALL=C sort)"
if [ "$GOT_SORTED" = "$EXP_SORTED" ]; then
  ok "public/r/registry.json names = 63 catalog set"
else
  fail "public/r/registry.json names do not equal the 63-name catalog set"
  printf 'missing:\n'
  comm -23 <(printf '%s\n' "$EXP_SORTED") <(printf '%s\n' "$GOT_SORTED") || true
  printf 'extra:\n'
  comm -13 <(printf '%s\n' "$EXP_SORTED") <(printf '%s\n' "$GOT_SORTED") || true
  exit 1
fi
if printf '%s\n' "$GOT_SORTED" | grep -qx 'card'; then
  fail "forbidden name present: card"
  exit 1
fi
if printf '%s\n' "$GOT_SORTED" | grep -qx 'kumo-badge'; then
  fail "forbidden name present: kumo-badge"
  exit 1
fi

# --- 3. serve the registry --------------------------------------------------
step "serve registry on :$PORT"
SERVER_LOG="$WORK/http-server.log"
python3 -m http.server "$PORT" --directory "$REGISTRY_PUBLIC" >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!
served=0
for _ in $(seq 1 20); do
  if curl -sf -o /dev/null "$BASE_URL/registry.json"; then
    served=1
    break
  fi
  sleep 0.2
done
if [ "$served" -eq 0 ]; then
  fail "registry http server did not become ready on :$PORT"
  cat "$SERVER_LOG" || true
  exit 1
fi
ok "registry served"

# --- 4. scaffold a reusable consumer base -----------------------------------
step "scaffold consumer base"
scaffold_consumer "$BASE_CONSUMER"
(cd "$BASE_CONSUMER" && pnpm install >/dev/null)
"${SHADCN[@]}" registry add "@therealtinhtute=$BASE_URL/{name}.json" --cwd "$BASE_CONSUMER"
ok "consumer base installed + registry registered"

# --- 5. isolated add: button, badge, dialog, chart --------------------------
step "isolated add (fresh consumer per item)"
for item in button badge dialog chart; do
  dest="$WORK/isolated-$item"
  cp -a "$BASE_CONSUMER" "$dest"
  if ! "${SHADCN[@]}" add \
    "@therealtinhtute/$item" \
    "@therealtinhtute/theme-default" \
    --cwd "$dest" -y; then
    fail "isolated add failed: $item"
    continue
  fi
  write_isolated_main "$dest" "$item"
  if (cd "$dest" && pnpm build >/dev/null); then
    ok "isolated $item consumer built"
  else
    fail "isolated $item consumer build failed"
  fi
done

# --- 6. main consumer: full catalog add -------------------------------------
step "scaffold main consumer + add all 63 items"
cp -a "$BASE_CONSUMER" "$CONSUMER"
ADD_ARGS=()
for name in "${EXPECTED_NAMES[@]}"; do
  ADD_ARGS+=("@therealtinhtute/$name")
done
"${SHADCN[@]}" add "${ADD_ARGS[@]}" --cwd "$CONSUMER" -y
ok "all 63 items added"

cat > "$CONSUMER/src/main.tsx" <<'EOF'
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FilterBar } from "@/components/filter-bar";
import { DataTable, type ColumnDef } from "@/components/data-table";
import { Dashboard } from "@/components/dashboard";

interface Row {
  id: string;
  name: string;
}

const columns: ColumnDef<Row>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
];

const rows: Row[] = [
  { id: "1", name: "Ada" },
  { id: "2", name: "Grace" },
];

function App() {
  const [dark, setDark] = useState(false);
  const [q, setQ] = useState("");
  return (
    <div className="bg-kumo-control">
      <Button
        variant="outline"
        onClick={() => {
          const next = !dark;
          setDark(next);
          document.documentElement.classList.toggle("dark", next);
        }}
      >
        Toggle theme
      </Button>
      <Badge>v1</Badge>
      <Badge variant="success" appearance="dot">
        Healthy
      </Badge>
      <Input placeholder="Enter text" aria-label="input" />
      <FilterBar value={q} onValueChange={setQ} filterLabel="Apply filter" />
      <DataTable columns={columns} data={rows} />
      <Dashboard />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
EOF

# --- 7. assert installed files + forbidden paths ----------------------------
step "assert installed files"
expected_files=(
  "src/components/ui/button.tsx"
  "src/components/ui/badge.tsx"
  "src/components/ui/dialog.tsx"
  "src/lib/utils.ts"
)
for f in "${expected_files[@]}"; do
  if [ -f "$CONSUMER/$f" ]; then
    ok "file present: $f"
  else
    fail "missing file: $f"
  fi
done
LICENSE_FILE=""
if [ -f "$CONSUMER/THIRD_PARTY_LICENSES.md" ]; then
  LICENSE_FILE="$CONSUMER/THIRD_PARTY_LICENSES.md"
elif [ -f "$CONSUMER/src/THIRD_PARTY_LICENSES.md" ]; then
  LICENSE_FILE="$CONSUMER/src/THIRD_PARTY_LICENSES.md"
fi
if [ -n "$LICENSE_FILE" ]; then
  ok "file present: ${LICENSE_FILE#"$CONSUMER/"}"
else
  fail "missing file: THIRD_PARTY_LICENSES.md"
fi

if [ -f "$CONSUMER/src/components/ui/card.tsx" ]; then
  fail "forbidden file present: src/components/ui/card.tsx"
else
  ok "no card.tsx"
fi
if [ -e "$CONSUMER/src/components/kumo" ]; then
  fail "forbidden path present: src/components/kumo"
else
  ok "no components/kumo"
fi

if [ -n "$LICENSE_FILE" ] && grep -q 'Copyright (c) 2026 Cloudflare, Inc.' "$LICENSE_FILE"; then
  ok "THIRD_PARTY_LICENSES.md contains Cloudflare MIT copyright"
else
  fail "THIRD_PARTY_LICENSES.md missing Copyright (c) 2026 Cloudflare, Inc."
fi

if grep -q '@cloudflare/kumo' "$CONSUMER/package.json" \
  || { [ -f "$CONSUMER/pnpm-lock.yaml" ] && grep -q '@cloudflare/kumo' "$CONSUMER/pnpm-lock.yaml"; }; then
  fail "@cloudflare/kumo present in consumer package.json or lockfile"
else
  ok "no @cloudflare/kumo in consumer package.json/lockfile"
fi

# --- 8. build the consumer ---------------------------------------------------
step "build consumer"
(cd "$CONSUMER" && pnpm build >/dev/null)
ok "consumer build passed"

# --- 9. assert :root (light) + .dark token blocks in built CSS ---------------
step "assert theme tokens in built CSS"
CSS_FILE="$(ls "$CONSUMER"/dist/assets/*.css | head -1)"
# Expected values are read back from the theme the consumer just installed —
# never hardcode palette values here. LightningCSS normalizes oklch
# (lightness -> %, drops leading zeros, may suffix `deg`), so compare
# numerically via python3.
mapfile -t TOKEN_RESULTS < <(
  python3 - "$CONSUMER/src/globals.css" "$CSS_FILE" <<'PY'
import re, sys
src = open(sys.argv[1]).read()
built = open(sys.argv[2]).read()

def bg(css, sel):
    m = re.search(re.escape(sel) + r"\s*\{([^}]*)\}", css)
    inner = m.group(1) if m else ""
    m = re.search(r"--background:\s*([^;}]+)", inner)
    return m.group(1).strip() if m else None

def norm(v):
    m = re.match(
        r"oklch\(\s*([\d.]+)\s*(%?)\s+([\d.]+)\s+([\d.]+)\s*(?:deg)?\s*\)",
        v or "",
    )
    if not m:
        return v
    l = float(m.group(1)) / (100 if m.group(2) == "%" else 1)
    return f"{l:g} {float(m.group(3)):g} {float(m.group(4)):g}"

for sel, name in ((":root", ":root"), (".dark", ".dark")):
    exp, got = norm(bg(src, sel)), norm(bg(built, sel))
    verdict = "ok" if exp is not None and exp == got else "mismatch"
    print(f"{name}\t{verdict}\t{exp}\t{got}")
PY
)
if [ "${#TOKEN_RESULTS[@]}" -ne 2 ]; then
  fail "theme token extraction produced ${#TOKEN_RESULTS[@]}/2 results (python3 or globals.css missing)"
fi
for line in "${TOKEN_RESULTS[@]}"; do
  IFS=$'\t' read -r sel verdict exp got <<<"$line"
  if [ "$verdict" = "ok" ]; then
    ok "$sel --background = $got"
  else
    fail "$sel --background token missing or mismatched in built CSS (expected $exp, got $got)"
  fi
done
if grep -q -- '--kumo-brand' "$CSS_FILE"; then
  ok "runtime var --kumo-brand present"
else
  fail "--kumo-brand missing in built CSS"
fi
if grep -q -- 'bg-kumo-control' "$CSS_FILE"; then
  ok "kumo utility .bg-kumo-control compiled"
else
  fail "bg-kumo-control missing in built CSS"
fi

# --- 10. SSR render-check of installed components ---------------------------
step "render-check installed components (SSR)"
cp "$SCRIPTS_DIR/render-check.tsx" "$CONSUMER/src/render-check.tsx"
(cd "$CONSUMER" && pnpm exec tsx src/render-check.tsx)
ok "render-check passed"

# --- 11. summary -------------------------------------------------------------
printf '\n'
if [ "$FAILED" -gt 0 ]; then
  printf 'e2e-smoke: %d check(s) failed\n' "$FAILED"
  exit 1
fi
printf 'e2e-smoke: all checks passed\n'
