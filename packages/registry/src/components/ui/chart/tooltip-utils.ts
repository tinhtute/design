/**
 * Adapted from cloudflare/kumo (MIT), commit a5800aa3c484ebc58788dce6a0d5eabfd6c00dcf.
 */

export const defaultValueFormat = (value: number) => value.toLocaleString();

/** Escape HTML special characters to prevent XSS in default tooltips. */
export const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
