import { Head } from '@inertiajs/react';
import { Banknote, ShoppingBag, Package, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

interface Props {
    stats: {
        today_revenue: number;
        today_orders: number;
        total_products: number;
        low_stock_alerts: number;
    };
    recentOrders: any[];
}

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ stats, recentOrders }: Props) {
    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-none shadow-sm shadow-black/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                            <Banknote className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Rp {stats.today_revenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">Confirmed payments today</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm shadow-black/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.today_orders}</div>
                            <p className="text-xs text-muted-foreground mt-1">Transactions processed today</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm shadow-black/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            <Package className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_products}</div>
                            <p className="text-xs text-muted-foreground mt-1">Items in your catalog</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm shadow-black/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                            <AlertTriangle className={`h-4 w-4 ${stats.low_stock_alerts > 0 ? 'text-red-600 animate-pulse' : 'text-slate-300'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${stats.low_stock_alerts > 0 ? 'text-red-600' : ''}`}>{stats.low_stock_alerts}</div>
                            <p className="text-xs text-muted-foreground mt-1">Items below 10 units</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
                    <Card className="lg:col-span-4 border-none shadow-sm shadow-black/5">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Recent Transactions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">{order.reference_number}</span>
                                            <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-sm font-bold">Rp {parseFloat(order.total_price).toLocaleString()}</div>
                                                <div className="text-[10px] uppercase text-slate-500 font-bold">{order.payment_method}</div>
                                            </div>
                                            <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'} className={order.payment_status === 'paid' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                                                {order.payment_status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                {recentOrders.length === 0 && (
                                    <div className="text-center py-10 text-muted-foreground italic">
                                        No transactions yet today.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="lg:col-span-3 border-none shadow-sm shadow-black/5 bg-amber-600 text-white">
                        <CardHeader>
                            <CardTitle className="text-white">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button asChild className="w-full bg-white text-amber-600 hover:bg-slate-100 border-none font-bold">
                                <a href="/pos">Open POS Terminal</a>
                            </Button>
                            <Button asChild variant="outline" className="w-full border-white/20 hover:bg-white/10 text-white font-bold">
                                <a href="/management/products">Manage Inventory</a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
