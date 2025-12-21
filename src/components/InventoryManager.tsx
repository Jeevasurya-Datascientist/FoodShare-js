import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { InventoryItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit2, AlertTriangle, Search, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

const CATEGORIES = ['Grains', 'Vegetables', 'Fruits', 'Dairy', 'Canned Goods', 'Beverages', 'Other'];

const InventoryManager: React.FC = () => {
    const { currentUser } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<InventoryItem>>({
        name: '',
        quantity: '',
        unit: 'kg',
        category: 'Other',
        lowStockThreshold: 5
    });

    useEffect(() => {
        if (!currentUser) return;

        const q = query(collection(db, `users/${currentUser.uid}/inventory`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                expiryDate: doc.data().expiryDate?.toDate() || new Date()
            } as InventoryItem));
            setInventory(items);
            setLoading(false);
        });

        return unsubscribe;
    }, [currentUser]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        if (!formData.name || !formData.quantity) {
            toast.error("Name and Quantity are required");
            return;
        }

        try {
            const dataToSave = {
                ...formData,
                lastUpdated: serverTimestamp(),
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days for now, add field later
            };

            if (editingItem) {
                await updateDoc(doc(db, `users/${currentUser.uid}/inventory`, editingItem.id), dataToSave);
                toast.success('Item updated');
            } else {
                await addDoc(collection(db, `users/${currentUser.uid}/inventory`), dataToSave);
                toast.success('Item added');
            }
            setIsAddOpen(false);
            resetForm();
        } catch (error) {
            console.error("Error saving inventory:", error);
            toast.error("Failed to save item");
        }
    };

    const handleDelete = async (id: string) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, `users/${currentUser.uid}/inventory`, id));
            toast.success('Item deleted');
        } catch (error) {
            toast.error("Failed to delete item");
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            quantity: '',
            unit: 'kg',
            category: 'Other',
            lowStockThreshold: 5
        });
        setEditingItem(null);
    };

    const handleEdit = (item: InventoryItem) => {
        setEditingItem(item);
        setFormData(item);
        setIsAddOpen(true);
    };

    const [filterCategory, setFilterCategory] = useState('All');
    const [sortBy, setSortBy] = useState('expiryDate');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const filteredAndSortedInventory = inventory
        .filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (sortBy === 'quantity') {
                comparison = parseFloat(a.quantity) - parseFloat(b.quantity);
            } else if (sortBy === 'expiryDate') {
                comparison = a.expiryDate.getTime() - b.expiryDate.getTime();
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    const isExpiringSoon = (date: Date) => {
        const today = new Date();
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
    };

    const isExpired = (date: Date) => {
        return date < new Date();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-display">Inventory Management</h2>
                    <p className="text-muted-foreground">Track your food stock and reduce waste.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Item Name</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Rice"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={val => setFormData({ ...formData, category: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label>Quantity</Label>
                                    <Input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                        placeholder="10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Unit</Label>
                                    <Select
                                        value={formData.unit}
                                        onValueChange={val => setFormData({ ...formData, unit: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="kg">kg</SelectItem>
                                            <SelectItem value="lbs">lbs</SelectItem>
                                            <SelectItem value="items">items</SelectItem>
                                            <SelectItem value="l">l</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Low Stock Alert Threshold</Label>
                                <Input
                                    type="number"
                                    value={formData.lowStockThreshold}
                                    onChange={e => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                {editingItem ? 'Update Item' : 'Add Item'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-2 flex-1">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search inventory..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="flex-1"
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Categories</SelectItem>
                            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="expiryDate">Expiry Date</SelectItem>
                            <SelectItem value="quantity">Quantity</SelectItem>
                            <SelectItem value="name">Name</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                </div>
            </div>

            {/* Inventory List */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Expiry Status</TableHead>
                                <TableHead>Stock Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                                </TableRow>
                            ) : filteredAndSortedInventory.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No items found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAndSortedInventory.map(item => {
                                    const isLowStock = Number(item.quantity) <= (item.lowStockThreshold || 0);
                                    const expiring = isExpiringSoon(item.expiryDate);
                                    const expired = isExpired(item.expiryDate);

                                    return (
                                        <TableRow key={item.id} className={expired ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell>{item.quantity} {item.unit}</TableCell>
                                            <TableCell>
                                                {expired ? (
                                                    <span className="flex items-center text-red-600 text-xs font-bold">
                                                        <AlertTriangle className="h-3 w-3 mr-1" /> Expired
                                                    </span>
                                                ) : expiring ? (
                                                    <span className="flex items-center text-orange-600 text-xs font-semibold">
                                                        <Clock className="h-3 w-3 mr-1" /> Expiring Soon
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">
                                                        {item.expiryDate.toLocaleDateString()}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {isLowStock ? (
                                                    <span className="flex items-center text-orange-500 text-xs font-semibold">
                                                        <AlertTriangle className="h-3 w-3 mr-1" /> Low Stock
                                                    </span>
                                                ) : (
                                                    <span className="text-green-600 text-xs font-semibold">In Stock</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default InventoryManager;
