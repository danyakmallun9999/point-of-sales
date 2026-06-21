import { Head, router } from '@inertiajs/react';
import { Download, FileDown, TrendingUp, Filter, Printer, Clock } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

interface Props {
    summary: {
        total_subtotal: string;
        total_discount: string;
        total_tax: string;
        total_revenue: string;
        total_orders: number;
    };
    topProducts: any[];
    dailySales: any[];
    shifts: any[];
    filters: {
        start_date: string;
        end_date: string;
    };
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Management', href: '#' },
    { title: 'Financial Reports', href: '/management/reports' },
];

export default function ReportIndex({ summary, topProducts, dailySales, shifts = [], filters }: Props) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleFilter = () => {
        router.get('/management/reports', { start_date: startDate, end_date: endDate }, { preserveState: true });
    };

    const handleExport = () => {
        window.location.href = `/management/reports/export?start_date=${startDate}&end_date=${endDate}`;
    };

    const handlePrint = () => {
        window.open(`/management/reports/print?start_date=${startDate}&end_date=${endDate}`, '_blank');
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Reports" />
            <div className="p-4 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Financial Reports</h2>
                        <p className="text-muted-foreground">Analyze your sales performance and revenue.</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 bg-card p-3 rounded-xl border border-border shadow-sm">
                        <div className="flex items-center gap-2 pr-3 border-r border-border">
                            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                            <Input type="date" className="border-0 bg-transparent h-8 w-36 shadow-none focus-visible:ring-0" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            <span className="text-muted-foreground">–</span>
                            <Input type="date" className="border-0 bg-transparent h-8 w-36 shadow-none focus-visible:ring-0" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                        <Button size="sm" onClick={handleFilter} className="h-8">Apply</Button>
                        <Button size="sm" variant="outline" onClick={handleExport} className="h-8">
                            <FileDown className="w-4 h-4 mr-2" /> Export CSV
                        </Button>
                        <Button size="sm" variant="outline" onClick={handlePrint} className="h-8">
                            <Printer className="w-4 h-4 mr-2" /> Print PDF
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border border-border/50 shadow-sm">
                        <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-muted-foreground uppercase">Gross Sales</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">Rp {parseFloat(summary.total_subtotal || '0').toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card className="border border-border/50 shadow-sm">
                        <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-muted-foreground uppercase">Total Discounts</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">Rp {parseFloat(summary.total_discount || '0').toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card className="border border-border/50 shadow-sm">
                        <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-muted-foreground uppercase">Total Tax</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">Rp {parseFloat(summary.total_tax || '0').toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card className="border border-primary/20 shadow-sm bg-primary text-primary-foreground">
                        <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-primary-foreground/90 uppercase">Net Revenue</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Rp {parseFloat(summary.total_revenue || '0').toLocaleString()}</div>
                            <p className="text-[10px] text-primary-foreground/80 mt-1">From {summary.total_orders} successful orders</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                                <TrendingUp className="w-5 h-5 text-primary shrink-0" />
                                Top Selling Products
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-center">Sold</TableHead>
                                        <TableHead className="text-right">Revenue</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topProducts.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{item.product?.name || 'Unknown'}</TableCell>
                                            <TableCell className="text-center">{item.total_quantity} qty</TableCell>
                                            <TableCell className="text-right font-bold">Rp {parseFloat(item.total_sales).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                    {topProducts.length === 0 && (
                                        <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground italic">No data available for this period.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="border border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                                <Download className="w-5 h-5 text-primary shrink-0" />
                                Daily Sales History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Daily Revenue</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dailySales.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="text-foreground">{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</TableCell>
                                            <TableCell className="text-right font-bold text-primary">Rp {parseFloat(item.total).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                    {dailySales.length === 0 && (
                                        <TableRow><TableCell colSpan={2} className="text-center py-10 text-muted-foreground italic">No data available.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border border-border/50 shadow-sm mt-6">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                            <Clock className="w-5 h-5 text-primary shrink-0" />
                            Cashier Shift History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20 text-center">ID</TableHead>
                                    <TableHead>Cashier</TableHead>
                                    <TableHead>Outlet</TableHead>
                                    <TableHead className="text-right">Opening Cash</TableHead>
                                    <TableHead className="text-right">Expected</TableHead>
                                    <TableHead className="text-right">Actual</TableHead>
                                    <TableHead className="text-right">Variance</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-center">Time Opened / Closed</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {shifts.map((shift, i) => {
                                    const variance = parseFloat(shift.end_amount_actual) - parseFloat(shift.end_amount_expected);
                                    return (
                                        <TableRow key={i}>
                                            <TableCell className="text-center font-bold font-mono text-xs">#{shift.id}</TableCell>
                                            <TableCell className="font-medium">{shift.user?.name || 'Unknown'}</TableCell>
                                            <TableCell>{shift.outlet?.name || 'Global'}</TableCell>
                                            <TableCell className="text-right font-mono text-xs">Rp {parseFloat(shift.start_amount).toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-mono text-xs">Rp {parseFloat(shift.end_amount_expected).toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-mono text-xs">Rp {parseFloat(shift.end_amount_actual).toLocaleString()}</TableCell>
                                            <TableCell className={`text-right font-mono text-xs font-bold ${variance < 0 ? 'text-destructive' : (variance > 0 ? 'text-emerald-600 dark:text-emerald-400' : '')}`}>
                                                {variance >= 0 ? '+' : ''}Rp {variance.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${shift.status === 'closed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                                    {shift.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center text-xs text-muted-foreground whitespace-nowrap leading-relaxed">
                                                <div>Buka: {new Date(shift.opened_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</div>
                                                {shift.closed_at && <div>Tutup: {new Date(shift.closed_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</div>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => window.open(`/pos/shift/${shift.id}/print`, '_blank')}
                                                    className="h-8 px-2 hover:text-primary"
                                                >
                                                    <Printer className="w-3.5 h-3.5 mr-1" /> Print
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {shifts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-10 text-muted-foreground italic">
                                            No cashier shifts recorded for this period.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}
