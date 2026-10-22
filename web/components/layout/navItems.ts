export interface NavItem {
  key:            string;   // i18n key inside nav.*
  href:           string;
  icon:           string;   // lucide icon name
  mobileVisible:  boolean;  // show in bottom nav (max 5 slots)
  sidebarSection: "main" | "more";
}

/** Bottom nav slots (mobile) — exactly 5 */
export const BOTTOM_NAV: NavItem[] = [
  { key: "home",      href: "/",            icon: "Home",          mobileVisible: true, sidebarSection: "main" },
  { key: "cases",     href: "/cases",       icon: "Briefcase",     mobileVisible: true, sidebarSection: "main" },
  { key: "clients",   href: "/clients",     icon: "Users",         mobileVisible: true, sidebarSection: "main" },
  { key: "reminders", href: "/reminders",   icon: "Bell",          mobileVisible: true, sidebarSection: "main" },
  { key: "more",      href: "/more",        icon: "MoreHorizontal",mobileVisible: true, sidebarSection: "more" },
];

/** Full sidebar item list (desktop) */
export const SIDEBAR_NAV: NavItem[] = [
  { key: "home",          href: "/",               icon: "LayoutDashboard", mobileVisible: false, sidebarSection: "main" },
  { key: "causeList",     href: "/cause-list",     icon: "Calendar",        mobileVisible: false, sidebarSection: "main" },
  { key: "cases",         href: "/cases",          icon: "Briefcase",       mobileVisible: false, sidebarSection: "main" },
  { key: "runningCases",  href: "/cases/running",  icon: "List",            mobileVisible: false, sidebarSection: "main" },
  { key: "clients",       href: "/clients",        icon: "Users",           mobileVisible: false, sidebarSection: "main" },
  { key: "documents",     href: "/documents",      icon: "FolderOpen",      mobileVisible: false, sidebarSection: "main" },
  { key: "importantForms",href: "/important-forms",icon: "FileText",        mobileVisible: false, sidebarSection: "main" },
  { key: "reminders",     href: "/reminders",      icon: "Bell",            mobileVisible: false, sidebarSection: "main" },
  { key: "decided",       href: "/cases/decided",  icon: "CheckSquare",     mobileVisible: false, sidebarSection: "more" },
  { key: "notifications", href: "/notifications",  icon: "BellRing",        mobileVisible: false, sidebarSection: "more" },
  { key: "settings",      href: "/settings",       icon: "Settings",        mobileVisible: false, sidebarSection: "more" },
];
