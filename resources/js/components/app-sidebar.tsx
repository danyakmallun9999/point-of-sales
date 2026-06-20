import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Monitor, Package, Tags, BarChart3, Users, BrainCircuit, Settings } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as categoryIndex } from '@/routes/management/categories';
import { index as productIndex } from '@/routes/management/products';
import { index as reportIndex } from '@/routes/management/reports';
import { index as analyticsIndex } from '@/routes/management/analytics';
import { index as userIndex } from '@/routes/management/users';
import { index as settingsIndex } from '@/routes/management/settings';
import { terminal } from '@/routes/pos';
import type { NavItem } from '@/types';

interface SidebarNavItem extends NavItem {
    roles?: string[];
}

const mainNavItems: SidebarNavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        roles: ['cashier', 'manager', 'admin'],
    },
    {
        title: 'POS Terminal',
        href: terminal(),
        icon: Monitor,
        roles: ['cashier', 'manager', 'admin'],
    },
];

const managementNavItems: SidebarNavItem[] = [
    {
        title: 'Products',
        href: productIndex(),
        icon: Package,
        roles: ['manager', 'admin'],
    },
    {
        title: 'Categories',
        href: categoryIndex(),
        icon: Tags,
        roles: ['manager', 'admin'],
    },
    {
        title: 'Financial Reports',
        href: reportIndex(),
        icon: BarChart3,
        roles: ['manager', 'admin'],
    },
    {
        title: 'User Management',
        href: userIndex(),
        icon: Users,
        roles: ['admin'],
    },
    {
        title: 'AI Analytics',
        href: analyticsIndex(),
        icon: BrainCircuit,
        roles: ['manager', 'admin'],
    },
    {
        title: 'System Settings',
        href: settingsIndex(),
        icon: Settings,
        roles: ['manager', 'admin'],
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const userRole = auth?.user?.role;

    const filteredMainItems = mainNavItems.filter(
        (item) => !item.roles || (userRole && item.roles.includes(userRole))
    );

    const filteredManagementItems = managementNavItems.filter(
        (item) => !item.roles || (userRole && item.roles.includes(userRole))
    );

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredMainItems} />
                {filteredManagementItems.length > 0 && (
                    <NavMain items={filteredManagementItems} label="Management" />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
