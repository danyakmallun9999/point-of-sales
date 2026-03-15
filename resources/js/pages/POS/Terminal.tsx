import { Head, router } from '@inertiajs/react';
import { Coffee, Plus, Minus, Trash2, Search, QrCode, Banknote, Loader2, CheckCircle2, WifiOff, RefreshCw, Printer, X, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createQrisCharge, checkStatus } from '@/actions/App/Http/Controllers/PaymentController';
import { store as storeOrder } from '@/actions/App/Http/Controllers/POSController';
import { AppShell } from '@/components/app-shell';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { syncCatalog, getOfflineCatalog, saveOfflineOrder, getUnsyncedOrders, markOrderSynced } from '@/lib/db';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
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
    const formatPrice = (price: number | string) => {
        return Number(price).toLocaleString('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };

    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [, setCategories] = useState<any[]>(initialCategories);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [discount, setDiscount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [qrisData, setQrisData] = useState<{ qr_url?: string; status?: string; orderId?: number; midtransOrderId?: string; orderTotal?: number } | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [completedOrder, setCompletedOrder] = useState<any>(null);
    const [cartOpen, setCartOpen] = useState(false);
    const [justAddedId, setJustAddedId] = useState<number | null>(null);

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

    const addToCart = (product: Product) => {
        const existing = cart.find((item) => item.id === product.id);
        const currentQty = existing ? existing.quantity : 0;

        if (currentQty >= product.stock) {
            alert(`Stok tidak mencukupi untuk ${product.name}`);
            return;
        }

        setJustAddedId(product.id);
        window.setTimeout(() => setJustAddedId(null), 500);
        setCart((prev) => {
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
                    const product = products.find(p => p.id === productId);
                    const newQty = Math.max(1, item.quantity + delta);

                    if (product && newQty > product.stock) {
                        alert(`Stok tidak mencukupi untuk ${product.name}`);
                        return item;
                    }

                    return { ...item, quantity: newQty };
                }
                return item;
            }),
        );
    };

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = Math.max(0, (subtotal - discount) * 0.1);
    const total = Math.max(0, subtotal - discount + tax);
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

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

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (qrisData?.orderId && qrisData?.status === 'pending') {
            interval = setInterval(async () => {
                try {
                    const url = new URL(checkStatus(qrisData.orderId as any).url, window.location.origin);
                    if (qrisData.midtransOrderId) {
                        url.searchParams.append('midtrans_order_id', qrisData.midtransOrderId);
                    }

                    const response = await fetch(url.toString());
                    const data = await response.json();

                    if (data.payment_status === 'paid') {
                        setCompletedOrder(data.order ?? null);
                        setShowSuccess(true);
                        setQrisData(null);
                        setCart([]);
                        setDiscount(0);
                        router.reload({ only: ['products'] });
                    }
                } catch (e) {
                    console.error('Polling error:', e);
                }
            }, 3000);
        }

        return () => clearInterval(interval);
    }, [qrisData]);

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

            if (response.ok && (data.actions || data.order_id)) {
                const qrAction = Array.isArray(data.actions) ? data.actions.find((a: any) => a.name === 'generate-qr-code') : null;
                setQrisData({
                    qr_url: qrAction?.url,
                    status: 'pending',
                    orderId,
                    midtransOrderId: data.order_id,
                    orderTotal: data.order_total ?? data.gross_amount,
                });
            } else {
                alert(`QRIS Failed: ${data.error || data.status_message || 'Unknown error'}`);
            }
        } catch {
            alert('QRIS Request Failed. Check console for details.');
        } finally {
            setIsProcessing(false);
        }
    };

    // ─── Cart Panel ──────────────────────────────────────────────────────────────
    //
    // Struktur 3 zona yang WAJIB untuk scroll independen:
    //
    //  ┌─────────────────────────┐  ← shrink-0   (header, tinggi tetap)
    //  │  Header "Order"         │
    //  ├─────────────────────────┤
    //  │  Daftar item            │  ← flex-1 min-h-0 overflow-y-auto  (SCROLL DI SINI)
    //  │  (scrollable)           │
    //  │                         │
    //  ├─────────────────────────┤
    //  │  Diskon + Total         │  ← shrink-0   (footer, SELALU TAMPIL)
    //  │  [Tunai]  [QRIS]        │
    //  └─────────────────────────┘
    //
    // Container induk HARUS: flex flex-col h-full overflow-hidden
    // min-h-0 pada zona tengah adalah KUNCI — tanpanya flex tidak bisa membatasi tinggi

    const CartPanel = () => (
        <div className="flex flex-col h-full overflow-hidden bg-sidebar">

            {/* ZONA 1 — Header (tinggi tetap, tidak scroll) */}
            <div className="shrink-0 px-5 py-4 border-b border-sidebar-border">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-sidebar-foreground tracking-wide">Order</h2>
                    {cart.length > 0 && (
                        <span className="text-xs bg-primary text-primary-foreground font-bold px-2.5 py-0.5 rounded-full">
                            {totalItems} item{totalItems > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </div>

            {/* ZONA 2 — Item list (flex-1 min-h-0 = scroll area tersendiri) */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-5 py-4">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground py-12">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                            <Coffee className="w-7 h-7 opacity-40" />
                        </div>
                        <p className="text-sm font-medium">Keranjang kosong</p>
                        <p className="text-xs text-center">Pilih menu dari katalog untuk memulai</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cart.map((item) => (
                            <div key={item.id} className="rounded-xl bg-sidebar-accent/50 p-3 transition-colors">
                                <div className="flex gap-3">
                                    <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                                        {item.image ? (
                                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Coffee className="w-7 h-7 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-sidebar-foreground line-clamp-2 leading-snug">{item.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Rp {formatPrice(item.price)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-sidebar-border/50">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            aria-label="Kurangi jumlah"
                                            className="w-10 h-10 rounded-xl bg-muted text-sidebar-foreground flex items-center justify-center transition-colors active:bg-sidebar-accent touch-manipulation"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <span className="min-w-8 text-center text-sm font-bold text-sidebar-foreground tabular-nums">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            aria-label="Tambah jumlah"
                                            className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center transition-colors active:bg-primary/80 touch-manipulation"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        aria-label="Hapus dari keranjang"
                                        className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center transition-colors active:bg-destructive/20 touch-manipulation"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ZONA 3 — Summary + Tombol bayar (shrink-0 = SELALU TAMPIL, tidak pernah terdorong scroll) */}
            <div className="shrink-0 px-5 py-5 border-t border-sidebar-border space-y-4 bg-sidebar">
                {/* Diskon */}
                <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-3 py-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Diskon</Label>
                    <div className="flex-1 flex items-center gap-1">
                        <span className="text-muted-foreground text-sm font-medium">Rp</span>
                        <Input
                            type="number"
                            className="h-7 border-0 bg-transparent text-right font-bold text-sidebar-foreground focus-visible:ring-0 p-0 text-sm"
                            value={discount}
                            onChange={(e) => setDiscount(Number(e.target.value))}
                        />
                    </div>
                </div>

                {/* Ringkasan harga */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Subtotal</span>
                        <span>Rp {formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-xs text-destructive">
                            <span>Diskon</span>
                            <span>− Rp {formatPrice(discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Pajak (10%)</span>
                        <span>Rp {formatPrice(tax)}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2 border-t border-sidebar-border">
                        <span className="text-sm font-bold text-sidebar-foreground">Total</span>
                        <span className="text-xl font-black text-primary">Rp {formatPrice(total)}</span>
                    </div>
                </div>

                {/* Tombol pembayaran */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        disabled={cart.length === 0 || isProcessing}
                        onClick={() => handleCheckout('cash')}
                        className="h-14 rounded-xl font-bold text-base flex items-center justify-center gap-2
                                   bg-secondary text-secondary-foreground border border-border
                                   disabled:opacity-40 disabled:cursor-not-allowed
                                   transition-colors active:bg-secondary/80 touch-manipulation"
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Banknote className="w-5 h-5" />}
                        Tunai
                    </button>
                    <button
                        disabled={cart.length === 0 || isProcessing}
                        onClick={() => handleCheckout('qris')}
                        className="h-14 rounded-xl font-bold text-base flex items-center justify-center gap-2
                                   bg-primary text-primary-foreground
                                   disabled:opacity-40 disabled:cursor-not-allowed
                                   transition-colors active:bg-primary/80 shadow-lg shadow-primary/20 touch-manipulation"
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
                        QRIS
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <AppShell>
            <Head title="POS Terminal" />

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes cartPop {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                    100% { transform: scale(1); }
                }
                .animate-fadeInUp { animation: fadeInUp 0.35s ease-out forwards; }
                .animate-cart-pop { animation: cartPop 0.35s ease-out; }

                /* Paksa wrapper AppShell mengisi sisa tinggi viewport dengan flex */
                html, body { height: 100dvh; overflow: hidden; }
                #app { display: flex; flex-direction: column; height: 100dvh; overflow: hidden; }
                /* pos-layout: container langsung di dalam AppShell content area */
                .pos-layout { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
            `}</style>

            <div className="pos-layout">
            <div className="flex flex-col lg:flex-row flex-1 min-h-0 bg-background overflow-hidden font-sans">

                {/* ── KIRI: Katalog Produk ─────────────────────────────────── */}
                <div className="flex flex-1 flex-col min-h-0 min-w-0 overflow-hidden">

                    {/* Top Bar — shrink-0 agar tidak ikut scroll */}
                    <div className="shrink-0 bg-card border-b border-border px-3 py-2.5 sm:px-4 md:px-6 md:py-3 flex items-center gap-2 sm:gap-3">
                        {/* Brand */}
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary rounded-lg flex items-center justify-center">
                                <Coffee className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-primary-foreground" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-base font-black text-foreground leading-none">Brew & Bytes</h1>
                                <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">POS Terminal</p>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="hidden sm:flex items-center gap-2">
                            {isOnline ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                    Online
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive bg-destructive/5 border border-destructive/20 px-2.5 py-1 rounded-full">
                                    <WifiOff className="w-3 h-3" /> Offline
                                </span>
                            )}
                            {isSyncing && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/5 border border-primary/20 px-2.5 py-1 rounded-full animate-pulse">
                                    <RefreshCw className="w-3 h-3 animate-spin" /> Syncing…
                                </span>
                            )}
                        </div>

                        {/* Search */}
                        <div className="relative flex-1 max-w-xs ml-auto md:ml-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Cari menu…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 h-9 rounded-full bg-muted/50 border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                            />
                        </div>

                        {/* Tombol keranjang mobile */}
                        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                            <SheetTrigger asChild>
                                <button
                                    aria-label="Buka keranjang"
                                    className="lg:hidden relative w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 transition-colors hover:bg-primary/90"
                                >
                                    <ShoppingBag className="w-5 h-5 text-primary-foreground" />
                                    {totalItems > 0 && (
                                        <span key={totalItems} className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-accent text-accent-foreground text-[10px] font-black flex items-center justify-center px-1 animate-cart-pop">
                                            {totalItems}
                                        </span>
                                    )}
                                </button>
                            </SheetTrigger>
                            {/*
                                SheetContent: h-full agar CartPanel bisa flex penuh.
                                flex flex-col agar CartPanel mengisi tinggi dengan benar.
                            */}
                            <SheetContent side="right" className="p-0 w-full max-w-[100vw] sm:w-[400px] bg-sidebar border-l border-sidebar-border flex flex-col h-full">
                                <CartPanel />
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Grid produk — flex-1 min-h-0 = scroll tersendiri */}
                    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide p-3 sm:p-4 md:p-6">
                        {filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-muted-foreground/50">
                                <Coffee className="w-12 h-12 opacity-20" />
                                <p className="text-sm">Produk tidak ditemukan</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                                {filteredProducts.map((product, i) => {
                                    const isOutOfStock = product.stock <= 0;
                                    const cartItem = cart.find(c => c.id === product.id);

                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => !isOutOfStock && addToCart(product)}
                                            style={{ animationDelay: `${Math.min(i * 25, 300)}ms` }}
                                            className={`animate-fadeInUp cursor-pointer bg-card rounded-xl sm:rounded-2xl overflow-hidden border border-border/50 shadow-sm transition-[shadow,border-color] duration-200 active:shadow-md active:border-primary/30 ${isOutOfStock ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
                                        >
                                            <div className="aspect-square relative bg-muted/30 overflow-hidden">
                                                {product.image ? (
                                                    <img src={product.image} alt={product.name} width={400} height={400} className="object-cover w-full h-full" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-muted/50 to-primary/5">
                                                        <Coffee className="w-10 h-10 text-primary/20" />
                                                    </div>
                                                )}
                                                {!isOutOfStock && (
                                                    <div className="absolute inset-0 bg-primary/15 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                        <div className={`w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transition-transform ${justAddedId === product.id ? 'animate-cart-pop' : ''}`}>
                                                            <Plus className="w-6 h-6" />
                                                        </div>
                                                    </div>
                                                )}

                                                {isOutOfStock && (
                                                    <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center">
                                                        <div className="bg-destructive text-destructive-foreground text-[10px] font-black px-2 py-1 rounded-full shadow-lg uppercase tracking-wider">
                                                            Stok Habis
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="absolute bottom-2 left-2 bg-card/95 backdrop-blur-md text-card-foreground text-[11px] font-black px-2 py-1 rounded-lg border border-border/50 shadow-sm flex items-center gap-1">
                                                    <span className="text-primary text-[9px]">Rp</span>
                                                    {formatPrice(product.price)}
                                                </div>

                                                {cartItem && (
                                                    <div className={`absolute top-2 right-2 bg-primary text-primary-foreground flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-lg border border-primary-foreground/20 ${justAddedId === product.id ? 'animate-cart-pop' : ''}`}>
                                                        <ShoppingBag className="w-3 h-3" />
                                                        <span className="text-[11px] font-black leading-none">{cartItem.quantity}</span>
                                                    </div>
                                                )}

                                                {product.stock > 0 && product.stock <= 5 && (
                                                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase">
                                                        Sisa {product.stock}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 min-h-16 flex flex-col justify-center">
                                                <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2">{product.name}</h3>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                                                    <span className={`text-[10px] font-bold ${product.stock <= 5 ? 'text-amber-500' : 'text-muted-foreground/50'}`}>
                                                        Stok: {product.stock}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── KANAN: Cart Sidebar (desktop) ────────────────────────── */}
                {/*
                    min-h-0 WAJIB di sini — tanpanya kolom bisa melampaui tinggi viewport
                    dan CartPanel tidak bisa membatasi zona scrollnya.
                */}
                <div className="hidden lg:flex w-[360px] xl:w-[420px] shrink-0 flex-col min-h-0 border-l border-border">
                    <CartPanel />
                </div>
            </div>
            </div>{/* end pos-layout */}

            {/* ── QRIS Modal ──────────────────────────────────────────────── */}
            <Dialog open={!!qrisData} onOpenChange={() => { setQrisData(null); setCart([]); setDiscount(0); }}>
                <DialogContent className="sm:max-w-sm bg-card border-border p-0 overflow-hidden">
                    <div className="bg-primary px-6 pt-6 pb-8 text-center relative">
                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-card rounded-t-3xl" />
                        <QrCode className="w-8 h-8 text-primary-foreground mx-auto mb-2" />
                        <h2 className="text-xl font-black text-primary-foreground">Scan & Bayar</h2>
                        <p className="text-primary-foreground/80 text-sm mt-1">Gunakan m-banking atau e-wallet</p>
                    </div>
                    <div className="px-6 pb-6 pt-2 flex flex-col items-center gap-4">
                        <div className="bg-card rounded-2xl p-3 shadow-xl border border-border">
                            {qrisData?.qr_url ? (
                                <img src={qrisData.qr_url} alt="QRIS Code" width={224} height={224} className="w-56 h-56" />
                            ) : (
                                <div className="w-56 h-56 flex items-center justify-center bg-muted rounded-xl">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-primary text-xs font-semibold uppercase tracking-wider">Total Pembayaran</p>
                            <p className="text-3xl font-black text-foreground mt-1">
                                Rp {formatPrice(qrisData?.orderTotal ?? total)}
                            </p>
                            {qrisData?.midtransOrderId && (
                                <p className="text-[10px] text-muted-foreground mt-2 font-mono opacity-50">
                                    Midtrans ID: {qrisData.midtransOrderId}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Menunggu konfirmasi pembayaran…</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Struk & Success Modal ────────────────────────────────────── */}
            <Dialog open={showSuccess} onOpenChange={(open) => { if (!open) { setShowSuccess(false); setCompletedOrder(null); } }}>
                <DialogContent className="sm:max-w-sm bg-card p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
                    <div className="bg-primary px-6 pt-8 pb-10 text-center relative">
                        <div className="w-14 h-14 bg-accent text-accent-foreground rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-primary-foreground">Pembayaran Berhasil!</h2>
                        <p className="text-primary-foreground/70 text-sm mt-1 font-mono">{completedOrder?.reference_number}</p>
                        <div className="absolute bottom-0 left-0 right-0 h-5 bg-card" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
                    </div>

                    <div className="px-6 py-4 max-h-[55vh] overflow-y-auto">
                        <div className="text-center mb-4">
                            <p className="font-bold text-base text-foreground">Brew & Bytes Coffee</p>
                            <p className="text-xs text-muted-foreground">Jl. Teknologi No. 123, Indonesia</p>
                            <p className="text-xs text-muted-foreground">{new Date().toLocaleString('id-ID')}</p>
                        </div>
                        <div className="border-t border-dashed border-border pt-4 space-y-2">
                            {completedOrder?.items?.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{item.quantity}× {item.product?.name || 'Product'}</span>
                                    <span className="font-semibold text-foreground">Rp {formatPrice(parseFloat(item.subtotal))}</span>
                                </div>
                            ))}
                            {!completedOrder?.items?.[0]?.product && completedOrder?.items?.map((item: any, i: number) => {
                                const p = products.find(prod => prod.id === item.product_id);
                                return (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{item.quantity}× {p?.name || 'Item'}</span>
                                        <span className="font-semibold text-foreground">Rp {formatPrice(item.quantity * (p?.price || 0))}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="border-t border-dashed border-border mt-4 pt-4 space-y-1.5 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>Rp {formatPrice(parseFloat(completedOrder?.subtotal || 0))}</span>
                            </div>
                            {parseFloat(completedOrder?.discount_amount || 0) > 0 && (
                                <div className="flex justify-between text-destructive">
                                    <span>Diskon</span>
                                    <span>− Rp {formatPrice(parseFloat(completedOrder?.discount_amount))}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-muted-foreground">
                                <span>Pajak (10%)</span>
                                <span>Rp {formatPrice(parseFloat(completedOrder?.tax_amount || 0))}</span>
                            </div>
                            <div className="flex justify-between text-base font-black pt-2 border-t border-border">
                                <span className="text-foreground">Total</span>
                                <span className="text-primary">Rp {formatPrice(parseFloat(completedOrder?.total_price || 0))}</span>
                            </div>
                        </div>
                        <p className="text-center text-xs text-muted-foreground italic mt-4">— Terima kasih atas kunjungan Anda —</p>
                    </div>

                    <div className="shrink-0 p-4 bg-muted/20 flex gap-2 border-t border-border">
                        <button
                            onClick={() => setShowSuccess(false)}
                            aria-label="Tutup struk"
                            className="flex-1 h-10 rounded-xl border border-border text-foreground hover:bg-muted text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                            <X className="w-4 h-4" /> Tutup
                        </button>
                        <button
                            onClick={() => window.print()}
                            aria-label="Cetak struk"
                            className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                            <Printer className="w-4 h-4" /> Print Struk
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppShell>
    );
}