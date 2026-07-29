import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const Route = createFileRoute("/sources")({ component: SourcesPage });

const external = [
  {
    group: "BoM geography code",
    items: [
      { name: "Map-BofM-Geography", url: "https://github.com/vwolfley/Map-BofM-Geography" },
      { name: "Book-of-Mormon-Geography (graph)", url: "https://github.com/BillPrisbrey/Book-of-Mormon-Geography" },
      { name: "book-of-mormon-geography-atlas", url: "https://github.com/StephenCranney/book-of-mormon-geography-atlas" },
      { name: "bom-map-constraints", url: "https://github.com/edwardsjohnmartin/bom-map-constraints" },
    ],
  },
  {
    group: "Rivers & topography",
    items: [
      { name: "USGS National Hydrography (NHD)", url: "https://www.usgs.gov/national-hydrography" },
      { name: "HydroSHEDS", url: "https://www.hydrosheds.org/" },
      { name: "py3dep (USGS 3DEP)", url: "https://github.com/hyriver/py3dep" },
      { name: "American Whitewater wh2o-vue", url: "https://github.com/AmericanWhitewater/wh2o-vue" },
    ],
  },
  {
    group: "Paleoclimate",
    items: [
      { name: "NOAA Paleoclimatology", url: "https://www.ncei.noaa.gov/products/paleoclimatology" },
      { name: "paleoda_sa", url: "https://github.com/mchoblet/paleoda_sa" },
    ],
  },
  {
    group: "Map / placement libraries (track)",
    items: [
      { name: "react-leaflet", url: "https://github.com/PaulLeCam/react-leaflet" },
      { name: "simcity-threejs-clone (UX only)", url: "https://github.com/dgreenheck/simcity-threejs-clone" },
      { name: "bom-map-constraints", url: "https://github.com/edwardsjohnmartin/bom-map-constraints" },
    ],
  },
];

function SourcesPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold">Sources & external data</h1>
        <p className="text-sm text-ink-soft">
          Bibliography seed plus tracked upstream repositories. Full machine-readable list:{" "}
          <code className="bg-surface-2 px-1 rounded text-xs">research/external/tracked-repos.yaml</code>
        </p>
      </div>

      <Card className="p-5 space-y-2">
        <h2 className="font-semibold">Bibliography (seed)</h2>
        <ul className="text-sm text-ink-soft space-y-2 list-disc pl-4">
          <li>Sorenson, John L. An Ancient American Setting for the Book of Mormon. 1985.</li>
          <li>Sorenson, John L. Mormon’s Codex. 2013.</li>
          <li>Rosenvall Baja model materials (see model profile).</li>
          <li>NPS Juan Bautista de Anza National Historic Trail materials.</li>
          <li>USGS NHD / HydroSHEDS documentation.</li>
        </ul>
      </Card>

      {external.map((g) => (
        <Card key={g.group} className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">{g.group}</h2>
            <Badge>tracked</Badge>
          </div>
          <ul className="space-y-2">
            {g.items.map((it) => (
              <li key={it.url}>
                <a
                  href={it.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-accent hover:underline"
                >
                  {it.name}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <Card className="p-5 text-sm text-muted space-y-2">
        <p>
          Integration policy: prefer official data downloads and thin adapters over vendoring multi-GB
          rasters. Full policy and tables: research/external/FORK_TRACKING.md and forks.md. City-builder
          repos (SimCity clones) are UX inspiration only—the core is constraint graphs + GIS.
        </p>
      </Card>
    </div>
  );
}
