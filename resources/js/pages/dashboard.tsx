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
                    <Card className="border border-border/50 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
                            <Banknote className="h-4 w-4 shrink-0 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">Rp {stats.today_revenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">Confirmed payments today</p>
                        </CardContent>
                    </Card>
                    <Card className="border border-border/50 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Orders</CardTitle>
                            <ShoppingBag className="h-4 w-4 shrink-0 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.today_orders}</div>
                            <p className="text-xs text-muted-foreground mt-1">Transactions processed today</p>
                        </CardContent>
                    </Card>
                    <Card className="border border-border/50 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
                            <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.total_products}</div>
                            <p className="text-xs text-muted-foreground mt-1">Items in your catalog</p>
                        </CardContent>
                    </Card>
                    <Card className="border border-border/50 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
                            <AlertTriangle className={`h-4 w-4 shrink-0 ${stats.low_stock_alerts > 0 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${stats.low_stock_alerts > 0 ? 'text-destructive' : 'text-foreground'}`}>{stats.low_stock_alerts}</div>
                            <p className="text-xs text-muted-foreground mt-1">Items below 10 units</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
                    <Card className="lg:col-span-4 border border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                                <Clock className="w-5 h-5 text-primary" />
                                Recent Transactions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50 border border-transparent">
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-semibold text-sm text-foreground truncate">{order.reference_number}</span>
                                            <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-foreground">Rp {parseFloat(order.total_price).toLocaleString()}</div>
                                                <div className="text-[10px] uppercase text-muted-foreground font-medium">{order.payment_method}</div>
                                            </div>
                                            <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'} className={order.payment_status === 'paid' ? 'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-foreground dark:hover:bg-primary/30' : ''}>
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

                    <Card className="lg:col-span-3 border border-primary/20 shadow-sm bg-primary text-primary-foreground">
                        <CardHeader>
                            <CardTitle className="text-primary-foreground">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button asChild className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-0 font-bold">
                                <a href="/pos">Open POS Terminal</a>
                            </Button>
                            <Button asChild variant="outline" className="w-full border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary-foreground font-bold">
                                <a href="/management/products">Manage Inventory</a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
