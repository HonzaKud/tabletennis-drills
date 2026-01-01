import Image, { StaticImageData } from "next/image";

import AppLogo from "@/assets/brand/tabletennis-logo.svg";

type Props = {
  /**
   * Visual size preset for consistent use across the app.
   * - "hero" is the default for the landing page center logo.
   */
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
};

function sizeClasses(size: NonNullable<Props["size"]>) {
  switch (size) {
    case "sm":
      return { box: "h-20 w-20" };
    case "md":
      return { box: "h-32 w-32" };
    case "lg":
      return { box: "h-44 w-44 md:h-52 md:w-52" };
    case "hero":
    default:
      return { box: "h-56 w-56 md:h-72 md:w-72" };
  }
}

export function HeroLogo({ size = "hero", className }: Props) {
  const s = sizeClasses(size);

  return (
    <section
      aria-label="Hlavní logo aplikace"
      className={[
        // Keep the original "card" spacing, but make it visually invisible.
        "w-full max-w-2xl rounded-2xl border border-transparent bg-transparent p-8 text-center shadow-none",
        className ?? "",
      ].join(" ")}
    >
      <div className={["mx-auto grid place-items-center", s.box].join(" ")} aria-hidden="true">
        <Image
          src={AppLogo as StaticImageData}
          alt="Logo aplikace TableTennis Drills"
          width={1024}
          height={1024}
          className="select-none h-full w-full object-contain"
          priority={false}
        />
      </div>
    </section>
  );
}
