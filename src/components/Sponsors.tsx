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
  { id: "ddm", name: "DDM", logo: SponsorDDM, href: "https://www.google.com" },
  {
    id: "mesto-vlasim",
    name: "Město Vlašim",
    logo: SponsorMestoVlasim,
    href: "https://www.google.com",
  },
  {
    id: "firma",
    name: "Partner",
    logo: SponsorFirma,
    href: "https://www.google.com",
  },
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
      className="mt-10 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5"
    >
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {sponsors.map((s) => (
          <a
            key={s.id}
            href={s.href ?? "https://www.google.com"}
            target="_blank"
            rel="noreferrer"
            className={[
              "flex items-center justify-center",
              "rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm",
              "hover:bg-gray-50 hover:border-gray-300",
              "focus:outline-none focus:ring-2 focus:ring-blue-100",
              "transition",
            ].join(" ")}
            aria-label={s.name}
            title={s.name}
          >
            <Image
              src={s.logo}
              alt={s.name}
              width={240}
              height={96}
              className="h-12 w-auto select-none object-contain"
              priority={false}
            />
          </a>
        ))}
      </div>
    </section>
  );
}
