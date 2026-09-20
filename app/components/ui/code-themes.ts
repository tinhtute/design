/**
 * Structural subset of Shiki's `ThemeRegistration` (from
 * `@shikijs/types`). Declared locally so the shipped component needs
 * no extra dependency beyond `shiki` + `@shikijs/langs`.
 */
export interface MonoSyntaxTheme {
  name: string;
  type: "light" | "dark";
  colors: Record<string, string>;
  tokenColors: Array<{
    scope: string | string[];
    settings: {
      foreground?: string;
      fontStyle?: string;
    };
  }>;
}

/**
 * mono syntax themes for Shiki — derived from the mono design tokens
 * (`app/app/theme.css`, light + dark).
 *
 * Mapping (both modes):
 * - comment            → muted foreground
 * - string / regexp    → success green
 * - keyword / storage  → brand blue
 * - numeric            → warning amber
 * - function           → info sky blue
 * - type / class       → badge purple
 * - constant / builtin → badge teal
 * - invalid            → danger crimson
 * - everything else    → default foreground
 *
 * Dark-mode purple/teal are lightness-tuned variants of the badge
 * purple/teal hues so syntax colors hold ≥ 4:1 contrast on the dark
 * surface (the raw token values are ~2.2:1 there).
 *
 * The themes ship as plain objects (no @shikijs/themes dependency);
 * `CodeBlock` renders them with `defaultColor: false`, so every token
 * carries `--shiki-light` / `--shiki-dark` CSS variables and the
 * design system's dark-mode switch re-colors blocks without JS.
 */

/** Light syntax theme — on the `--kumo-base` light surface. */
export const monoLightTheme = {
  name: "mono-light",
  type: "light",
  colors: {
    "editor.background": "#faf8f5",
    "editor.foreground": "#141414",
    "editor.lineNumber": "#444444",
    "editor.lineNumber.activeLineNumber": "#141414",
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#444444" },
    },
    {
      scope: [
        "string",
        "string.quoted",
        "string.template",
        "string.regexp",
        "punctuation.definition.string",
      ],
      settings: { foreground: "#006045" },
    },
    {
      scope: [
        "keyword",
        "keyword.control",
        "keyword.operator.new",
        "storage",
        "storage.type",
        "storage.modifier",
      ],
      settings: { foreground: "#124b68" },
    },
    {
      scope: ["constant.numeric", "constant.character.numeric"],
      settings: { foreground: "#bd6500" },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "support.macro",
        "meta.function-call",
      ],
      settings: { foreground: "#193cb8" },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "support.type",
        "support.class",
        "storage.type.primitive",
      ],
      settings: { foreground: "#9810fa" },
    },
    {
      scope: [
        "constant.language",
        "constant.character",
        "constant.other",
        "variable.language",
        "support.constant",
      ],
      settings: { foreground: "#058378" },
    },
    {
      scope: ["invalid", "invalid.illegal", "invalid.deprecated"],
      settings: { foreground: "#c10007" },
    },
    {
      scope: ["variable", "variable.other", "variable.parameter"],
      settings: { foreground: "#141414" },
    },
    {
      scope: ["keyword.operator", "punctuation", "punctuation.separator", "punctuation.terminator"],
      settings: { foreground: "#141414" },
    },
    {
      scope: ["entity.name.tag", "punctuation.definition.tag"],
      settings: { foreground: "#124b68" },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: { foreground: "#193cb8" },
    },
    {
      scope: ["constant.character.escape"],
      settings: { foreground: "#bd6500" },
    },
    {
      scope: ["meta.embedded", "markup.raw", "markup.inline.raw"],
      settings: { foreground: "#141414" },
    },
    {
      scope: ["markup.heading", "markup.bold"],
      settings: { foreground: "#141414", fontStyle: "bold" },
    },
  ],
} satisfies MonoSyntaxTheme;

/** Dark syntax theme — on the `--kumo-base` dark surface. */
export const monoDarkTheme = {
  name: "mono-dark",
  type: "dark",
  colors: {
    "editor.background": "#262624",
    "editor.foreground": "#c3c0b6",
    "editor.lineNumber": "#b7b5a9",
    "editor.lineNumber.activeLineNumber": "#c3c0b6",
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#b7b5a9" },
    },
    {
      scope: [
        "string",
        "string.quoted",
        "string.template",
        "string.regexp",
        "punctuation.definition.string",
      ],
      settings: { foreground: "#a4f4cf" },
    },
    {
      scope: [
        "keyword",
        "keyword.control",
        "keyword.operator.new",
        "storage",
        "storage.type",
        "storage.modifier",
      ],
      settings: { foreground: "#76acce" },
    },
    {
      scope: ["constant.numeric", "constant.character.numeric"],
      settings: { foreground: "#ff8904" },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "support.macro",
        "meta.function-call",
      ],
      settings: { foreground: "#51a2ff" },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "support.type",
        "support.class",
        "storage.type.primitive",
      ],
      settings: { foreground: "#bd6cff" },
    },
    {
      scope: [
        "constant.language",
        "constant.character",
        "constant.other",
        "variable.language",
        "support.constant",
      ],
      settings: { foreground: "#3dbbae" },
    },
    {
      scope: ["invalid", "invalid.illegal", "invalid.deprecated"],
      settings: { foreground: "#ff6467" },
    },
    {
      scope: ["variable", "variable.other", "variable.parameter"],
      settings: { foreground: "#c3c0b6" },
    },
    {
      scope: ["keyword.operator", "punctuation", "punctuation.separator", "punctuation.terminator"],
      settings: { foreground: "#c3c0b6" },
    },
    {
      scope: ["entity.name.tag", "punctuation.definition.tag"],
      settings: { foreground: "#76acce" },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: { foreground: "#51a2ff" },
    },
    {
      scope: ["constant.character.escape"],
      settings: { foreground: "#ff8904" },
    },
    {
      scope: ["meta.embedded", "markup.raw", "markup.inline.raw"],
      settings: { foreground: "#c3c0b6" },
    },
    {
      scope: ["markup.heading", "markup.bold"],
      settings: { foreground: "#c3c0b6", fontStyle: "bold" },
    },
  ],
} satisfies MonoSyntaxTheme;
