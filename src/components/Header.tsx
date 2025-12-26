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
    <header className="border-b border-white/10 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            <a
              href="/"
              aria-label="Domů"
              title="Domů"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 p-2 shadow-sm backdrop-blur hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <Image
                src={AppLogo as StaticImageData}
                alt="Logo aplikace"
                width={32}
                height={32}
                className="h-7 w-7"
                priority={false}
              />
            </a>

            <span>{title}</span>
          </h1>

          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm text-white/80 md:text-base">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
