import { Head, router, usePage } from '@inertiajs/react';
import { Coffee, Plus, Minus, Trash2, Search, QrCode, Banknote, Loader2, CheckCircle2, Wifi, WifiOff, RefreshCw, Printer, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createQrisCharge, checkStatus } from '@/actions/App/Http/Controllers/PaymentController';
import { store as storeOrder } from '@/actions/App/Http/Controllers/POSController';
import { AppShell } from '@/components/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { syncCatalog, getOfflineCatalog, saveOfflineOrder, getUnsyncedOrders, markOrderSynced } from '@/lib/db';


interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image?: string;
    category_id: number;
}

interface CartItem extends Product {
    quantity: number;
}

interface Props {
    products: Product[];
    categories: any[];
}

export default function Terminal({ products: initialProducts, categories: initialCategories }: Props) {
    const { flash } = usePage().props as any;

    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [categories, setCategories] = useState<any[]>(initialCategories);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [discount, setDiscount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [qrisData, setQrisData] = useState<{ qr_url?: string; status?: string; orderId?: number } | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [completedOrder, setCompletedOrder] = useState<any>(null);

    useEffect(() => {
        if (isOnline) {
            syncCatalog(initialProducts, initialCategories);
            pushUnsyncedOrders();
        } else {
            loadOfflineCatalog();
        }

        const handleOnline = () => { setIsOnline(true); pushUnsyncedOrders(); };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [isOnline, initialProducts, initialCategories]);

    const loadOfflineCatalog = async () => {
        const { products: p, categories: c } = await getOfflineCatalog();
        if (p.length > 0) setProducts(p);
        if (c.length > 0) setCategories(c);
    };

    const pushUnsyncedOrders = async () => {
        const unsynced = await getUnsyncedOrders();
        if (unsynced.length === 0) return;

        setIsSyncing(true);
        for (const order of unsynced) {
            try {
                const response = await fetch(storeOrder().url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content,
                    },
                    body: JSON.stringify(order),
                });
                if (response.ok) {
                    await markOrderSynced(order.id!);
                }
            } catch (error) {
                console.error('Sync failed', error);
            }
        }
        setIsSyncing(false);
    };

    useEffect(() => {
        let interval: any;

        if (qrisData?.orderId) {
            interval = setInterval(async () => {
                try {
                    const response = await fetch(checkStatus(qrisData.orderId!).url);
                    const data = await response.json();
                    
                    if (data.payment_status === 'paid') {
                        setQrisData(null);
                        setCart([]);
                        setDiscount(0);
                        setShowSuccess(true);
                        clearInterval(interval);
                    }
                } catch (error) {
                    console.error('Polling error:', error);
                }
            }, 3000);
        }

        return () => clearInterval(interval);
    }, [qrisData]);


    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === productId) {
                    const newQty = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQty };
                }
                return item;
            }),
        );
    };

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = Math.max(0, (subtotal - discount) * 0.1); // 10% TAX
    const total = Math.max(0, subtotal - discount + tax);

    const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleCheckout = async (method: 'cash' | 'qris') => {
        if (cart.length === 0) return;

        const orderData = {
            customer_name: 'Guest Customer',
            payment_method: method,
            discount_amount: discount,
            items: cart.map((item) => ({
                product_id: item.id,
                quantity: item.quantity,
            })),
        };

        if (!isOnline) {
            if (method === 'qris') {
                alert('QRIS is only available while online. Please use Cash.');
                return;
            }
            await saveOfflineOrder(orderData);
            setCart([]);
            setDiscount(0);
            setShowSuccess(true);
            // In offline mode we don't have the full order object from DB
            setCompletedOrder({ ...orderData, reference_number: 'OFFLINE-' + Date.now(), subtotal, tax_amount: tax, total_price: total });
            return;
        }

        setIsProcessing(true);
        router.post(storeOrder().url, orderData, {
            onSuccess: (page) => {
                const order = (page.props.flash as any)?.order;
                if (method === 'qris' && order) {
                    initiateQris(order.id);
                } else {
                    setIsProcessing(false);
                    setCart([]);
                    setDiscount(0);
                    setCompletedOrder(order);
                    setShowSuccess(true);
                }
            },
            onError: (errors) => {
                setIsProcessing(false);
                alert('Order failed: ' + Object.values(errors).join(', '));
            },
        });
    };

    const initiateQris = async (orderId: number) => {
        try {
            const response = await fetch(createQrisCharge(orderId).url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content,
                },
            });
            const data = await response.json();
            
            if (response.ok && data.actions) {
                const qrAction = data.actions.find((a: any) => a.name === 'generate-qr-code');
                setQrisData({ qr_url: qrAction?.url, status: data.transaction_status, orderId });
            } else {
                console.error('QRIS Error Response:', data);
                alert(`QRIS Failed: ${data.error || data.status_message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('QRIS Fetch Error:', error);
            alert('QRIS Request Failed. Check console for details.');
        } finally {
            setIsProcessing(false);
        }
    };


    return (
        <AppShell>
            <Head title="POS Terminal" />
            <div className="flex h-[calc(100vh-65px)] gap-4 p-4 overflow-hidden bg-slate-50 dark:bg-slate-950">
                {/* Product Section */}
                <div className="flex flex-col flex-1 gap-4">
                    <Card className="border-none shadow-sm shadow-black/5 bg-white dark:bg-slate-900">
                        <CardHeader className="py-4 px-6 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div>
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <Coffee className="w-5 h-5 text-amber-600" />
                                        Brew & Bytes
                                    </CardTitle>
                                    <CardDescription>Coffee Shop POS Terminal</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isOnline ? (
                                        <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                                            <Wifi className="w-3 h-3 mr-1" /> Online
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">
                                            <WifiOff className="w-3 h-3 mr-1" /> Offline Mode
                                        </Badge>
                                    )}
                                    {isSyncing && (
                                        <Badge variant="outline" className="text-amber-600 animate-pulse bg-amber-50 border-amber-200">
                                            <RefreshCw className="w-3 h-3 mr-1" /> Syncing...
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search products..."
                                    className="pl-10 h-10 rounded-full border-slate-200 dark:border-slate-800"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                    </Card>

                    <div className="flex-1 overflow-auto rounded-xl">

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProducts.map((product) => (
                                <Card
                                    key={product.id}
                                    className="group cursor-pointer hover:ring-2 hover:ring-amber-500/50 transition-all border-none shadow-sm shadow-black/5 bg-white dark:bg-slate-900"
                                    onClick={() => addToCart(product)}
                                >
                                    <div className="aspect-square relative overflow-hidden rounded-t-xl bg-slate-100 dark:bg-slate-800">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform" />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full text-slate-400">
                                                <Coffee className="w-12 h-12 opacity-20" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-bold text-amber-700">
                                            Rp {product.price.toLocaleString()}
                                        </div>
                                    </div>
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-base font-semibold truncate">{product.name}</CardTitle>
                                        <CardDescription className="line-clamp-1">{product.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Cart Section */}
                <div className="w-[400px] flex flex-col gap-4">
                    <Card className="flex-1 flex flex-col border-none shadow-sm shadow-black/5 bg-white dark:bg-slate-900 overflow-hidden">
                        <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-lg">Current Order</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-hidden">
                            <div className="h-full px-6 py-4 overflow-auto">

                                {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                                        <Coffee className="w-16 h-16 opacity-10 mb-4" />
                                        <p>Your cart is empty</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {cart.map((item) => (
                                            <div key={item.id} className="flex gap-3">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                                                    <p className="text-xs text-slate-500">Rp {item.price.toLocaleString()}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, -1)}>
                                                        <Minus className="w-3 h-3" />
                                                    </Button>
                                                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                                                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, 1)}>
                                                        <Plus className="w-3 h-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500" onClick={() => removeFromCart(item.id)}>
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>

                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center justify-between gap-4 mb-4">
                                    <Label className="text-xs font-bold text-slate-500 uppercase">Discount (Rp)</Label>
                                    <Input 
                                        type="number" 
                                        className="h-8 w-32 text-right font-bold" 
                                        value={discount} 
                                        onChange={(e) => setDiscount(Number(e.target.value))}
                                    />
                                </div>
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Subtotal</span>
                                    <span>Rp {subtotal.toLocaleString()}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm text-red-500">
                                        <span>Discount</span>
                                        <span>- Rp {discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Tax (10%)</span>
                                    <span>Rp {tax.toLocaleString()}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-amber-600">Rp {total.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button 
                                    className="w-full h-12 bg-slate-900 hover:bg-slate-800" 
                                    variant="default" 
                                    disabled={cart.length === 0 || isProcessing}
                                    onClick={() => handleCheckout('cash')}
                                >
                                    {isProcessing ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Banknote className="mr-2 w-4 h-4" />}
                                    Cash
                                </Button>
                                <Button 
                                    className="w-full h-12 bg-amber-600 hover:bg-amber-700" 
                                    variant="default" 
                                    disabled={cart.length === 0 || isProcessing}
                                    onClick={() => handleCheckout('qris')}
                                >
                                    {isProcessing ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <QrCode className="mr-2 w-4 h-4" />}
                                    QRIS
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* QRIS Modal */}
            <Dialog open={!!qrisData} onOpenChange={() => { setQrisData(null); setCart([]); setDiscount(0); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Scan to Pay</DialogTitle>
                        <DialogDescription>
                            Please scan this QRIS code with your mobile banking or e-wallet app.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl">
                        {qrisData?.qr_url ? (
                            <img src={qrisData.qr_url} alt="QRIS Code" className="w-64 h-64 shadow-lg border-8 border-white" />
                        ) : (
                            <div className="w-64 h-64 flex items-center justify-center bg-slate-100 rounded-lg">
                                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                            </div>
                        )}
                        <p className="mt-4 font-bold text-slate-900 border-2 border-slate-100 px-4 py-2 rounded-full">
                            Rp {total.toLocaleString()}
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Success & Receipt Modal */}
            <Dialog open={showSuccess} onOpenChange={(open) => { if(!open) { setShowSuccess(false); setCompletedOrder(null); } }}>
                <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-green-600 p-6 text-white flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-xl font-bold">Payment Successful</h2>
                        <p className="text-green-100 text-sm">Order {completedOrder?.reference_number}</p>
                    </div>
                    
                    <div className="p-6 space-y-6 max-h-[60vh] overflow-auto">
                        <div className="text-center space-y-1">
                            <h3 className="font-bold text-lg">Brew & Bytes Coffee</h3>
                            <p className="text-xs text-slate-500">Jl. Teknologi No. 123, Indonesia</p>
                            <p className="text-xs text-slate-500">{new Date().toLocaleString()}</p>
                        </div>

                        <Separator className="border-dashed" />

                        <div className="space-y-3">
                            {completedOrder?.items?.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span>{item.quantity}x {item.product?.name || 'Product'}</span>
                                    <span className="font-medium">Rp {parseFloat(item.subtotal).toLocaleString()}</span>
                                </div>
                            ))}
                            {/* For offline orders items structure is different */}
                            {!completedOrder?.items?.[0]?.product && completedOrder?.items?.map((item: any, i: number) => {
                                const p = products.find(prod => prod.id === item.product_id);
                                return (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span>{item.quantity}x {p?.name || 'Item'}</span>
                                        <span className="font-medium">Rp {(item.quantity * (p?.price || 0)).toLocaleString()}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <Separator className="border-dashed" />

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Subtotal</span>
                                <span>Rp {parseFloat(completedOrder?.subtotal || 0).toLocaleString()}</span>
                            </div>
                            {parseFloat(completedOrder?.discount_amount || 0) > 0 && (
                                <div className="flex justify-between text-red-500">
                                    <span>Discount</span>
                                    <span>- Rp {parseFloat(completedOrder?.discount_amount).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-slate-500">Tax (10%)</span>
                                <span>Rp {parseFloat(completedOrder?.tax_amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span>Total</span>
                                <span>Rp {parseFloat(completedOrder?.total_price || 0).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="pt-4 text-center">
                            <p className="text-xs font-medium text-slate-400 italic">Thank you for your visit!</p>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 flex gap-3">
                        <Button className="flex-1" variant="outline" onClick={() => setShowSuccess(false)}>
                            <X className="w-4 h-4 mr-2" /> Close
                        </Button>
                        <Button className="flex-1 bg-slate-900" onClick={() => window.print()}>
                            <Printer className="w-4 h-4 mr-2" /> Print Struk
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </AppShell>
    );
}
