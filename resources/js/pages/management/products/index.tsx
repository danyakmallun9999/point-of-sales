import { Head, useForm } from '@inertiajs/react';
import { Edit, Plus, Trash2, Coffee, ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { store, update, destroy } from '@/actions/App/Http/Controllers/ProductController';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
            useForm().delete(destroy(id).url);
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
                            <Button className="bg-amber-600 hover:bg-amber-700">
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
                                        {addForm.errors.name && <p className="text-xs text-red-500">{addForm.errors.name}</p>}
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
                                            {addForm.errors.category_id && <p className="text-xs text-red-500">{addForm.errors.category_id}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="price">Price (Rp)</Label>
                                            <Input id="price" type="number" value={addForm.data.price} onChange={e => addForm.setData('price', e.target.value)} placeholder="25000" />
                                            {addForm.errors.price && <p className="text-xs text-red-500">{addForm.errors.price}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="stock">Initial Stock</Label>
                                            <Input id="stock" type="number" value={addForm.data.stock} onChange={e => addForm.setData('stock', e.target.value)} placeholder="100" />
                                            {addForm.errors.stock && <p className="text-xs text-red-500">{addForm.errors.stock}</p>}
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
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                                            {product.image ? (
                                                <img src={product.image} className="w-full h-full object-cover" />
                                            ) : (
                                                <Coffee className="w-5 h-5 text-slate-400" />
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
                                        <span className={product.stock < 10 ? 'text-red-500 font-bold' : ''}>
                                            {product.stock} units
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(product.id)}>
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
            </div>
        </AppSidebarLayout>
    );
}
