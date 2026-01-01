export function Footer() {
  return (
    <footer className="mt-10 border-t border-gray-100 pt-6 text-sm text-gray-500">
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:justify-between">
          {/* Left */}
          <span>© {new Date().getFullYear()} TableTennis Drills</span>

          {/* Center */}
          <span className="text-gray-400 md:absolute md:left-1/2 md:-translate-x-1/2">
            Vytvořil Jan Kudrna
          </span>

          {/* Right */}
          <span className="text-gray-400">
            MVP • Next.js + TypeScript • Data: JSON
          </span>
        </div>
      </div>
    </footer>
  );
}
