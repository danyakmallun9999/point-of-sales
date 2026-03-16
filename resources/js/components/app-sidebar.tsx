import { Link } from '@inertiajs/react';
import { LayoutGrid, Monitor, Package, Tags, BarChart3, Users } from 'lucide-react';
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
import { index as userIndex } from '@/routes/management/users';
import { terminal } from '@/routes/pos';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'POS Terminal',
        href: terminal(),
        icon: Monitor,
    },
];

const managementNavItems: NavItem[] = [
    {
        title: 'Products',
        href: productIndex(),
        icon: Package,
    },
    {
        title: 'Categories',
        href: categoryIndex(),
        icon: Tags,
    },
    {
        title: 'Financial Reports',
        href: reportIndex(),
        icon: BarChart3,
    },
    {
        title: 'User Management',
        href: userIndex(),
        icon: Users,
    },
];



export function AppSidebar() {
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
                <NavMain items={mainNavItems} />
                <NavMain items={managementNavItems} label="Management" />
            </SidebarContent>

            <SidebarFooter>

                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
