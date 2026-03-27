import { Sparkles, Truck, Star } from "lucide-react";

const values = [
  { icon: Truck, label: "Envío a todo el país " },
  { icon: Star, label: "Calidad garantizada " },
];

export function HeroSection({ total }: { total: number }) {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fdf6f3] via-[#f8ece8] to-[#f0dbd5] py-16 sm:py-24">
        {/* Decorative blobs */}
        <div
          className="animate-float pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-[#ead7d1]/40 blur-3xl"
          aria-hidden
        />
        <div
          className="animate-float-slow pointer-events-none absolute bottom-0 -left-20 h-56 w-56 rounded-full bg-[#d4b5ae]/30 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 text-center">
          {/* Badge */}
          <div
            className="animate-fade-in-up mb-5 inline-flex items-center gap-2 rounded-full border border-[#e7d3cc] bg-white/70 px-4 py-2 text-xs font-medium text-[#8b5e57] backdrop-blur-sm"
            style={{ animationDelay: "0.05s" }}
          >
            <Sparkles className="size-3.5" />
            Colección exclusiva · {total} productos disponibles
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-in-up animate-shimmer-text text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "0.15s" }}
          >
            Belleza serena,
            <br />
            estilo eterno
          </h1>

          {/* Subtitle */}
          <p
            className="animate-fade-in-up mx-auto mt-5 max-w-xl text-base text-[#6f5a56] sm:text-lg"
            style={{ animationDelay: "0.25s" }}
          >
            Descubre productos seleccionados para resaltar tu estilo con una
            esencia femenina, elegante y atemporal.
          </p>

          {/* CTA */}
          <div
            className="animate-fade-in-up mt-8"
            style={{ animationDelay: "0.35s" }}
          >
            <a
              href="#catalogo"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#6f4b46] px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#5a3c38] hover:shadow-md active:scale-95"
            >
              Ver catálogo
            </a>
          </div>
        </div>
      </section>

      {/* Values bar */}
      <div className="border-y border-[#ead7d1] bg-white/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ul className="flex divide-x divide-[#ead7d1]">
            {values.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex flex-1 items-center justify-center gap-2 py-3.5 text-xs font-medium text-[#6f5a56] sm:text-sm"
              >
                <Icon className="size-4 text-[#b9877d] shrink-0" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(" ")[0]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
