# Perancangan Sistem: Proses Transaksi POS (Kopi Turu)

Dokumen ini merinci perancangan sistem backend dan logika transaksi (pembelian) pada aplikasi Kopi Turu POS.

---

## 1. Arsitektur Aplikasi (System Architecture)

Struktur aplikasi menggunakan pola *Client-Server* dengan dukungan *Progressive Web App* (PWA) di sisi klien.

### Diagram Arsitektur
```mermaid
flowchart LR
    A[Client<br/>Browser / PWA] <-->|HTTP/AJAX<br/>JSON| B[Web Server<br/>Laravel 12]
    B <-->|SQL| C[(Database<br/>MySQL)]
    B <-->|REST API| D(Payment Gateway<br/>Midtrans)
```

### Tech Stack & Alasan Memilih
* **Frontend**: React (v19) dipadukan dengan Inertia.js (v2).
  *Alasan*: Memberikan pengalaman pengguna yang sangat halus (mirip *Single Page Application* murni) tanpa kerumitan membangun REST API untuk *routing* halaman. Sangat responsif untuk aplikasi mesin kasir yang dituntut cepat.
* **Backend**: PHP (v8.3) dengan Framework Laravel 12.
  *Alasan*: Laravel memiliki ekosistem bawaan yang matang; dari Object Relational Mapping (Eloquent), proteksi injeksi SQL, validasi *Form Request*, hingga kemudahan membuat *REST API* atau penerima *Webhook* (contoh: notifikasi Midtrans).
* **Database**: MySQL.
  *Alasan*: Struktur relasional sangat ideal untuk menjaga keutuhan data transaksi E-Commerce / POS (misal, keterkaitan pesanan dengan detail dan produk).

---

## 2. Perancangan Proses (Diagram Logika)

### a. Use Case Diagram
Menjelaskan hak akses aktor dalam proses transaksi:

```mermaid
flowchart LR
    Kasir([Kasir])
    Pelanggan([Pelanggan])
    Midtrans([Midtrans Gateway])
    
    UC1(Memilih Produk ke Cart)
    UC2(Melakukan Checkout)
    UC3(Mencetak Struk)
    UC4(Memilih Metode Pembayaran<br>Tunai / QRIS)
    UC5(Membayar / Scan QRIS)
    
    Kasir --> UC1
    Kasir --> UC2
    Kasir --> UC3
    
    UC2 -.->|include| UC4
    Midtrans -.->|Sistem meng-generate QR| UC4
    
    Pelanggan --> UC5
```

### b. Activity Diagram (Alur Pembelian)
Menggambarkan langkah-langkah kasir sejak memasukkan pesanan hingga struk cetak.

```mermaid
stateDiagram-v2
    [*] --> BuatPesanan
    BuatPesanan --> PilihProduk : Kasir Tap Produk
    PilihProduk --> AturKuantitas
    AturKuantitas --> HitungSubtotal
    HitungSubtotal --> Checkout
    
    Checkout --> PilihPembayaran
    
    state PilihPembayaran {
        Tunai
        QRIS
    }
    
    Tunai --> PotongStokProduk
    PotongStokProduk --> TransaksiSukses_DB
    
    QRIS --> Request_Midtrans : Request QR
    Request_Midtrans --> TampilQRCode
    TampilQRCode --> TungguPembayaranPelanggan
    TungguPembayaranPelanggan --> Webhook_Success : Pelanggan Scan
    Webhook_Success --> Update_Status_Paid
    Update_Status_Paid --> TransaksiSukses_DB
    
    TransaksiSukses_DB --> CetakStruk
    CetakStruk --> [*]
```

### c. Sequence Diagram (Integrasi Pembayaran QRIS)
Sangat berguna untuk menjelaskan interaksi dari antarmuka POS menuju *Server* dan *Gateway Midtrans*.

```mermaid
sequenceDiagram
    participant C as Client (Terminal POS)
    participant POS as POSController
    participant Pay as PaymentController
    participant Mid as Midtrans API
    participant DB as MySQL DB
    
    C->>POS: POST /pos (Kirim Data Pesanan)
    POS->>DB: Buat record Order (Status=Pending) & OrderItem
    POS-->>C: Response: Order ID & Redirect ke Bayar
    
    C->>Pay: GET /api/payment/qris/{order_id}
    Pay->>Mid: CoreApi::charge(PaymentType=QRIS)
    Mid-->>Pay: QR Code Payloads / URL
    Pay-->>C: Munculkan Modal QRIS
    
    Note right of C: Pelanggan melakukan <br/>scan QR dari gawainya.
    
    Mid->>Pay: POST /webhook (Notification Transaction=Settlement)
    Pay->>DB: Update order_status='paid' & Kurangi Stok Produk
    Pay-->>Mid: HTTP 200 OK
    
    C->>Pay: Long polling / checkStatus()
    Pay-->>C: Status='Paid'
    C->>C: Tampilkan Berhasil & Cetak
```

---

## 3. Perancangan Basis Data (Database Design)

### a. ERD (Entity Relationship Diagram)
Skema relasional inti untuk transaksi E-Commerce / POS.

```mermaid
erDiagram
    USERS ||--o{ ORDERS : "melakukan"
    CATEGORIES ||--o{ PRODUCTS : "mengelompokkan"
    PRODUCTS ||--o{ ORDER_ITEMS : "memiliki"
    ORDERS ||--|{ ORDER_ITEMS : "berisi"
    
    USERS {
        int id PK
        string name
        string email
    }
    CATEGORIES {
        int id PK
        string name
    }
    PRODUCTS {
        int id PK
        int category_id FK
        string name
        decimal price
        int stock
    }
    ORDERS {
        int id PK
        int user_id FK
        string reference_number
        decimal subtotal
        decimal tax_amount
        decimal total_price
        string payment_method
        string payment_status
    }
    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price
        decimal subtotal
    }
```

### b. Kamus Data (Spesifikasi Tabel POS / Transaksi)

1. **`products`**: Menyimpan master data barang.
   - `id` (int, PK, AI)
   - `category_id` (int, FK) -> Rujukan jenis minuman/makanan.
   - `name` (varchar 255) -> Nama menu.
   - `price` (decimal 15,2) -> Harga jual.
   - `stock` (int) -> Jumlah fisik bahan atau *inventory*.
2. **`orders`**: Memegang catatan kepala transaksi pembelian.
   - `id` (int, PK)
   - `user_id` (int, FK) -> Siapa kasir yang memproses.
   - `reference_number` (varchar 50) -> Kode struk (misal: POS-20240316-AF).
   - `discount_amount` (decimal) -> Rincian diskon.
   - `tax_amount` (decimal) -> Rincian PPN 10%.
   - `total_price` (decimal) -> Uang mutlak yang dibayar final.
   - `payment_method` (varchar) -> 'cash' | 'qris'.
   - `payment_status` (varchar) -> 'pending' | 'paid' | 'failed'.
3. **`order_items`**: Menyimpan jejak mutasi menu yang diisi di nota.
   - `id` (int PK)
   - `order_id` (int, FK)
   - `product_id` (int, FK)
   - `quantity` (int) -> Jumlah dipesan.
   - `price` (decimal) -> Harga per tangkap saat transaksi itu terjadi.
   - `subtotal` (decimal) -> `quantity` * `price`.

---

## 4. Perancangan Antarmuka (Interface Design)

### a. Sitemap Jalur Kasir
Root `.` -> `[Layar Terminal POS (Pilih Produk & Cart)]` -> `[Tinjauan Keranjang (Pop up / Sidebar)]` -> `[Pemilihan Metode Bayar]` -> `[Layar Transaksi Sukses & Print]`.

### b. Wireframe Terminal POS
Sistem POS ini menggunakan *layout* modern layar besar:
- **Bagian Kiri (30% layar)**: Keranjang Belanja (*Cart*). Memuat list ringkas barang, input *touch/click* untuk *(+)* / *(-)* buah pesanan. Bagian bawahnya memuat rincian total dan tombol besar **Process/Pay**.
- **Bagian Kanan (70% layar)**: *Visual Grid* kumpulan menu/kategori. Tombol besar mempermudah kasir menekan produk yang dibeli pelanggan (misal: grid untuk Kopi Susu, grid untuk Donat).

---

## 5. Perancangan Algoritma & Keamanan

### a. Algoritma (Kalkulasi Transaksi Keuangan)
Backend dieksekusi secara ketat untuk mencegah manipulasi data harga dari *klien frontend*.
```php
// Simulasi Algoritma Dasar (Kalkulasi Server-Side):
$totalPrice = 0;
foreach ($items as $item) {
   $productDB = Product::find($item['product_id']);
   // Kalkulasi harus dari harga database, tidak dari request frontend
   $subtotalPerBarang = $productDB->price * $item['quantity'];
   $totalPrice += $subtotalPerBarang;
}

$discount = $request['discount_amount'] ?: 0;
$tax = ($totalPrice - $discount) * 0.10; // Perhitungan PPN Otomatis 10%
$final_total = $totalPrice - $discount + $tax;
```

### b. Keamanan (Security)
1. **Password Authentication**: Password seluruh staf restoran dan admin menggunakan `Bcrypt` *(Hash::make)* milik Laravel.
2. **Validasi Persediaan (Stock Concurrency Check)**: Sebelum memotong *"Saldo Stok/Inventory"*, sistem (pada `POSController`) mengecek apakah di backend persediaan masih ada, jika ada pengurangan serentak dari kasir lain, akan dipatahkan dengan pesan "*Insufficient stock for product*".
3. **Validasi Callback Midtrans**: 
   - Notifikasi status `capture/settlement` dari Midtrans diterima lewat rute `/webhook`. 
   - Midtrans mengirim *signature* (kunci rahasia dari `.env`) ke server. Ini mencegah pihak merugikan pura-pura mengirim webhook *"Telah Dibayar"* supaya stok keluar barang gratisan. Server Key dijaga ketat di `config('services.midtrans')`. 
   - Laravel juga menggunakan *Rate Limiting* (`throttle:api`) untuk menghentikan serangan spam request.
