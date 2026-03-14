import { Head, useForm } from '@inertiajs/react';
import { Edit, Plus, Trash2, UserCog, ShieldCheck, ShieldAlert, User } from 'lucide-react';
import { useState } from 'react';
import { store, update, destroy } from '@/actions/App/Http/Controllers/UserController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

interface UserData {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'cashier';
}

interface Props {
    users: UserData[];
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Management', href: '#' },
    { title: 'Users', href: '/management/users' },
];

export default function UserIndex({ users }: Props) {
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const addForm = useForm({
        name: '',
        email: '',
        role: 'cashier',
        password: '',
        password_confirmation: '',
    });

    const editForm = useForm({
        name: '',
        email: '',
        role: 'cashier',
        password: '',
        password_confirmation: '',
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
        if (!editingUser) return;
        editForm.patch(update(editingUser.id).url, {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingUser(null);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            useForm().delete(destroy(id).url);
        }
    };

    const openEdit = (user: UserData) => {
        setEditingUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '',
            password_confirmation: '',
        });
        setIsEditOpen(true);
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200"><ShieldAlert className="w-3 h-3 mr-1" /> Admin</Badge>;
            case 'manager': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200"><ShieldCheck className="w-3 h-3 mr-1" /> Manager</Badge>;
            default: return <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200"><User className="w-3 h-3 mr-1" /> Cashier</Badge>;
        }
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Users</h2>
                        <p className="text-muted-foreground">Manage staff access and roles.</p>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-slate-900">
                                <Plus className="mr-2 h-4 w-4" /> Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={submitAdd}>
                                <DialogHeader>
                                    <DialogTitle>Add New User</DialogTitle>
                                    <DialogDescription>Create an account for your staff members.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" value={addForm.data.name} onChange={e => addForm.setData('name', e.target.value)} />
                                        {addForm.errors.name && <p className="text-xs text-red-500">{addForm.errors.name}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" type="email" value={addForm.data.email} onChange={e => addForm.setData('email', e.target.value)} />
                                        {addForm.errors.email && <p className="text-xs text-red-500">{addForm.errors.email}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Select value={addForm.data.role} onValueChange={(v: any) => addForm.setData('role', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Administrator</SelectItem>
                                                <SelectItem value="manager">Manager</SelectItem>
                                                <SelectItem value="cashier">Cashier</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="password">Password</Label>
                                            <Input id="password" type="password" value={addForm.data.password} onChange={e => addForm.setData('password', e.target.value)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="password_confirmation">Confirm</Label>
                                            <Input id="password_confirmation" type="password" value={addForm.data.password_confirmation} onChange={e => addForm.setData('password_confirmation', e.target.value)} />
                                        </div>
                                    </div>
                                    {addForm.errors.password && <p className="text-xs text-red-500">{addForm.errors.password}</p>}
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={addForm.processing}>Create User</Button>
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
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(user.id)}>
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
                    <DialogContent>
                        <form onSubmit={submitEdit}>
                            <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                                <DialogDescription>Update profile or change access role.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Full Name</Label>
                                    <Input id="edit-name" value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-role">Role</Label>
                                    <Select value={editForm.data.role} onValueChange={(v: any) => editForm.setData('role', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Administrator</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="cashier">Cashier</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="pt-4 border-t">
                                    <Label className="text-xs text-slate-500 uppercase font-bold">Change Password (Leave blank to keep current)</Label>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <div className="grid gap-2">
                                            <Input id="edit-password" type="password" placeholder="New Password" value={editForm.data.password} onChange={e => editForm.setData('password', e.target.value)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Input id="edit-password-confirm" type="password" placeholder="Confirm" value={editForm.data.password_confirmation} onChange={e => editForm.setData('password_confirmation', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={editForm.processing}>Update User</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppSidebarLayout>
    );
}
