#!/usr/bin/env bash
#
# e2e-smoke.sh — prove a fresh consumer can install every @therealtinhtute/ui
# MVP item from the locally built registry and render it with the theme.
#
# Flow: build+validate the registry -> serve public/ locally -> scaffold a temp
# Vite + React + TS + Tailwind v4 consumer -> `shadcn registry add
# @therealtinhtute=http://127.0.0.1:<port>/r/{name}.json` -> add all items by
# namespace -> build the consumer -> assert the built CSS carries both :root
# (light) and .dark token blocks -> SSR-render the installed components.
#
# Requires: pnpm, node, python3. Network access for consumer deps.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
REGISTRY_PUBLIC="$ROOT/packages/registry/public"
SCRIPTS_DIR="$ROOT/packages/registry/scripts"
SHADCN=(pnpm --filter @therealtinhtute/registry exec shadcn)
PORT="${E2E_PORT:-8791}"
BASE_URL="http://127.0.0.1:$PORT/r"
WORK="$(mktemp -d /tmp/therealtinhtute-e2e.XXXXXX)"
CONSUMER="$WORK/consumer"
SERVER_PID=""
FAILED=0

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

# --- 1. build + validate the registry artifact ------------------------------
step "build + validate registry"
pnpm --filter @therealtinhtute/registry build
pnpm --filter @therealtinhtute/registry validate:build >/dev/null
ok "registry built + schema-validated"

# --- 2. scaffold the consumer app -------------------------------------------
step "scaffold consumer app ($CONSUMER)"
mkdir -p "$CONSUMER/src"

cat > "$CONSUMER/package.json" <<'EOF'
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

cat > "$CONSUMER/tsconfig.json" <<'EOF'
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

cat > "$CONSUMER/vite.config.ts" <<'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
EOF

cat > "$CONSUMER/index.html" <<'EOF'
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

cat > "$CONSUMER/src/globals.css" <<'EOF'
@import "tailwindcss";
EOF

cat > "$CONSUMER/components.json" <<'EOF'
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

# Renders every installed component plus a dark-mode toggle.
cat > "$CONSUMER/src/main.tsx" <<'EOF'
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Badge as KumoBadge } from "@/components/kumo/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div>
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
      <KumoBadge variant="success" appearance="dot">Healthy</KumoBadge>
      <KumoBadge variant="outline">kumo outline</KumoBadge>
      <Input placeholder="Enter text" aria-label="input" />
      <FilterBar value={q} onValueChange={setQ} filterLabel="Apply filter" />
      <Card>
        <CardHeader>
          <CardTitle>Hello card</CardTitle>
        </CardHeader>
        <CardContent>card body</CardContent>
      </Card>
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

ok "consumer scaffold written"

# --- 3. install consumer base deps ------------------------------------------
step "install consumer deps"
(cd "$CONSUMER" && pnpm install >/dev/null)
ok "consumer deps installed"

# --- 4. serve the registry and register it ----------------------------------
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
  sleep 0.5
done
if [ "$served" -eq 0 ]; then
  fail "registry not reachable at $BASE_URL/registry.json"
  cat "$SERVER_LOG" >&2 || true
  exit 1
fi
ok "registry served"

step "register @therealtinhtute registry"
"${SHADCN[@]}" registry add "@therealtinhtute=$BASE_URL/{name}.json" --cwd "$CONSUMER"
ok "registry registered"

# --- 3b. assert served item payloads ----------------------------------------
for item in kumo-badge; do
  if curl -sf -o /dev/null -w '%{content_type}' "$BASE_URL/$item.json" | grep -q '^application/json'; then
    ok "/r/$item.json served as application/json"
  else
    fail "/r/$item.json missing or not JSON"
  fi
done

# --- 5. add all MVP items + theme -------------------------------------------
step "add MVP items: button card input badge data-table filter-bar dashboard kumo-badge + theme-default"
"${SHADCN[@]}" add \
  "@therealtinhtute/button" \
  "@therealtinhtute/card" \
  "@therealtinhtute/input" \
  "@therealtinhtute/badge" \
  "@therealtinhtute/filter-bar" \
  "@therealtinhtute/data-table" \
  "@therealtinhtute/dashboard" \
  "@therealtinhtute/kumo-badge" \
  "@therealtinhtute/theme-default" \
  --cwd "$CONSUMER" -y
ok "all items added"

# --- 6. assert installed files + deps ---------------------------------------
step "assert installed files"
expected_files=(
  "src/components/ui/button.tsx"
  "src/components/ui/input.tsx"
  "src/components/ui/badge.tsx"
  "src/components/ui/card.tsx"
  "src/components/data-table.tsx"
  "src/components/filter-bar.tsx"
  "src/components/dashboard.tsx"
  "src/lib/utils.ts"
  "src/components/kumo/badge.tsx"
  "src/components/kumo/resolve-variant.ts"
)
for f in "${expected_files[@]}"; do
  if [ -f "$CONSUMER/$f" ]; then
    ok "file present: $f"
  else
    fail "missing file: $f"
  fi
done

# --- 7. build the consumer ---------------------------------------------------
step "build consumer"
(cd "$CONSUMER" && pnpm build >/dev/null)
ok "consumer build passed"

# --- 8. assert :root (light) + .dark token blocks in built CSS ---------------
step "assert theme tokens in built CSS"
CSS_FILE="$(ls "$CONSUMER"/dist/assets/*.css | head -1)"
# Tailwind v4 (LightningCSS) normalizes oklch: oklch(1 0 0) -> oklch(100% 0 0).
if grep -qE -- ':root\{[^}]*--background:\s*oklch\((100%|1) 0 0\)' "$CSS_FILE"; then
  ok ":root --background = light oklch(100% 0 0)"
else
  fail ":root --background token missing in built CSS"
fi
if grep -qE -- '\.dark\{[^}]*--background:\s*oklch\((14\.5%|0\.145) 0 0\)' "$CSS_FILE"; then
  ok ".dark --background = dark oklch(14.5% 0 0)"
else
  fail ".dark --background token missing in built CSS"
fi
# kumo-compat bridge: runtime vars in both modes + utilities compiled from the
# Kumo class vocabulary (R2) rendered by main.tsx.
if grep -q -- '--kumo-brand' "$CSS_FILE"; then
  ok "kumo-compat runtime var --kumo-brand present"
else
  fail "kumo-compat runtime vars missing in built CSS"
fi
if grep -q -- 'bg-kumo-success' "$CSS_FILE"; then
  ok "kumo utility .bg-kumo-success compiled"
else
  fail "kumo utility classes missing in built CSS"
fi

# --- 9. SSR render-check of installed components -----------------------------
step "render-check installed components (SSR)"
cp "$SCRIPTS_DIR/render-check.tsx" "$CONSUMER/src/render-check.tsx"
(cd "$CONSUMER" && pnpm exec tsx src/render-check.tsx)
ok "render-check passed"

# --- 10. summary -------------------------------------------------------------
printf '\n'
if [ "$FAILED" -gt 0 ]; then
  printf 'e2e-smoke: %d check(s) failed\n' "$FAILED"
  exit 1
fi
printf 'e2e-smoke: all checks passed\n'
