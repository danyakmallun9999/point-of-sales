import { Head, router } from '@inertiajs/react';
import { Download, FileDown, TrendingUp, TrendingDown, Filter } from 'lucide-react';
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

export default function ReportIndex({ summary, topProducts, dailySales, filters }: Props) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleFilter = () => {
        router.get('/management/reports', { start_date: startDate, end_date: endDate }, { preserveState: true });
    };

    const handleExport = () => {
        window.location.href = `/management/reports/export?start_date=${startDate}&end_date=${endDate}`;
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
                    
                    <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-2 px-2 border-r">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <Input type="date" className="border-none h-8 w-36 shadow-none focus-visible:ring-0" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            <span className="text-slate-300">-</span>
                            <Input type="date" className="border-none h-8 w-36 shadow-none focus-visible:ring-0" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                        <Button size="sm" onClick={handleFilter} className="h-8 bg-amber-600 hover:bg-amber-700">Apply</Button>
                        <Button size="sm" variant="outline" onClick={handleExport} className="h-8">
                            <FileDown className="w-4 h-4 mr-2" /> Export CSV
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-none shadow-sm shadow-black/5 bg-white">
                        <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-slate-500 uppercase">Gross Sales</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Rp {parseFloat(summary.total_subtotal || '0').toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm shadow-black/5 bg-white">
                        <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-slate-500 uppercase">Total Discounts</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-500">Rp {parseFloat(summary.total_discount || '0').toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm shadow-black/5 bg-white">
                        <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-slate-500 uppercase">Total Tax</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Rp {parseFloat(summary.total_tax || '0').toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm shadow-black/5 bg-amber-600 text-white">
                        <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-amber-100 uppercase">Net Revenue</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Rp {parseFloat(summary.total_revenue || '0').toLocaleString()}</div>
                            <p className="text-[10px] text-amber-100 mt-1">From {summary.total_orders} successful orders</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm shadow-black/5">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-amber-600" />
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

                    <Card className="border-none shadow-sm shadow-black/5">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Download className="w-5 h-5 text-blue-600" />
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
                                            <TableCell>{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</TableCell>
                                            <TableCell className="text-right font-bold text-green-600">Rp {parseFloat(item.total).toLocaleString()}</TableCell>
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
            </div>
        </AppSidebarLayout>
    );
}
