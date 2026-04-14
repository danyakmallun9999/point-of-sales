import { Head } from '@inertiajs/react';
import { Banknote, ShoppingBag, Package, AlertTriangle, Clock, Zap, ArrowUpRight } from 'lucide-react';
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
    aprioriInsights?: {
        antecedent: string;
        consequent: string;
        support: number;
        confidence: number;
    }[];
}

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ stats, recentOrders, aprioriInsights = [] }: Props) {
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

                    <Card className="lg:col-span-3 border border-primary/20 shadow-md shadow-primary/5 bg-linear-to-br from-card to-muted/50 dark:from-card dark:to-muted/20">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                                <Zap className="w-5 h-5 text-primary" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button asChild size="lg" className="w-full font-bold group">
                                <a href="/pos">
                                    Open POS Terminal
                                    <ArrowUpRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </a>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="w-full font-bold">
                                <a href="/management/products">Manage Inventory</a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Algoritma Apriori / Market Basket Analysis Widget */}
                {aprioriInsights && aprioriInsights.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                        <Card className="border border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                                    <Zap className="w-5 h-5 text-primary" />
                                    Smart Recommendations (Market Basket Analysis)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {aprioriInsights.map((insight, idx) => (
                                        <div key={idx} className="flex flex-col p-4 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors">
                                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Customers who bought</div>
                                            <div className="font-bold text-foreground text-base truncate">{insight.antecedent}</div>
                                            <div className="flex items-center gap-2 my-2">
                                                <div className="flex-1 h-px bg-border/50"></div>
                                                <span className="text-xs text-muted-foreground">often buy</span>
                                                <div className="flex-1 h-px bg-border/50"></div>
                                            </div>
                                            <div className="font-bold text-primary text-lg truncate flex items-center gap-2">
                                                {insight.consequent}
                                            </div>
                                            <div className="mt-3 flex justify-between items-center bg-background/50 p-2 rounded">
                                                <span className="text-xs text-muted-foreground font-medium">Probability</span>
                                                <Badge variant="secondary" className="bg-primary hover:bg-primary text-primary-foreground">
                                                    {(insight.confidence * 100).toFixed(0)}%
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppSidebarLayout>
    );
}
