import { _ as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Card, t as Badge } from "./Badge-kOKntVae.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sources-CGiQMBLs.js
var import_jsx_runtime = require_jsx_runtime();
var external = [
	{
		group: "BoM geography code",
		items: [
			{
				name: "Map-BofM-Geography",
				url: "https://github.com/vwolfley/Map-BofM-Geography"
			},
			{
				name: "Book-of-Mormon-Geography (graph)",
				url: "https://github.com/BillPrisbrey/Book-of-Mormon-Geography"
			},
			{
				name: "book-of-mormon-geography-atlas",
				url: "https://github.com/StephenCranney/book-of-mormon-geography-atlas"
			},
			{
				name: "bom-map-constraints",
				url: "https://github.com/edwardsjohnmartin/bom-map-constraints"
			}
		]
	},
	{
		group: "Rivers & topography",
		items: [
			{
				name: "USGS National Hydrography (NHD)",
				url: "https://www.usgs.gov/national-hydrography"
			},
			{
				name: "HydroSHEDS",
				url: "https://www.hydrosheds.org/"
			},
			{
				name: "py3dep (USGS 3DEP)",
				url: "https://github.com/hyriver/py3dep"
			},
			{
				name: "American Whitewater wh2o-vue",
				url: "https://github.com/AmericanWhitewater/wh2o-vue"
			}
		]
	},
	{
		group: "Paleoclimate",
		items: [{
			name: "NOAA Paleoclimatology",
			url: "https://www.ncei.noaa.gov/products/paleoclimatology"
		}, {
			name: "paleoda_sa",
			url: "https://github.com/mchoblet/paleoda_sa"
		}]
	}
];
function SourcesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-3xl font-semibold",
					children: "Sources & external data"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-ink-soft",
					children: [
						"Bibliography seed plus tracked upstream repositories. Full machine-readable list:",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "bg-surface-2 px-1 rounded text-xs",
							children: "research/external/tracked-repos.yaml"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Bibliography (seed)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "text-sm text-ink-soft space-y-2 list-disc pl-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Sorenson, John L. An Ancient American Setting for the Book of Mormon. 1985." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Sorenson, John L. Mormon’s Codex. 2013." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Rosenvall Baja model materials (see model profile)." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "NPS Juan Bautista de Anza National Historic Trail materials." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "USGS NHD / HydroSHEDS documentation." })
					]
				})]
			}),
			external.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5 space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: g.group
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "tracked" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: g.items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: it.url,
						target: "_blank",
						rel: "noreferrer",
						className: "text-sm text-accent hover:underline",
						children: it.name
					}) }, it.url))
				})]
			}, g.group)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "p-5 text-sm text-muted space-y-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Integration policy: prefer official data downloads and thin adapters over vendoring multi-GB rasters. Document forks in research/external/forks.md and keep upstream URLs for future sync." })
			})
		]
	});
}
//#endregion
export { SourcesPage as component };
