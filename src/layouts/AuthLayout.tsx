import { Outlet } from "react-router-dom";

const GRADIENT_STYLE = {
  background: "linear-gradient(135deg, #0C3356 0%, #1A70BC 100%)",
};

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left column: logo + form (Outlet) – 50% */}
      <div className="flex-1 flex flex-col w-full lg:w-1/2 px-6 sm:px-12 pt-10 pb-12 lg:pt-[134px] lg:pl-[76px] lg:pr-16">
        {/* ESI logo placeholder – replace src with public/logo-esi.png when asset is available */}
        <div className="mb-12">
          <img
            src="/logo-esi.png"
            alt="ESI"
            className="h-[72px] w-[173px] object-contain object-left"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              const fallback = target.nextElementSibling;
              if (fallback) (fallback as HTMLElement).style.display = "block";
            }}
          />
          <div
            className="h-[72px] w-[173px] bg-[#182B45] rounded flex items-center justify-center text-white font-semibold text-lg"
            style={{ display: "none" }}
            aria-hidden
          >
            ESI
          </div>
        </div>
        <Outlet />
      </div>

      {/* Right column: gradient panel + illustration + tagline – 50% (hidden on small viewports) */}
      <div
        className="hidden lg:flex lg:w-1/2 min-h-[50vh] lg:min-h-screen flex-col items-center justify-center px-8 py-12 text-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
        style={GRADIENT_STYLE}
      >
        {/* Illustration placeholder – replace src with public/login-illustration.png when asset is available */}
        <img
          src="/login-illustration.png"
          alt=""
          className="w-[280px] h-[280px] xl:w-[368px] xl:h-[368px] object-contain mb-8"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = "none";
            const fallback = target.nextElementSibling;
            if (fallback) (fallback as HTMLElement).style.display = "flex";
          }}
        />
        <div
          className="w-[280px] h-[280px] xl:w-[368px] xl:h-[368px] rounded-lg bg-white/10 flex items-center justify-center mb-8"
          style={{ display: "none" }}
          aria-hidden
        />
        <p className="text-center text-xl xl:text-2xl font-bold max-w-[656px] leading-snug">
          Gestion centralisée des encadrants de l&apos;ESI
        </p>
      </div>
    </div>
  );
}
