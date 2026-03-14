import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

type Props = {
    children: ReactNode;
    variant?: 'header' | 'sidebar';
};

export function AppShell({ children, variant = 'header' }: Props) {
    const isOpen = usePage().props.sidebarOpen;

    if (variant === 'header') {
        return (
            <TooltipProvider>
                <div className="flex min-h-screen w-full flex-col">
                    {children}
                </div>
            </TooltipProvider>
        );
    }

    return (
        <TooltipProvider>
            <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>
        </TooltipProvider>
    );
}
