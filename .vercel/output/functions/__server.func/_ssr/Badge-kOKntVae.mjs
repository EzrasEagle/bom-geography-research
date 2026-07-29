import { _ as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Badge-kOKntVae.js
var import_jsx_runtime = require_jsx_runtime();
function Card({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-[var(--radius-lg)] border border-border bg-surface shadow-[0_1px_0_rgba(28,25,23,0.04),0_8px_24px_rgba(28,25,23,0.04)]", className),
		children
	});
}
function Badge({ children, tone = "default", className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border", tone === "default" && "bg-chip border-border text-ink-soft", tone === "claim" && "bg-sky-50 border-sky-200 text-claim", tone === "insight" && "bg-lime-50 border-lime-200 text-insight", tone === "accent" && "bg-orange-50 border-orange-200 text-accent", tone === "teal" && "bg-teal-soft border-teal/20 text-teal", className),
		children
	});
}
//#endregion
export { Card as n, Badge as t };
