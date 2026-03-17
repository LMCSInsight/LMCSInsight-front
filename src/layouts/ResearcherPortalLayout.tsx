import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Moon, Sun, Globe, Bell, LogOut, LayoutDashboard, ListOrdered, Users, BarChart3, Settings } from "lucide-react";
import { useAuthContext } from "@/shared/context/AuthContext";
import { useTheme } from "@/shared/context/ThemeContext";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  ROUTES,
  getResearcherDashboardPath,
  getResearcherSupervisionsPath,
  getResearcherStudentsPath,
  getResearcherStatisticsPath,
  getResearcherProfilePath,
} from "@/config/routes";
import i18n, { LANGUAGES } from "@/i18n";

const RESEARCHER_NAV: {
  key: string;
  labelKey: string;
  getPath: (researcherId: string) => string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  isActive?: (pathname: string, researcherId: string) => boolean;
}[] = [
  { key: "dashboard", labelKey: "common.dashboard", getPath: (id) => getResearcherDashboardPath(id), icon: LayoutDashboard },
  {
    key: "supervisions",
    labelKey: "common.supervisions",
    getPath: (id) => getResearcherSupervisionsPath(id),
    icon: ListOrdered,
    isActive: (path, id) => path.startsWith(getResearcherSupervisionsPath(id)),
  },
  { key: "students", labelKey: "common.studentManagement", getPath: (id) => getResearcherStudentsPath(id), icon: Users },
  { key: "statistics", labelKey: "common.statisticsReports", getPath: (id) => getResearcherStatisticsPath(id), icon: BarChart3 },
  { key: "profile", labelKey: "common.profileSettings", getPath: (id) => getResearcherProfilePath(id), icon: Settings },
];

function getPageTitleKey(pathname: string, researcherId: string): string {
  const item = RESEARCHER_NAV.find((nav) => {
    if (nav.isActive) return nav.isActive(pathname, researcherId);
    const path = nav.getPath(researcherId);
    return pathname === path || pathname.startsWith(path + "/");
  });
  return item?.key ?? "dashboard";
}

function getInitials(name: string | undefined, email: string | undefined): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      const first = parts[0].charAt(0);
      const last = parts[parts.length - 1].charAt(0);
      return (first + last).toUpperCase();
    }
    return parts[0].charAt(0).toUpperCase();
  }
  if (email?.trim()) {
    const firstTwo = email.trim().slice(0, 2);
    return firstTwo.toUpperCase();
  }
  return "?";
}

const PAGE_TITLE_KEYS: Record<string, string> = {
  dashboard: "common.dashboard",
  supervisions: "common.supervisions",
  students: "common.studentManagement",
  statistics: "common.statisticsReports",
  profile: "common.profileSettings",
};

export function ResearcherPortalLayout() {
  const { t } = useTranslation();
  const { currentUser, logout } = useAuthContext();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const researcherId = currentUser?.id ?? "";

  function isItemSelected(item: (typeof RESEARCHER_NAV)[number]): boolean {
    if (item.isActive) return item.isActive(location.pathname, researcherId);
    const path = item.getPath(researcherId);
    return location.pathname === path || location.pathname.startsWith(path + "/");
  }

  function handleLogout() {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  }

  const pageTitle = t(PAGE_TITLE_KEYS[getPageTitleKey(location.pathname, researcherId)] ?? "common.dashboard");
  const initials = getInitials(currentUser?.name, currentUser?.email);

  return (
    <div className="researcher-portal flex min-h-screen bg-blue-50/30 dark:bg-background">
      {/* Sidebar – fixed so it does not scroll with page content */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-card">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {/* Logo – LMCS */}
          <div className="flex justify-center py-2">
            <img
              src="/lmcs.png"
              alt="LMCS"
              className="h-24 w-auto object-contain"
            />
          </div>

          {/* User card – avatar with initials */}
          <Card className="border-border bg-muted/80 shadow-none">
            <CardContent className="flex items-center gap-3 p-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {currentUser?.name ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">{t("common.researcher")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Nav – shadcn buttonVariants + Link */}
          <nav className="flex flex-col gap-1">
            {RESEARCHER_NAV.map((item) => {
              const path = item.getPath(researcherId);
              const selected = isItemSelected(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.key}
                  to={path}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "default" }),
                    "h-10 w-full justify-start gap-3 px-3 font-normal text-foreground",
                    selected
                      ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                      : "hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-5 shrink-0" strokeWidth={2} />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout at bottom */}
        <div className="mt-auto border-t border-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 text-foreground hover:bg-muted hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="size-5 shrink-0" strokeWidth={2} />
            {t("common.signOut")}
          </Button>
        </div>
      </aside>

      {/* Right: header on top, then content (offset by fixed sidebar width) */}
      <div className="ml-64 flex min-w-0 flex-1 flex-col min-h-screen">
        <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-border bg-card px-6 py-4 shadow-sm">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {pageTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("common.welcome")}, {currentUser?.name ?? currentUser?.email ?? "Chercheur"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 text-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label={t("common.theme")}
              onClick={toggleTheme}
            >
              {isDark ? (
                <Sun className="size-5" strokeWidth={2} />
              ) : (
                <Moon className="size-5" strokeWidth={2} />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 text-foreground hover:bg-accent hover:text-accent-foreground"
                  aria-label={t("common.language")}
                >
                  <Globe className="size-5" strokeWidth={2} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px]">
                {LANGUAGES.map(({ code, labelKey }) => (
                  <DropdownMenuItem
                    key={code}
                    onClick={() => i18n.changeLanguage(code)}
                    className={cn(i18n.language === code && "bg-accent")}
                  >
                    {t(labelKey)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative size-9 text-foreground hover:bg-accent hover:text-accent-foreground"
                  aria-label={t("common.notifications")}
                >
                  <Bell className="size-5" strokeWidth={2} />
                  <span className="absolute right-1 top-1 size-2 rounded-full bg-destructive" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{t("common.notifications")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled className="justify-center py-6 text-center text-muted-foreground cursor-default">
                    {t("common.noNotifications")}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-w-0 flex-1 bg-muted/30 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
