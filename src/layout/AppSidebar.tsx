"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookHeart, Brain, Home } from "lucide-react";
import {
  CalenderIcon,
  HorizontaLDots,
  TaskIcon,
  TimeIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useI18n } from "@/context/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

type NavItem = {
  nameKey: TranslationKey;
  icon: React.ReactNode;
  path: string;
};

const navItems: NavItem[] = [
  { icon: <Home className="h-5 w-5" />, nameKey: "navigation.home", path: "/" },
  { icon: <TimeIcon />, nameKey: "navigation.routine", path: "/rotina" },
  { icon: <TaskIcon />, nameKey: "navigation.tasks", path: "/tasks" },
  { icon: <Brain className="h-5 w-5" />, nameKey: "navigation.focus", path: "/foco" },
  { icon: <CalenderIcon />, nameKey: "navigation.calendar", path: "/calendario" },
  {
    icon: <BookHeart className="h-5 w-5" />,
    nameKey: "navigation.journey",
    path: "/jornada",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    nameKey: "navigation.insights",
    path: "/insights",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { t } = useI18n();
  const pathname = usePathname();
  const isOpen = isExpanded || isHovered || isMobileOpen;
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  return (
    <aside
      className={`fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 ${
        isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex py-8 ${isOpen ? "justify-start" : "lg:justify-center"}`}>
        <Link href="/" aria-label="OceanQuiet">
          {isOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/oceanquiet-logo.svg"
                alt="OceanQuiet"
                width={196}
                height={40}
                priority
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/oceanquiet-logo-dark.svg"
                alt="OceanQuiet"
                width={196}
                height={40}
                priority
              />
            </>
          ) : (
            <span className="block h-8 w-8" aria-hidden="true">
              <Image
                className="dark:hidden"
                src="/images/logo/oceanquiet-icon.svg"
                alt=""
                width={32}
                height={32}
                priority
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/oceanquiet-icon.svg"
                alt=""
                width={32}
                height={32}
                priority
              />
            </span>
          )}
        </Link>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto no-scrollbar">
        <nav className="mb-6" aria-label={t("navigation.menu")}>
          <h2
            className={`mb-4 flex text-xs uppercase leading-[20px] text-gray-400 ${
              isOpen ? "justify-start" : "lg:justify-center"
            }`}
          >
            {isOpen ? t("navigation.menu") : <HorizontaLDots />}
          </h2>

          <ul className="flex flex-col gap-4">
            {navItems.map((nav) => {
              const active = isActive(nav.path);

              return (
                <li key={nav.path}>
                  <Link
                    href={nav.path}
                    className={`menu-item group ${
                      active ? "menu-item-active" : "menu-item-inactive"
                    } ${!isOpen ? "lg:justify-center" : "lg:justify-start"}`}
                  >
                    <span className={active ? "menu-item-icon-active" : "menu-item-icon-inactive"}>
                      {nav.icon}
                    </span>
                    {isOpen && <span className="menu-item-text">{t(nav.nameKey)}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="mt-auto border-t border-gray-200 py-4 dark:border-gray-800">
        <Link
          href="/profile"
          title={t("navigation.profile")}
          className={`flex items-center rounded-xl transition-colors ${
            isOpen ? "gap-3 px-2 py-1.5" : "justify-center py-1.5"
          } ${
            pathname === "/profile"
              ? "bg-brand-50 dark:bg-brand-500/10"
              : "hover:bg-gray-50 dark:hover:bg-white/5"
          }`}
        >
          <span
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              pathname === "/profile"
                ? "border-brand-200 bg-brand-50 text-brand-600 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-400"
                : "border-gray-200 bg-gray-50 text-gray-500 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-700 dark:bg-white/5 dark:text-gray-400"
            }`}
          >
            <UserCircleIcon />
          </span>
          {isOpen && (
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t("navigation.profile")}
              </span>
              <span className="block text-[11px] text-gray-400">
                {t("navigation.accountAndPlan")}
              </span>
            </span>
          )}
        </Link>
      </div>
    </aside>
  );
};

export default AppSidebar;
