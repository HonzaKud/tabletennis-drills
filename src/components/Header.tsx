import Image, { StaticImageData } from "next/image";

import AppLogo from "@/assets/brand/tabletennis-logo.svg";

type Props = {
  /**
   * Main title displayed in the header.
   * Default is the full app name.
   */
  title?: string;

  /**
   * Optional subtitle displayed under the title.
   * Use this only when you really need extra explanation.
   */
  subtitle?: string;
};

export function Header({
  title = "Tréninková cvičení pro stolní tenis",
  subtitle,
}: Props) {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#0D2C56] via-[#14498A] to-[#1856A5] shadow-md">
      <div className="mx-auto flex max-w-6xl items-center px-5 py-3">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white md:text-2xl">
            <a
              href="/"
              aria-label="Domů"
              title="Domů"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 p-2 shadow-sm backdrop-blur transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <Image
                src={AppLogo as StaticImageData}
                alt="Logo aplikace"
                width={32}
                height={32}
                className="h-6 w-6"
                priority={false}
              />
            </a>

            <span>{title}</span>
          </h1>

          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm text-white/85 md:text-base">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
