"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, PlusCircle, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandWordmark } from "./brand-wordmark";

const navigationItems = [
  { label: "Как это работает", href: "/how-it-works" },
  { label: "Предметы", href: "/subjects" },
  { label: "Тарифы", href: "/pricing" },
  { label: "Примеры проверок", href: "/examples" },
  { label: "Отзывы", href: "/reviews" },
  { label: "Блог", href: "/blog" },
];

type HeaderUser = {
  id: string;
  email: string;
  name: string | null;
} | null;

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<HeaderUser>(null);
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });

        if (!response.ok) {
          if (!ignore) {
            setUser(null);
          }
          return;
        }

        const payload = (await response.json()) as { user: HeaderUser };

        if (!ignore) {
          setUser(payload.user);
        }
      } catch {
        if (!ignore) {
          setUser(null);
        }
      }
    }

    loadUser();

    return () => {
      ignore = true;
    };
  }, [pathname]);

  return (
    <>
      <header className="fixed left-0 top-0 z-40 w-full px-4 py-4 md:px-8">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-lg border border-white/15 bg-black/30 px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-xl md:px-5">
          <Link href="/" className="flex min-w-0 items-center gap-3 md:gap-4">
            <BrandWordmark
              logoClassName="h-14 w-14 md:h-16 md:w-16"
              textClassName="text-xl font-black tracking-normal md:text-2xl"
            />
            <span className="hidden max-w-28 text-xs font-semibold uppercase leading-tight tracking-normal text-white/70 sm:block">
              Персональная проверка 2 части ЕГЭ
            </span>
          </Link>

          <div className="hidden items-center gap-5 lg:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-bold text-white/72 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard/new"
                  className="animated-gradient-button inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-black text-white sm:px-4 md:px-5 md:text-sm"
                >
                  <PlusCircle size={16} />
                  <span className="hidden sm:inline">Новая проверка</span>
                  <span className="sm:hidden">Проверка</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/8 text-white transition-colors hover:border-[#7CFF8A] hover:text-[#7CFF8A]"
                  aria-label="Личный кабинет"
                  title="Личный кабинет"
                >
                  <UserRound size={18} />
                </Link>
              </>
            ) : (
              <>
                {!isLoginPage && (
                  <Link
                    href="/login"
                    className="rounded-md border border-white/15 px-3 py-2 text-xs font-bold text-white/78 transition-colors hover:border-white/40 hover:text-white md:px-4 md:text-sm"
                  >
                    Войти
                  </Link>
                )}
                <Link
                  href="/register"
                  className="animated-gradient-button hidden rounded-md px-4 py-2 text-sm font-black text-white sm:inline-flex md:px-5"
                >
                  Попробовать бесплатно
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setIsMenuOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white transition-colors hover:bg-white hover:text-black lg:hidden"
              aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.aside
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed left-4 right-4 top-24 z-50 rounded-lg border border-white/15 bg-black/78 p-4 shadow-2xl backdrop-blur-xl md:left-auto md:w-80"
          >
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-md px-3 py-3 text-sm font-bold text-white/82 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <div className="mt-3 grid gap-2">
                <Link
                  href="/dashboard/new"
                  onClick={() => setIsMenuOpen(false)}
                  className="animated-gradient-button flex items-center justify-center gap-2 rounded-md px-3 py-3 text-sm font-black text-white"
                >
                  <PlusCircle size={17} />
                  Новая проверка
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md border border-white/15 px-3 py-3 text-sm font-bold text-white/82 hover:bg-white/10 hover:text-white"
                >
                  <UserRound size={17} />
                  Личный кабинет
                </Link>
              </div>
            ) : (
              <div className="mt-3 grid gap-2">
                {!isLoginPage && (
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-md border border-white/15 px-3 py-3 text-sm font-bold text-white/82 hover:bg-white/10 hover:text-white"
                  >
                    Войти
                  </Link>
                )}
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="animated-gradient-button flex justify-center rounded-md px-3 py-3 text-sm font-black text-white sm:hidden"
                >
                  Попробовать бесплатно
                </Link>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
