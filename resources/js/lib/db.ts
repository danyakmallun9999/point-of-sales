import type { IDBPDatabase } from 'idb';
import { openDB } from 'idb';

const DB_NAME = 'poso_db';
const DB_VERSION = 1;

export interface DBProduct {
    id: number;
    name: string;
    description: string | null;
    price: number;
    image?: string;
    category_id: number;
}

export interface DBCategory {
    id: number;
    name: string;
}

export interface DBOfflineOrder {
    id?: number;
    customer_name: string;
    payment_method: 'cash';
    items: {
        product_id: number;
        quantity: number;
    }[];
    created_at: string;
    synced: number; // 0 for no, 1 for yes
    sync_failed?: number; // 0 or 1
    sync_error?: string;
}

export async function initDB(): Promise<IDBPDatabase> {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Products store
            if (!db.objectStoreNames.contains('products')) {
                db.createObjectStore('products', { keyPath: 'id' });
            }
            // Categories store
            if (!db.objectStoreNames.contains('categories')) {
                db.createObjectStore('categories', { keyPath: 'id' });
            }
            // Offline Orders store
            if (!db.objectStoreNames.contains('orders')) {
                db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
            }
        },
    });
}

export async function syncCatalog(products: DBProduct[], categories: DBCategory[]) {
    const db = await initDB();
    const txProd = db.transaction('products', 'readwrite');
    const storeProd = txProd.objectStore('products');
    await storeProd.clear();
    for (const p of products) {
        await storeProd.put(p);
    }

    const txCat = db.transaction('categories', 'readwrite');
    const storeCat = txCat.objectStore('categories');
    await storeCat.clear();
    for (const c of categories) {
        await storeCat.put(c);
    }
}

export async function getOfflineCatalog() {
    const db = await initDB();
    const products = await db.getAll('products');
    const categories = await db.getAll('categories');
    return { products, categories };
}

export async function saveOfflineOrder(order: any) {
    const db = await initDB();
    return db.add('orders', {
        ...order,
        created_at: new Date().toISOString(),
        synced: 0,
        sync_failed: 0,
        sync_error: ''
    });
}

export async function getUnsyncedOrders() {
    const db = await initDB();
    const all = await db.getAll('orders');
    return all.filter(o => o.synced === 0 && o.sync_failed !== 1);
}

export async function getFailedOrders() {
    const db = await initDB();
    const all = await db.getAll('orders');
    return all.filter(o => o.synced === 0 && o.sync_failed === 1);
}

export async function markOrderSynced(id: number) {
    const db = await initDB();
    const order = await db.get('orders', id);
    if (order) {
        order.synced = 1;
        order.sync_failed = 0;
        order.sync_error = '';
        await db.put('orders', order);
    }
}

export async function markOrderSyncFailed(id: number, error: string) {
    const db = await initDB();
    const order = await db.get('orders', id);
    if (order) {
        order.sync_failed = 1;
        order.sync_error = error;
        await db.put('orders', order);
    }
}

export async function deleteOfflineOrder(id: number) {
    const db = await initDB();
    return db.delete('orders', id);
}
