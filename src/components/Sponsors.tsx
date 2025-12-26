import Image, { StaticImageData } from "next/image";

import SponsorDDM from "@/assets/sponsors/sponzor-ddm.svg";
import SponsorMestoVlasim from "@/assets/sponsors/sponzor-mesto-vlasim.svg";
import SponsorFirma from "@/assets/sponsors/sponzor-firma.svg";

type Sponsor = {
  id: string;
  name: string;
  logo: StaticImageData;
  href?: string;
};

const DEFAULT_SPONSORS: Sponsor[] = [
  { id: "ddm", name: "DDM", logo: SponsorDDM },
  { id: "mesto-vlasim", name: "Město Vlašim", logo: SponsorMestoVlasim },
  { id: "firma", name: "Partner", logo: SponsorFirma },
];

type Props = {
  title?: string;
  sponsors?: Sponsor[];
};

export function Sponsors({
  title = "Projekt podporují",
  sponsors = DEFAULT_SPONSORS,
}: Props) {
  return (
    <section
      aria-label={title}
      className="mt-10 rounded-2xl border border-gray-100 bg-white p-6"
    >
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {sponsors.map((s) => {
          const logo = (
            <Image
              src={s.logo}
              alt={s.name}
              width={220}
              height={90}
              className="h-12 w-auto"
              priority={false}
            />
          );

          return s.href ? (
            <a
              key={s.id}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center rounded-xl border border-gray-100 bg-white px-4 py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-100"
              aria-label={s.name}
              title={s.name}
            >
              {logo}
            </a>
          ) : (
            <div
              key={s.id}
              className="flex items-center justify-center rounded-xl border border-gray-100 bg-white px-4 py-3"
              aria-label={s.name}
              title={s.name}
            >
              {logo}
            </div>
          );
        })}
      </div>
    </section>
  );
}
