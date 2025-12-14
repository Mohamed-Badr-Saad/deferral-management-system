// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  FilePlus,
  CheckSquare,
  FileCheck,
  Settings,
  Shield,
  PenTool,
  BarChart,
  Bell,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles?: string[];
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    roles: [
      "user",
      "reliability",
      "maintenance_manager",
      "operations_manager",
      "technical_authority",
      "plant_manager",
      "admin",
    ],
  },
  {
    title: "All Deferrals",
    href: "/deferrals",
    icon: FileText,
  },
  {
    title: "New Deferral",
    href: "/deferrals/new",
    icon: FilePlus,
  },
  {
    title: "My Deferrals",
    href: "/deferrals/my-deferrals",
    icon: FileCheck,
  },
];

const reliabilityItems: NavItem[] = [
  {
    title: "Reliability Review",
    href: "/reliability",
    icon: Shield,
    roles: ["reliability", "admin"],
  },
  {
    title: "Pending Reviews",
    href: "/reliability/pending",
    icon: CheckSquare,
  },
];

const approvalItems: NavItem[] = [
  {
    title: "Approvals",
    href: "/approvals",
    icon: PenTool,
    roles: ["approver", "admin"],
  },
];

const adminItems: NavItem[] = [
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart,
    roles: ["reliability", "admin"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Shield,
    roles: ["admin"],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Deferral System</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>

        <Separator className="my-4" />

        <div className="px-3 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Reliability Team
          </p>
          {reliabilityItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>

        <Separator className="my-4" />

        <div className="px-3 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Approvals
          </p>
          {approvalItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>

        <Separator className="my-4" />

        <div className="px-3 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Administration
          </p>
          {adminItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      </nav>
    </aside>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      <Icon className="mr-3 h-5 w-5" />
      {item.title}
      {item.badge && (
        <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
