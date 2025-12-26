import Image, { StaticImageData } from "next/image";

import AppLogo from "@/assets/brand/tabletennis-logo.svg";

type Props = {
  /**
   * Visual size preset for consistent use across the app.
   * - "md" is a good default for the landing page.
   */
  size?: "sm" | "md" | "lg";

  /**
   * Optional title and subtitle rendered under the logo.
   * Keep these short and supportive (landing page only).
   */
  title?: string;
  subtitle?: string;

  className?: string;
};

function sizeClasses(size: NonNullable<Props["size"]>) {
  switch (size) {
    case "sm":
      return { box: "h-20 w-20", img: "h-16 w-auto" };
    case "lg":
      return { box: "h-32 w-32", img: "h-24 w-auto" };
    case "md":
    default:
      return { box: "h-28 w-28", img: "h-20 w-auto" };
  }
}

export function HeroLogo({
  size = "md",
  title = "Připraveno na trénink",
  subtitle = "Vyber filtry a klikni na Vyhledat. Pokud nic nevybereš, zobrazí se všechna cvičení.",
  className,
}: Props) {
  const s = sizeClasses(size);

  return (
    <section
      aria-label="Hlavní logo aplikace"
      className={[
        "w-full max-w-2xl rounded-2xl border border-gray-100 bg-white p-8 text-center",
        className ?? "",
      ].join(" ")}
    >
      <div
        className={["mx-auto grid place-items-center rounded-2xl bg-orange-50", s.box].join(" ")}
        aria-hidden="true"
      >
        <Image
          src={AppLogo as StaticImageData}
          alt="Logo aplikace TableTennis Drills"
          width={256}
          height={256}
          className={["select-none", s.img].join(" ")}
          priority={false}
        />
      </div>

      <h2 className="mt-4 text-base font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
    </section>
  );
}
