# Rencana Implementasi Algoritma: FIFO & Apriori
*(Proyek: Kopi Turu POS - Point of Sales)*

Dokumen ini adalah cetak biru *(blueprint)* teknikal untuk penerapan dua algoritma penunjang dalam sistem Kopi Turu.

---

## 1. Algoritma FIFO (*First-In, First-Out*)
**Tujuan Modul**: Pengelolaan Inventaris. Memastikan stok bahan/produk terlama (yang pertama kali masuk gudang) dialokasikan/dipotong terlebih dahulu setiap terjadinya penjualan untuk mereduksi persentase barang kedaluwarsa.

### A. Perubahan Basis Data
1. **Membuat Tabel Baru `inventory_batches`**
   Sistem *stock* statis bawaan tidak mampu melacak *batch*. Maka butuh tabel migrasi tambahan.
   - **Kolom Tabel**: `id`, `product_id` (Foregin Key), `initial_quantity`, `remaining_quantity`, `buy_price`, `created_at` (Sebagai tanggal masuknya data *batch*).

### B. Modifikasi Bekend (*Backend Laravel*)
1. **Modul Pengadaan / `ProductController`**
   - Mengganti prosedur "Tambah Stok" biasa menjadi pembuatan *record* baru di tabel `inventory_batches`.
   - **Strategi Agregat**: Walaupun stok dirinci per rentang data, kolom `stock` bawaan di tabel `products` tetap dipertahankan. Ini bertugas sebagai "Angka Total Bayangan/Agregat" agar halaman depan POS (*Terminal Kasir*) dapat melakukan baca (*Read Output*) super cepat tanpa kalkulasi *loop batch*.
2. **Modul Transaksi Kasir (`POSController` & `Order::markAsPaid()`)**
   - Ini adalah jantung logika algoritmanya. Kita tidak bisa memakai parameter `Product::decrement()` kasar.
   - **Langkah Proses FIFO**:
     1. Baca pesanan dari `order_items` untuk struk terkait (Misalnya Butuh: 5 buah Produk A).
     2. Lakukan *Query* tarik barisan batch yang isinya belum habis: `InventoryBatch::where('product_id', ID)->where('remaining_quantity', '>', 0)->orderBy('created_at', 'asc')->get()`. *(Urutannya dibuat Ascending dari tanggal pembuatan terlama)*.
     3. Eksekusi perulangan FIFO: Jika *Batch* 1 sisanya hanya 3, maka sisa saldo *Batch* 1 langsung diubah ke 0.
     4. Pemotongan belum tuntas, kekurangan dicarikan ke *Batch* 2 (Butuh: 2). Jika *Batch* 2 ada sisa 10, maka potong 2 buah, simpan menjadi sisa 8. Kebutuhan terpenuhi. *Break looping*.

---

## 2. Algoritma Apriori (*Market Basket Analysis*)
**Tujuan Modul**: Data Mining / Analitik Usaha. Membongkar kebiasaan pembeli dan rekomendasi *bundling* promosi dari data kombinasi produk dalam struk *(Contoh Kasus: 80% pelanggan yang order Americano biasanya order Donat Gula)*.

### A. Persiapan Sumber Analisis
1. Ekstraksi rekam jejak dari tabel `orders` yang menyandang *status* `paid` berikut kaitan relasinya dari tabel detail struk `order_items`.

### B. Logika Layanan Inti (*Business Core*)
1. **Membuat *Service Class* Khusus (`app/Services/AprioriService.php`)**
   Kode algoritmenya harus dipisahkan dari lapis HTTP *Controller* agar sistem MVC tidak menjadi gendut dan pengulangan fungsinya efisien.
   - **Langkah Proses Apriori PHP**:
     1. **Kompilasi Set Keranjang**: Mentransformasi data MySQL menjadi array transaksi mentah. (Mis: Transaksi ID 1 berisi `['Produk_A', 'Produk_C']`).
     2. **Hitung *Support* Individual**: Menghitung proporsi keterpilihan item A dari keseluruhan total pesanan kotor. Jika proporsinya berada di bawah standar (mis. tidak laku dipesan sama sekali), disortir keluar.
     3. **Bangun Kandidat Pasangan**: Melakukan percampuran komputasi silang antar produk-produk laku tadi untuk dikelompokkan ke dalam pasangannya (Produk A + Produk B).
     4. **Uji Nilai *Confidence* (Probabilitas Bersyarat)**: Mengukur kepastian bahwa `Aturan A => B` valid. Formulasi rumusnya: `Support gabungan (A+B) / Support tunggal (A)`.
     5. **Ekspor Kesimpulan**: Membuahkan daftar array balasan: "Produk Induk", "Rekomendasi Produk Pengikut", dan tingkat persentase (*Confidence*).

### C. Integrasi Antarmuka (*Frontend / Client View*)
1. **Modul Visual Pimpinan (`DashboardController` / React)**
   - *Backend* melempar API / *Prop Resource* *Inertia.js* berisi output kalkulasi `AprioriService` tersebut.
   - UI (Klien React/Tailwind) menghidangkan hasilnya ke dalam _Insight Widget Card_ spesifik layaknya notifikasi cerdas agar mudah dibaca oleh Pengelola Cabang *(Insights and Recommendations)*. 
