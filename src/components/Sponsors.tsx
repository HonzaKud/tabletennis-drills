import Image, { StaticImageData } from "next/image";

import SponsorDDM from "@/assets/sponsors/sponzor-ddm.svg";
import SponsorMestoVlasim from "@/assets/sponsors/sponzor-mesto-vlasim.svg";
import SponsorFirma from "@/assets/sponsors/sponzor-firma.svg";

type Sponsor = {
  id: string;
  name: string;
  logo: StaticImageData;
};

const DEFAULT_SPONSORS: Sponsor[] = [
  { id: "ddm", name: "DDM", logo: SponsorDDM },
  { id: "mesto-vlasim", name: "Město Vlašim", logo: SponsorMestoVlasim },
  { id: "firma", name: "Partner", logo: SponsorFirma },
];

export function Sponsors({
  title = "Projekt podporují",
  sponsors = DEFAULT_SPONSORS,
}: {
  title?: string;
  sponsors?: Sponsor[];
}) {
  return (
    <section
      aria-label={title}
      className="mt-10 rounded-2xl border border-gray-100 bg-white p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">
          Děkujeme partnerům a organizacím, díky kterým může projekt vznikat a růst.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {sponsors.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-center rounded-xl border border-gray-100 bg-white px-4 py-3"
          >
            <Image
              src={s.logo}
              alt={s.name}
              width={220}
              height={90}
              className="h-12 w-auto opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
              priority={false}
            />
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Loga jsou použita pro účely uvedení podpory projektu.
      </p>
    </section>
  );
}
