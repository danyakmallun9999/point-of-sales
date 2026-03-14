import { Head, useForm } from '@inertiajs/react';
import { Edit, Plus, Trash2, Folder } from 'lucide-react';
import { useState } from 'react';
import { store, update, destroy } from '@/actions/App/Http/Controllers/CategoryController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

interface Category {
    id: number;
    name: string;
    products_count: number;
}

interface Props {
    categories: Category[];
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Management', href: '#' },
    { title: 'Categories', href: '/management/categories' },
];

export default function CategoryIndex({ categories }: Props) {
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const addForm = useForm({
        name: '',
    });

    const editForm = useForm({
        name: '',
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
        if (!editingCategory) return;
        editForm.patch(update(editingCategory.id).url, {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingCategory(null);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            useForm().delete(destroy(id).url);
        }
    };

    const openEdit = (category: Category) => {
        setEditingCategory(category);
        editForm.setData('name', category.name);
        setIsEditOpen(true);
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
                        <p className="text-muted-foreground">Manage your product categories here.</p>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-amber-600 hover:bg-amber-700">
                                <Plus className="mr-2 h-4 w-4" /> Add Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={submitAdd}>
                                <DialogHeader>
                                    <DialogTitle>Add Category</DialogTitle>
                                    <DialogDescription>Create a new category for your products.</DialogDescription>
                                </DialogHeader>
                                <div className="py-4 space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input 
                                        id="name" 
                                        value={addForm.data.name} 
                                        onChange={e => addForm.setData('name', e.target.value)}
                                        placeholder="Category Name"
                                    />
                                    {addForm.errors.name && <p className="text-sm text-red-500">{addForm.errors.name}</p>}
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={addForm.processing}>Save</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Products Count</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Folder className="w-4 h-4 text-slate-400" />
                                            {category.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{category.products_count} items</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(category)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(category.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {categories.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <form onSubmit={submitEdit}>
                            <DialogHeader>
                                <DialogTitle>Edit Category</DialogTitle>
                                <DialogDescription>Update category information.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input 
                                    id="edit-name" 
                                    value={editForm.data.name} 
                                    onChange={e => editForm.setData('name', e.target.value)}
                                />
                                {editForm.errors.name && <p className="text-sm text-red-500">{editForm.errors.name}</p>}
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={editForm.processing}>Update</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppSidebarLayout>
    );
}
