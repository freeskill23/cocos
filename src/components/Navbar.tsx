import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { BRAND, NAV_LINKS } from "@/config/brand";
import { scrollToId } from "@/lib/router";

interface NavbarProps {
  onNavigate: (to: string) => void;
  currentPath: string;
}

export function Navbar({ onNavigate, currentPath }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      if (currentPath !== "/" && currentPath !== "") {
        onNavigate(`/#${id}`);
      } else {
        scrollToId(id);
      }
    } else {
      onNavigate(href);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || menuOpen
            ? "bg-ivory/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto max-w-8xl px-5 sm:px-8 lg:px-12">
          <div className="flex h-16 items-center justify-between md:h-20">
            <button
              onClick={() => handleNavClick("/")}
              className="flex flex-col items-start leading-none"
              aria-label="코코스퍼니쳐 홈"
            >
              <span className="text-base font-bold tracking-tight text-charcoal md:text-lg">
                {BRAND.nameEn}
              </span>
              <span className="text-[10px] font-medium tracking-[0.15em] text-charcoal-muted md:text-xs">
                {BRAND.nameKr}
              </span>
            </button>

            <div className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-sm font-medium text-charcoal-light transition-colors hover:text-charcoal"
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavClick("/custom")}
                className="hidden rounded-full bg-charcoal px-5 py-2.5 text-sm font-medium text-ivory transition-all hover:bg-charcoal-light active:scale-95 sm:inline-flex"
              >
                우리 아이 집 만들기
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex h-10 w-10 items-center justify-center text-charcoal md:hidden"
                aria-label="메뉴"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-ivory md:hidden">
          <div className="flex flex-col gap-2 px-6 py-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="rounded-xl px-4 py-4 text-left text-lg font-medium text-charcoal transition-colors hover:bg-birch-100"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => handleNavClick("/custom")}
              className="mt-4 rounded-full bg-charcoal px-5 py-4 text-center text-base font-medium text-ivory"
            >
              우리 아이 집 만들기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
