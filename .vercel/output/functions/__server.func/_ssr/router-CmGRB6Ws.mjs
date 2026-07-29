import { _ as require_jsx_runtime, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRoute, l as useRouterState, m as createFileRoute, p as lazyRouteComponent, s as Scripts } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route$8 } from "../_insightId-C_CunEqk.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Route$9 } from "../_modelId-B7DrRTy5.mjs";
import { t as Route$10 } from "../_verseId-C1B8Tpqp.mjs";
import { a as Layers, c as BookOpen, i as Library, n as Map, o as House, r as Lightbulb, s as GitCompare } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CmGRB6Ws.js
var import_jsx_runtime = require_jsx_runtime();
var nav = [
	{
		to: "/",
		label: "Home",
		icon: House
	},
	{
		to: "/framework",
		label: "Framework",
		icon: Layers
	},
	{
		to: "/verses",
		label: "Verses",
		icon: BookOpen
	},
	{
		to: "/models",
		label: "Models",
		icon: Map
	},
	{
		to: "/insights",
		label: "Insights",
		icon: Lightbulb
	},
	{
		to: "/compare",
		label: "Compare",
		icon: GitCompare
	},
	{
		to: "/sources",
		label: "Sources",
		icon: Library
	}
];
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-2 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex h-9 w-9 items-center justify-center rounded-[var(--radius)] bg-accent text-accent-fg font-serif text-lg font-bold",
							children: "G"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "truncate font-semibold text-ink leading-tight",
								children: "BoM Geography Atlas"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "truncate text-xs text-muted",
								children: "Dual-track evidence · weigh the models"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "hidden md:flex items-center gap-1",
						children: nav.map((item) => {
							const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(item.to + "/");
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								className: cn("inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors", active ? "bg-surface-2 text-accent font-medium" : "text-ink-soft hover:bg-surface-2 hover:text-ink"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" }), item.label]
							}, item.to);
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "md:hidden flex gap-1 overflow-x-auto px-3 pb-2",
					children: nav.map((item) => {
						const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(item.to + "/");
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.to,
							className: cn("shrink-0 rounded-full px-3 py-1.5 text-xs border transition-colors", active ? "border-accent bg-accent text-accent-fg" : "border-border bg-surface text-ink-soft"),
							children: item.label
						}, item.to);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 mx-auto w-full max-w-6xl px-4 py-6 md:py-10",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-border bg-surface-2/60",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-6xl px-4 py-6 text-sm text-muted flex flex-col md:flex-row gap-2 md:items-center md:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Comparative catalog — model claims and independent insights kept separate." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs",
						children: "GitHub: EzrasEagle/bom-geography-research · Drive backup: BoM Geography Research"
					})]
				})
			})
		]
	});
}
var styles_default = "/assets/styles-CWL3JCr6.css";
var Route$7 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "BoM Geography Atlas — Dual-track research" },
			{
				name: "description",
				content: "Verse-by-verse Book of Mormon geography catalog with model comparisons and independent insights."
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}, {
			rel: "stylesheet",
			href: "https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap"
		}]
	}),
	component: RootComponent
});
function RootComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
var $$splitComponentImporter$6 = () => import("./routes-IYf7cU6C.mjs");
var Route$6 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./compare-CAguvZAA.mjs");
var Route$5 = createFileRoute("/compare")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./framework-3h5hAej0.mjs");
var Route$4 = createFileRoute("/framework")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./sources-CGiQMBLs.mjs");
var Route$3 = createFileRoute("/sources")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./insights-GKtyz1TE.mjs");
var Route$2 = createFileRoute("/insights/")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./models-CqxEDuIz.mjs");
var Route$1 = createFileRoute("/models/")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./verses-9Aq37tWt.mjs");
var Route = createFileRoute("/verses/")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$6.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$7
});
var CompareRoute = Route$5.update({
	id: "/compare",
	path: "/compare",
	getParentRoute: () => Route$7
});
var FrameworkRoute = Route$4.update({
	id: "/framework",
	path: "/framework",
	getParentRoute: () => Route$7
});
var SourcesRoute = Route$3.update({
	id: "/sources",
	path: "/sources",
	getParentRoute: () => Route$7
});
var InsightsIndexRoute = Route$2.update({
	id: "/insights/",
	path: "/insights/",
	getParentRoute: () => Route$7
});
var InsightsInsightIdRoute = Route$8.update({
	id: "/insights/$insightId",
	path: "/insights/$insightId",
	getParentRoute: () => Route$7
});
var ModelsIndexRoute = Route$1.update({
	id: "/models/",
	path: "/models/",
	getParentRoute: () => Route$7
});
var ModelsModelIdRoute = Route$9.update({
	id: "/models/$modelId",
	path: "/models/$modelId",
	getParentRoute: () => Route$7
});
var VersesIndexRoute = Route.update({
	id: "/verses/",
	path: "/verses/",
	getParentRoute: () => Route$7
});
var rootRouteChildren = {
	IndexRoute,
	CompareRoute,
	FrameworkRoute,
	SourcesRoute,
	InsightsInsightIdRoute,
	ModelsModelIdRoute,
	VersesVerseIdRoute: Route$10.update({
		id: "/verses/$verseId",
		path: "/verses/$verseId",
		getParentRoute: () => Route$7
	}),
	InsightsIndexRoute,
	ModelsIndexRoute,
	VersesIndexRoute
};
var routeTree = Route$7._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
	return createRouter({
		routeTree,
		defaultPreload: "intent"
	});
}
//#endregion
export { getRouter };
