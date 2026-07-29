import { r as __toESM } from "../_runtime.mjs";
import { P as require_react, _ as require_jsx_runtime, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Card, t as Badge } from "./Badge-kOKntVae.mjs";
import { c as verses, o as models } from "./catalog-CJAtBXtA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/compare-CAguvZAA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ComparePage() {
	const [a, setA] = (0, import_react.useState)("baja");
	const [b, setB] = (0, import_react.useState)("mesoamerica");
	const [c, setC] = (0, import_react.useState)("");
	const selected = (0, import_react.useMemo)(() => [
		a,
		b,
		c
	].filter(Boolean), [
		a,
		b,
		c
	]);
	const rows = verses.map((v) => {
		const claims = selected.map((mid) => v.modelClaims.find((cl) => cl.modelId === mid) ?? null);
		if (claims.every((x) => x === null)) return null;
		return {
			verse: v,
			claims
		};
	}).filter(Boolean);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-3xl font-semibold",
					children: "Compare models"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-ink-soft",
					children: "Pick two or three models. Only verses that have at least one selected claim appear."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					{
						label: "Model A",
						value: a,
						set: setA
					},
					{
						label: "Model B",
						value: b,
						set: setB
					},
					{
						label: "Model C (optional)",
						value: c,
						set: setC
					}
				].map((ctl) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-sm space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: ctl.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: ctl.value,
						onChange: (e) => ctl.set(e.target.value),
						className: "w-full rounded-[var(--radius)] border border-border bg-surface px-3 py-2.5",
						children: [ctl.label.includes("optional") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "— none —"
						}), models.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: m.id,
							children: m.name
						}, m.id))]
					})]
				}, ctl.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [rows.map(({ verse, claims }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4 md:p-5 space-y-3 overflow-x-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/verses/$verseId",
							params: { verseId: verse.id },
							className: "font-semibold text-accent hover:underline",
							children: [
								verse.book,
								" ",
								verse.chapter,
								":",
								verse.verseStart
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "scripture text-sm line-clamp-2",
							children: verse.textExcerpt
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-3",
							style: { gridTemplateColumns: `repeat(${selected.length}, minmax(12rem, 1fr))` },
							children: claims.map((cl, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-[var(--radius)] border border-border bg-surface-2/50 p-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "label-claim mb-1",
									children: selected[i]
								}), cl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-ink",
									children: cl.claim
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "claim",
									className: "mt-2",
									children: cl.confidence
								})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted italic",
									children: "No claim in seed catalog"
								})]
							}, i))
						})
					]
				}, verse.id)), rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted text-center py-8",
					children: "No overlapping claims in the seed set."
				})]
			})
		]
	});
}
//#endregion
export { ComparePage as component };
