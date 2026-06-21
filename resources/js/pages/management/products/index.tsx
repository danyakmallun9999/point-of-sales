import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Edit, Plus, Trash2, Coffee, Layers, Package, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { store, update, destroy } from '@/actions/App/Http/Controllers/ProductController';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

interface Product {
    id: number;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    image: string | null;
    category_id: number;
    category: { name: string };
}

interface Category {
    id: number;
    name: string;
}

interface Props {
    products: Product[];
    categories: Category[];
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Management', href: '#' },
    { title: 'Products', href: '/management/products' },
];

export default function ProductIndex({ products, categories }: Props) {
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Restock & Batch Management States
    const { outlets = [] } = usePage().props as any;
    const [isRestockOpen, setIsRestockOpen] = useState(false);
    const [selectedProductForRestock, setSelectedProductForRestock] = useState<Product | null>(null);
    const [batches, setBatches] = useState<any[]>([]);
    const [isLoadingBatches, setIsLoadingBatches] = useState(false);

    const restockForm = useForm({
        outlet_id: '',
        initial_quantity: '',
        buy_price: '',
        expired_at: '',
    });

    const openRestock = (product: Product) => {
        setSelectedProductForRestock(product);
        setIsRestockOpen(true);
        setIsLoadingBatches(true);
        restockForm.setData({
            outlet_id: outlets[0]?.id?.toString() || '',
            initial_quantity: '',
            buy_price: '',
            expired_at: '',
        });
        restockForm.clearErrors();

        fetch(`/management/products/${product.id}/batches`)
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }
                throw new Error('Failed to load batches');
            })
            .then((data) => setBatches(data))
            .catch((err) => console.error(err))
            .finally(() => setIsLoadingBatches(false));
    };

    const submitRestock = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductForRestock) {
            return;
        }

        restockForm.post(`/management/products/${selectedProductForRestock.id}/batches`, {
            onSuccess: () => {
                restockForm.reset('initial_quantity', 'buy_price', 'expired_at');
                // Refresh the batch list
                fetch(`/management/products/${selectedProductForRestock.id}/batches`)
                    .then((res) => res.json())
                    .then((data) => setBatches(data))
                    .catch((err) => console.error(err));
            },
        });
    };

    const addForm = useForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image: null as File | null,
    });

    const editForm = useForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image: null as File | null,
        _method: 'PATCH',
    });

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(store().url, {
            onSuccess: () => {
                setIsAddOpen(false);
                addForm.reset();
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        // When sending files with PATCH, we usually use POST and _method: 'PATCH'
        editForm.post(update(editingProduct.id).url, {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingProduct(null);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(destroy(id).url);
        }
    };

    const openEdit = (product: Product) => {
        setEditingProduct(product);
        editForm.setData({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            stock: product.stock.toString(),
            category_id: product.category_id.toString(),
            image: null,
            _method: 'PATCH',
        });
        setIsEditOpen(true);
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Products</h2>
                        <p className="text-muted-foreground">Manage your coffee and treats.</p>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Product
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={submitAdd}>
                                <DialogHeader>
                                    <DialogTitle>Add Product</DialogTitle>
                                    <DialogDescription>Create a new item in your catalog.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" value={addForm.data.name} onChange={e => addForm.setData('name', e.target.value)} placeholder="Espresso" />
                                        {addForm.errors.name && <p className="text-xs text-destructive">{addForm.errors.name}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="category">Category</Label>
                                            <Select onValueChange={v => addForm.setData('category_id', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            {addForm.errors.category_id && <p className="text-xs text-destructive">{addForm.errors.category_id}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="price">Price (Rp)</Label>
                                            <Input id="price" type="number" value={addForm.data.price} onChange={e => addForm.setData('price', e.target.value)} placeholder="25000" />
                                            {addForm.errors.price && <p className="text-xs text-destructive">{addForm.errors.price}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="stock">Initial Stock</Label>
                                            <Input id="stock" type="number" value={addForm.data.stock} onChange={e => addForm.setData('stock', e.target.value)} placeholder="100" />
                                            {addForm.errors.stock && <p className="text-xs text-destructive">{addForm.errors.stock}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="image">Image</Label>
                                            <Input id="image" type="file" onChange={e => addForm.setData('image', e.target.files?.[0] || null)} accept="image/*" />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea id="description" value={addForm.data.description} onChange={e => addForm.setData('description', e.target.value)} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={addForm.processing}>Save Product</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Product Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                            {product.image ? (
                                                <img src={product.image} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <Coffee className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{product.name}</div>
                                        <div className="text-xs text-muted-foreground line-clamp-1">{product.description}</div>
                                    </TableCell>
                                    <TableCell>{product.category.name}</TableCell>
                                    <TableCell>Rp {product.price.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <span className={product.stock < 10 ? 'text-destructive font-bold' : 'text-foreground'}>
                                            {product.stock} units
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => openRestock(product)} title="Restock / Batches">
                                            <Layers className="w-4 h-4 text-primary" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(product.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <form onSubmit={submitEdit}>
                            <DialogHeader>
                                <DialogTitle>Edit Product</DialogTitle>
                                <DialogDescription>Update product information.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Name</Label>
                                    <Input id="edit-name" value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-category">Category</Label>
                                        <Select value={editForm.data.category_id} onValueChange={v => editForm.setData('category_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-price">Price (Rp)</Label>
                                        <Input id="edit-price" type="number" value={editForm.data.price} onChange={e => editForm.setData('price', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-stock">Stock</Label>
                                        <Input id="edit-stock" type="number" value={editForm.data.stock} onChange={e => editForm.setData('stock', e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-image">Update Image</Label>
                                        <Input id="edit-image" type="file" onChange={e => editForm.setData('image', e.target.files?.[0] || null)} accept="image/*" />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-description">Description</Label>
                                    <Textarea id="edit-description" value={editForm.data.description} onChange={e => editForm.setData('description', e.target.value)} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={editForm.processing}>Update Product</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Restock & Batches Dialog */}
                <Dialog open={isRestockOpen} onOpenChange={setIsRestockOpen}>
                    <DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col p-0 overflow-hidden bg-card border-border">
                        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
                            <DialogTitle className="flex items-center gap-2 text-foreground">
                                <Package className="w-5 h-5 text-primary" />
                                Restock & Kelola Batch: {selectedProductForRestock?.name}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Tambahkan stok baru ke outlet spesifik dan kelola batch kedaluwarsa (FEFO).
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-6">
                            {/* Form Input Batch Baru */}
                            <form onSubmit={submitRestock} className="bg-muted/40 rounded-xl p-4 border border-border/50 space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Tambah Stok Baru</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="restock-outlet">Outlet Cabang</Label>
                                        <Select
                                            value={restockForm.data.outlet_id}
                                            onValueChange={(v) => restockForm.setData('outlet_id', v)}
                                        >
                                            <SelectTrigger id="restock-outlet" className="bg-card border-border">
                                                <SelectValue placeholder="Pilih Outlet" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border">
                                                {outlets.map((o: any) => (
                                                    <SelectItem key={o.id} value={o.id.toString()}>{o.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {restockForm.errors.outlet_id && <p className="text-xs text-destructive">{restockForm.errors.outlet_id}</p>}
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="restock-qty">Jumlah (Qty)</Label>
                                        <Input
                                            id="restock-qty"
                                            type="number"
                                            className="bg-card border-border font-bold"
                                            value={restockForm.data.initial_quantity}
                                            onChange={(e) => restockForm.setData('initial_quantity', e.target.value)}
                                            placeholder="50"
                                        />
                                        {restockForm.errors.initial_quantity && <p className="text-xs text-destructive">{restockForm.errors.initial_quantity}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="restock-price">Harga Beli per Unit (Rp)</Label>
                                        <Input
                                            id="restock-price"
                                            type="number"
                                            className="bg-card border-border"
                                            value={restockForm.data.buy_price}
                                            onChange={(e) => restockForm.setData('buy_price', e.target.value)}
                                            placeholder="12000"
                                        />
                                        {restockForm.errors.buy_price && <p className="text-xs text-destructive">{restockForm.errors.buy_price}</p>}
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="restock-exp">Tanggal Kedaluwarsa</Label>
                                        <Input
                                            id="restock-exp"
                                            type="date"
                                            className="bg-card border-border"
                                            value={restockForm.data.expired_at}
                                            onChange={(e) => restockForm.setData('expired_at', e.target.value)}
                                        />
                                        {restockForm.errors.expired_at && <p className="text-xs text-destructive">{restockForm.errors.expired_at}</p>}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" size="sm" disabled={restockForm.processing} className="h-9">
                                        {restockForm.processing ? 'Menyimpan...' : 'Simpan Batch Baru'}
                                    </Button>
                                </div>
                            </form>

                            {/* Daftar Batch Aktif */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Batch Inventaris Aktif</h3>
                                {isLoadingBatches ? (
                                    <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground text-sm">
                                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                        <span>Memuat daftar batch...</span>
                                    </div>
                                ) : (
                                    <div className="border border-border rounded-lg overflow-hidden bg-card">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/30">
                                                    <TableHead>Outlet</TableHead>
                                                    <TableHead className="text-center">Sisa Stok</TableHead>
                                                    <TableHead className="text-right">Harga Beli</TableHead>
                                                    <TableHead className="text-center">Tgl Kedaluwarsa</TableHead>
                                                    <TableHead className="text-center">Tgl Dibuat</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {batches.map((batch, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell className="font-semibold">{batch.outlet?.name || 'Global'}</TableCell>
                                                        <TableCell className="text-center font-bold">
                                                            {batch.remaining_quantity} / {batch.initial_quantity} unit
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono">Rp {batch.buy_price.toLocaleString()}</TableCell>
                                                        <TableCell className="text-center font-mono text-sm">
                                                            {batch.expired_at ? (
                                                                <span className="text-amber-500 font-bold">
                                                                    {new Date(batch.expired_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                                            {new Date(batch.created_at).toLocaleDateString('id-ID', { dateStyle: 'short' })}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {batches.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground italic text-xs">
                                                            Belum ada batch inventaris untuk produk ini.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="px-6 py-4 bg-muted/20 border-t border-border shrink-0">
                            <Button onClick={() => setIsRestockOpen(false)} variant="outline" className="w-full sm:w-auto">
                                Selesai & Tutup
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppSidebarLayout>
    );
}
