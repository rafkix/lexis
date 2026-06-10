import {
  LayoutDashboard,
  Target,
  BookOpen,
  BarChart2,
  CalendarDays,
  Trophy,
  User,
  Settings,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Practice", href: "/practice", icon: Target },
  // { label: "Mock Exams", href: "/exams", icon: BookOpen },
  // { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Billing", href: "/billing", icon: Wallet },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];
