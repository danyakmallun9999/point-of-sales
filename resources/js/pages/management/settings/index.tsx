import { Head, useForm } from '@inertiajs/react';
import { Settings as SettingsIcon, Store, Plus, Save } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableRow as TableRowComponent, TableCell as TableCellComponent } from '@/components/ui/table';

import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

interface Outlet {
    id: number;
    name: string;
    address: string | null;
    created_at: string;
}

interface Props {
    settings: {
        tax_rate?: string;
        receipt_header?: string;
        receipt_footer?: string;
    };
    outlets: Outlet[];
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Management', href: '#' },
    { title: 'System Settings', href: '/management/settings' },
];

export default function SystemSettingsIndex({ settings, outlets }: Props) {
    const [isAddOutletOpen, setIsAddOutletOpen] = useState(false);

    // Form for System Settings
    const settingsForm = useForm({
        tax_rate: settings.tax_rate || '0.1',
        receipt_header: settings.receipt_header || 'POSO',
        receipt_footer: settings.receipt_footer || 'Jl. Teknologi No. 123, Indonesia',
    });

    // Form for Add Outlet
    const outletForm = useForm({
        name: '',
        address: '',
    });

    const submitSettings = (e: React.FormEvent) => {
        e.preventDefault();
        settingsForm.post('/management/settings', {
            preserveState: true,
        });
    };

    const submitOutlet = (e: React.FormEvent) => {
        e.preventDefault();
        outletForm.post('/management/settings/outlets', {
            onSuccess: () => {
                setIsAddOutletOpen(false);
                outletForm.reset();
            },
        });
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="System Settings" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <SettingsIcon className="w-8 h-8 text-primary" /> System Settings
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Configure POSO tax rates, custom receipts, and store outlets.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Card 1: POS Configurations */}
                    <Card className="border border-border bg-card shadow-sm">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <SettingsIcon className="w-5 h-5 text-primary" /> POS Settings
                            </CardTitle>
                            <CardDescription>
                                Set the global tax rate and custom printed receipts text.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={submitSettings} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="tax_rate" className="text-sm font-semibold">
                                        Tax Rate (decimal, e.g. 0.1 = 10%)
                                    </Label>
                                    <Input
                                        id="tax_rate"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="1"
                                        value={settingsForm.data.tax_rate}
                                        onChange={(e) => settingsForm.setData('tax_rate', e.target.value)}
                                        placeholder="0.1"
                                        className="bg-background"
                                        required
                                    />
                                    {settingsForm.errors.tax_rate && (
                                        <p className="text-xs text-destructive">{settingsForm.errors.tax_rate}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="receipt_header" className="text-sm font-semibold">
                                        Receipt Header / Title
                                    </Label>
                                    <Input
                                        id="receipt_header"
                                        type="text"
                                        value={settingsForm.data.receipt_header}
                                        onChange={(e) => settingsForm.setData('receipt_header', e.target.value)}
                                        placeholder="POSO Shop"
                                        className="bg-background"
                                        required
                                    />
                                    {settingsForm.errors.receipt_header && (
                                        <p className="text-xs text-destructive">{settingsForm.errors.receipt_header}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="receipt_footer" className="text-sm font-semibold">
                                        Receipt Footer / Address
                                    </Label>
                                    <Input
                                        id="receipt_footer"
                                        type="text"
                                        value={settingsForm.data.receipt_footer}
                                        onChange={(e) => settingsForm.setData('receipt_footer', e.target.value)}
                                        placeholder="Jl. Raya No. 12, Jakarta"
                                        className="bg-background"
                                        required
                                    />
                                    {settingsForm.errors.receipt_footer && (
                                        <p className="text-xs text-destructive">{settingsForm.errors.receipt_footer}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={settingsForm.processing}
                                    className="w-full flex items-center justify-center gap-2 mt-4"
                                >
                                    <Save className="w-4 h-4" /> Save Settings
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Card 2: Multi-Outlet / Branches */}
                    <Card className="border border-border bg-card shadow-sm">
                        <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Store className="w-5 h-5 text-primary" /> Store Outlets
                                </CardTitle>
                                <CardDescription>
                                    Manage outlet branch locations.
                                </CardDescription>
                            </div>
                            <Dialog open={isAddOutletOpen} onOpenChange={setIsAddOutletOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="flex items-center gap-1">
                                        <Plus className="w-4 h-4" /> Add Outlet
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <form onSubmit={submitOutlet}>
                                        <DialogHeader>
                                            <DialogTitle>Add New Outlet</DialogTitle>
                                            <DialogDescription>
                                                Register a new store branch location.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="outlet_name">Outlet Name</Label>
                                                <Input
                                                    id="outlet_name"
                                                    value={outletForm.data.name}
                                                    onChange={(e) => outletForm.setData('name', e.target.value)}
                                                    placeholder="POSO Sudirman"
                                                    required
                                                />
                                                {outletForm.errors.name && (
                                                    <p className="text-xs text-destructive">{outletForm.errors.name}</p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="outlet_address">Address</Label>
                                                <Input
                                                    id="outlet_address"
                                                    value={outletForm.data.address}
                                                    onChange={(e) => outletForm.setData('address', e.target.value)}
                                                    placeholder="Jl. Jend. Sudirman No. 45"
                                                />
                                                {outletForm.errors.address && (
                                                    <p className="text-xs text-destructive">{outletForm.errors.address}</p>
                                                )}
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={outletForm.processing}>
                                                Create Outlet
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="overflow-x-auto rounded-md border border-border">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="font-bold text-foreground">ID</TableHead>
                                            <TableHead className="font-bold text-foreground">Name</TableHead>
                                            <TableHead className="font-bold text-foreground">Address</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {outlets.map((outlet) => (
                                            <TableRowComponent key={outlet.id}>
                                                <TableCellComponent className="font-mono text-xs">{outlet.id}</TableCellComponent>
                                                <TableCellComponent className="font-medium text-foreground">{outlet.name}</TableCellComponent>
                                                <TableCellComponent className="text-muted-foreground text-sm">{outlet.address || '-'}</TableCellComponent>
                                            </TableRowComponent>
                                        ))}
                                        {outlets.length === 0 && (
                                            <TableRowComponent>
                                                <TableCellComponent colSpan={3} className="text-center py-4 text-muted-foreground">
                                                    No outlets registered yet.
                                                </TableCellComponent>
                                            </TableRowComponent>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
