# BAB I

# PENDAHULUAN

## 1.1 Latar Belakang

Perkembangan teknologi informasi telah memberikan banyak kemudahan dalam berbagai bidang usaha, termasuk pada sektor makanan dan minuman (Food and Beverage/F&B). Salah satu kebutuhan penting dalam operasional kafe dan restoran adalah sistem yang mampu membantu proses transaksi penjualan secara cepat, akurat, dan terintegrasi.

Pada banyak usaha kecil hingga menengah, proses pencatatan transaksi masih dilakukan secara manual atau menggunakan aplikasi yang memiliki keterbatasan fitur. Hal tersebut dapat menyebabkan kesalahan pencatatan, kesulitan dalam pengelolaan stok, serta keterlambatan dalam penyusunan laporan penjualan. Selain itu, data transaksi yang tersimpan sering kali hanya digunakan sebagai arsip tanpa dimanfaatkan untuk menghasilkan informasi yang dapat mendukung pengambilan keputusan bisnis.

Untuk mengatasi permasalahan tersebut, dikembangkan sebuah sistem Point of Sale (POS) berbasis web bernama **Brew & Bytes POS**. Sistem ini dirancang untuk membantu proses transaksi penjualan, pengelolaan produk, manajemen stok, pengelolaan pengguna, serta penyusunan laporan penjualan secara terintegrasi.

Selain menyediakan fungsi kasir, sistem ini juga dilengkapi dengan fitur pembayaran digital menggunakan QRIS melalui integrasi Payment Gateway Midtrans. Sistem juga menerapkan metode FIFO (First In First Out) dalam pengelolaan stok agar pergerakan persediaan dapat tercatat dengan lebih baik.

Sebagai nilai tambah, sistem ini mengimplementasikan algoritma Apriori untuk melakukan analisis pola pembelian pelanggan (Market Basket Analysis). Hasil analisis tersebut dapat digunakan untuk mengetahui produk yang sering dibeli secara bersamaan sehingga dapat membantu pemilik usaha dalam menyusun strategi promosi dan paket bundling produk.

Berdasarkan kebutuhan tersebut, dibuatlah proyek **Brew & Bytes POS**, yaitu sistem Point of Sale berbasis web yang terintegrasi dengan fitur manajemen inventori, pembayaran digital, dan analisis pola pembelian pelanggan.

---

## 1.2 Tujuan Proyek

Tujuan dari pengembangan proyek ini adalah sebagai berikut:

1. Membangun sistem Point of Sale berbasis web untuk membantu proses transaksi penjualan.
2. Mempermudah pengelolaan data produk dan kategori.
3. Mengelola stok barang secara terintegrasi menggunakan metode FIFO.
4. Menyediakan laporan penjualan yang dapat diakses secara mudah.
5. Mengintegrasikan pembayaran digital menggunakan QRIS.
6. Menerapkan algoritma Apriori untuk menganalisis pola pembelian pelanggan.

---

## 1.3 Ruang Lingkup Proyek

Ruang lingkup proyek yang dikembangkan meliputi:

1. Sistem berbasis web yang dapat diakses melalui browser.
2. Manajemen pengguna dengan hak akses Admin, Manager, dan Cashier.
3. Manajemen produk dan kategori.
4. Transaksi penjualan melalui modul Point of Sale (POS).
5. Pembayaran menggunakan metode tunai dan QRIS.
6. Pengelolaan stok barang menggunakan metode FIFO.
7. Laporan penjualan dan statistik bisnis.
8. Analisis pola pembelian pelanggan menggunakan algoritma Apriori.
9. Dukungan mode offline untuk transaksi tertentu.

---

## 1.4 Manfaat Proyek

### Bagi Pengguna

1. Mempermudah proses transaksi penjualan.
2. Mengurangi kesalahan pencatatan transaksi.
3. Mempermudah pengelolaan stok dan produk.
4. Mempercepat proses penyusunan laporan.

### Bagi Pemilik Usaha

1. Memperoleh informasi penjualan secara real-time.
2. Memantau kondisi stok dengan lebih mudah.
3. Memanfaatkan analisis pola pembelian pelanggan untuk strategi pemasaran.
4. Mendukung pengambilan keputusan berdasarkan data transaksi.

### Bagi Pengembang

1. Menerapkan teknologi web modern dalam pengembangan aplikasi.
2. Mengimplementasikan integrasi payment gateway.
3. Mengimplementasikan algoritma Apriori pada studi kasus nyata.
4. Menambah pengalaman dalam pengembangan sistem informasi berbasis web.

---

## 1.5 Gambaran Umum Sistem

Brew & Bytes POS merupakan aplikasi Point of Sale berbasis web yang dibangun menggunakan Laravel, React, dan MySQL. Sistem ini dirancang untuk membantu operasional kafe atau restoran melalui pengelolaan transaksi, inventori, pembayaran digital, serta analisis data penjualan.

Fitur utama yang tersedia dalam sistem antara lain:

* Login dan manajemen pengguna
* Dashboard bisnis
* Point of Sale (POS)
* Manajemen produk
* Manajemen kategori
* Pembayaran QRIS
* Laporan penjualan
* Market Basket Analysis
* Sinkronisasi offline

Dengan adanya sistem ini diharapkan proses operasional bisnis dapat berjalan lebih efektif, efisien, dan terintegrasi dalam satu platform.


# BAB II

# GAMBARAN UMUM DAN PERANCANGAN SISTEM

## 2.1 Gambaran Umum Sistem

Brew & Bytes POS merupakan sistem Point of Sale (POS) berbasis web yang dirancang untuk membantu operasional usaha kafe dan restoran. Sistem ini menyediakan berbagai fitur yang mendukung proses bisnis mulai dari pengelolaan produk, transaksi penjualan, pembayaran digital, pengelolaan stok, hingga analisis pola pembelian pelanggan.

Sistem dibangun menggunakan framework Laravel sebagai backend, React sebagai frontend, serta MySQL sebagai basis data. Selain itu, sistem terintegrasi dengan layanan Midtrans untuk mendukung pembayaran QRIS dan menerapkan algoritma Apriori untuk menghasilkan analisis Market Basket Analysis.

Tujuan utama sistem adalah meningkatkan efisiensi operasional bisnis serta membantu pengambilan keputusan berdasarkan data transaksi yang tersimpan.

---

## 2.2 Arsitektur Sistem

Brew & Bytes POS menggunakan arsitektur client-server.

Pada arsitektur ini, pengguna mengakses aplikasi melalui browser yang berkomunikasi dengan server aplikasi. Server bertanggung jawab untuk memproses data, menjalankan logika bisnis, berinteraksi dengan database, serta mengelola integrasi dengan layanan pihak ketiga.

### Diagram Arsitektur Sistem

```text
+------------------+
|      User        |
+------------------+
         │
         ▼
+------------------+
| React + Inertia  |
|    Frontend      |
+------------------+
         │
         ▼
+------------------+
| Laravel Backend  |
+------------------+
         │
 ┌───────┼─────────┐
 ▼       ▼         ▼
MySQL  Midtrans  Analytics
Database Payment  Apriori
```

### Penjelasan Arsitektur

* React digunakan untuk membangun antarmuka pengguna.
* Inertia.js digunakan sebagai penghubung antara frontend dan backend.
* Laravel menangani logika bisnis aplikasi.
* MySQL digunakan untuk menyimpan seluruh data sistem.
* Midtrans digunakan untuk memproses pembayaran QRIS.
* Algoritma Apriori digunakan untuk menganalisis pola pembelian pelanggan.

---

## 2.3 Hak Akses Pengguna

Sistem menerapkan Role-Based Access Control (RBAC) untuk membatasi akses pengguna sesuai perannya.

### Admin

Admin memiliki hak akses penuh terhadap seluruh fitur sistem.

Hak akses:

* Dashboard
* POS
* Produk
* Kategori
* Pengguna
* Laporan
* Analytics

### Manager

Manager memiliki akses untuk memantau operasional dan mengelola data produk.

Hak akses:

* Dashboard
* POS
* Produk
* Kategori
* Laporan
* Analytics

### Cashier

Cashier bertugas melakukan transaksi penjualan.

Hak akses:

* Dashboard
* POS

---

## 2.4 Fitur Sistem

### 2.4.1 Dashboard

Dashboard berfungsi sebagai pusat informasi bisnis yang menampilkan ringkasan data penting.

Informasi yang ditampilkan meliputi:

* Pendapatan hari ini
* Jumlah transaksi
* Jumlah produk
* Stok menipis
* Transaksi terbaru

---

### 2.4.2 Point of Sale (POS)

Modul POS digunakan oleh kasir untuk melakukan transaksi penjualan.

Fitur utama:

* Pencarian produk
* Keranjang belanja
* Diskon
* Pajak
* Checkout transaksi

---

### 2.4.3 Pembayaran QRIS

Sistem mendukung pembayaran QRIS melalui integrasi dengan Midtrans.

Alur pembayaran:

1. Kasir memilih QRIS.
2. Sistem menghasilkan QR Code.
3. Pelanggan melakukan pembayaran.
4. Sistem memverifikasi pembayaran.
5. Transaksi dinyatakan berhasil.

---

### 2.4.4 Manajemen Produk

Modul produk digunakan untuk mengelola data barang yang dijual.

Fitur:

* Tambah produk
* Edit produk
* Hapus produk
* Upload gambar
* Pengelolaan stok

---

### 2.4.5 Manajemen Kategori

Kategori digunakan untuk mengelompokkan produk agar lebih mudah dikelola.

Fitur:

* Tambah kategori
* Edit kategori
* Hapus kategori

---

### 2.4.6 Manajemen Pengguna

Modul pengguna digunakan untuk mengelola akun yang dapat mengakses sistem.

Fitur:

* Tambah pengguna
* Edit pengguna
* Hapus pengguna
* Pengaturan role

---

### 2.4.7 Laporan Penjualan

Modul laporan digunakan untuk memantau performa bisnis.

Informasi yang tersedia:

* Total penjualan
* Total transaksi
* Produk terlaris
* Grafik penjualan
* Export CSV

---

### 2.4.8 Market Basket Analysis

Modul analytics menggunakan algoritma Apriori untuk menemukan hubungan antar produk yang sering dibeli secara bersamaan.

Output yang dihasilkan:

* Association Rules
* Support
* Confidence
* Lift

Informasi tersebut dapat digunakan untuk strategi promosi dan bundling produk.

---

## 2.5 Perancangan Database

Database yang digunakan dalam sistem adalah MySQL.

### Tabel Users

Menyimpan data pengguna sistem.

| Field    | Tipe    |
| -------- | ------- |
| id       | bigint  |
| name     | varchar |
| email    | varchar |
| password | varchar |
| role     | varchar |

---

### Tabel Categories

Menyimpan data kategori produk.

| Field       | Tipe    |
| ----------- | ------- |
| id          | bigint  |
| name        | varchar |
| description | text    |

---

### Tabel Products

Menyimpan data produk.

| Field       | Tipe    |
| ----------- | ------- |
| id          | bigint  |
| category_id | bigint  |
| name        | varchar |
| price       | decimal |
| stock       | integer |

---

### Tabel Orders

Menyimpan transaksi penjualan.

| Field          | Tipe    |
| -------------- | ------- |
| id             | bigint  |
| user_id        | bigint  |
| total_price    | decimal |
| payment_method | varchar |
| payment_status | varchar |

---

### Tabel Order Items

Menyimpan detail item transaksi.

| Field      | Tipe    |
| ---------- | ------- |
| id         | bigint  |
| order_id   | bigint  |
| product_id | bigint  |
| quantity   | integer |
| price      | decimal |

---

### Tabel Inventory Batches

Menyimpan data batch stok untuk implementasi FIFO.

| Field              | Tipe    |
| ------------------ | ------- |
| id                 | bigint  |
| product_id         | bigint  |
| initial_quantity   | integer |
| remaining_quantity | integer |
| buy_price          | decimal |

---

## 2.6 Entity Relationship Diagram (ERD)

Hubungan antar tabel dalam sistem dapat digambarkan sebagai berikut:

```text
Users
  │
  └──── Orders
           │
           └──── Order Items
                     │
                     └──── Products
                               │
                               └──── Categories

Products
   │
   └──── Inventory Batches
```

**Tambahkan gambar ERD hasil draw.io atau StarUML pada bagian ini.**

---

## 2.7 Use Case Diagram

Sistem melibatkan tiga aktor utama yaitu Admin, Manager, dan Cashier.

### Use Case Admin

* Login
* Kelola Produk
* Kelola Kategori
* Kelola Pengguna
* Lihat Laporan
* Lihat Analytics

### Use Case Manager

* Login
* Kelola Produk
* Kelola Kategori
* Lihat Laporan
* Lihat Analytics

### Use Case Cashier

* Login
* Melakukan Transaksi
* Pembayaran Tunai
* Pembayaran QRIS

**Tambahkan gambar Use Case Diagram pada bagian ini.**

---

## 2.8 Ringkasan Perancangan Sistem

Berdasarkan hasil perancangan yang telah dilakukan, sistem Brew & Bytes POS dirancang sebagai aplikasi Point of Sale modern yang mampu mengelola transaksi penjualan, inventori, pembayaran digital, serta analisis pola pembelian pelanggan dalam satu platform terintegrasi.

Perancangan ini menjadi dasar dalam proses implementasi sistem yang akan dibahas pada bab berikutnya.


# BAB III

# IMPLEMENTASI SISTEM

## 3.1 Implementasi Sistem

Tahap implementasi merupakan proses penerapan hasil perancangan sistem ke dalam bentuk aplikasi yang dapat digunakan oleh pengguna. Sistem Brew & Bytes POS dikembangkan menggunakan Laravel sebagai backend, React sebagai frontend, MySQL sebagai basis data, serta Midtrans sebagai layanan pembayaran QRIS.

Implementasi dilakukan berdasarkan kebutuhan fungsional yang telah dirancang pada bab sebelumnya.

---

## 3.2 Lingkungan Implementasi

### 3.2.1 Perangkat Keras

Perangkat keras yang digunakan selama proses pengembangan sistem adalah sebagai berikut:

| Komponen       | Spesifikasi               |
| -------------- | ------------------------- |
| Processor      | Intel Core i5 atau setara |
| RAM            | 8 GB                      |
| Penyimpanan    | SSD 256 GB                |
| Sistem Operasi | Windows 11                |

### 3.2.2 Perangkat Lunak

| Software           | Versi   |
| ------------------ | ------- |
| PHP                | 8.2     |
| Laravel            | 12      |
| React              | 19      |
| MySQL              | 8       |
| Node.js            | Terbaru |
| Visual Studio Code | Terbaru |
| Google Chrome      | Terbaru |

---

# 3.3 Implementasi Antarmuka Sistem

## 3.3.1 Halaman Login

Halaman login digunakan sebagai gerbang autentikasi pengguna sebelum dapat mengakses sistem.

Fitur yang tersedia pada halaman login meliputi:

* Input email
* Input password
* Validasi login
* Hak akses berdasarkan role pengguna

### Tampilan Halaman Login

**Gambar 3.1 Halaman Login**

*(Tambahkan screenshot halaman login di sini)*

### Hasil Implementasi

Sistem berhasil melakukan autentikasi pengguna berdasarkan data yang tersimpan pada database dan mengarahkan pengguna ke dashboard sesuai hak akses yang dimiliki.

---

## 3.3.2 Dashboard

Dashboard merupakan halaman utama yang menampilkan ringkasan kondisi bisnis secara real-time.

Informasi yang ditampilkan meliputi:

* Total pendapatan hari ini
* Total transaksi
* Jumlah produk
* Stok menipis
* Transaksi terbaru

### Tampilan Dashboard

**Gambar 3.2 Dashboard**

*(Tambahkan screenshot dashboard di sini)*

### Hasil Implementasi

Dashboard berhasil menyajikan informasi penting yang dibutuhkan pengguna untuk memantau kondisi operasional bisnis.

---

## 3.3.3 Point of Sale (POS)

Modul Point of Sale digunakan untuk melakukan transaksi penjualan.

Fitur utama:

* Katalog produk
* Pencarian produk
* Keranjang belanja
* Diskon
* Pajak
* Checkout transaksi

### Tampilan POS

**Gambar 3.3 Halaman POS**

*(Tambahkan screenshot POS di sini)*

### Hasil Implementasi

Kasir dapat melakukan transaksi penjualan secara cepat dan efisien melalui antarmuka yang sederhana dan mudah digunakan.

---

## 3.3.4 Keranjang Belanja

Keranjang belanja digunakan untuk menampilkan daftar produk yang dipilih pelanggan sebelum transaksi diselesaikan.

Informasi yang ditampilkan:

* Nama produk
* Harga produk
* Jumlah produk
* Subtotal
* Diskon
* Pajak
* Total pembayaran

### Tampilan Keranjang

**Gambar 3.4 Keranjang Belanja**

*(Tambahkan screenshot keranjang belanja di sini)*

---

## 3.3.5 Pembayaran QRIS

Sistem mendukung pembayaran digital menggunakan QRIS melalui integrasi dengan Midtrans.

Alur pembayaran:

1. Kasir memilih metode pembayaran QRIS.
2. Sistem menghasilkan QR Code.
3. Pelanggan melakukan pembayaran.
4. Sistem melakukan verifikasi transaksi.
5. Status transaksi berubah menjadi berhasil.

### Tampilan QRIS

**Gambar 3.5 Pembayaran QRIS**

*(Tambahkan screenshot QRIS di sini)*

### Hasil Implementasi

Sistem berhasil menghasilkan QR Code pembayaran dan menerima konfirmasi pembayaran secara otomatis.

---

## 3.3.6 Manajemen Produk

Halaman produk digunakan untuk mengelola data produk yang dijual.

Fitur:

* Tambah produk
* Edit produk
* Hapus produk
* Upload gambar produk
* Pengelolaan stok

### Tampilan Produk

**Gambar 3.6 Manajemen Produk**

*(Tambahkan screenshot halaman produk di sini)*

### Hasil Implementasi

Data produk dapat dikelola secara terpusat dan langsung digunakan pada proses transaksi.

---

## 3.3.7 Manajemen Kategori

Halaman kategori digunakan untuk mengelompokkan produk berdasarkan jenisnya.

Fitur:

* Tambah kategori
* Edit kategori
* Hapus kategori

### Tampilan Kategori

**Gambar 3.7 Manajemen Kategori**

*(Tambahkan screenshot kategori di sini)*

---

## 3.3.8 Manajemen Pengguna

Modul pengguna digunakan untuk mengelola akun yang dapat mengakses sistem.

Hak akses yang tersedia:

* Admin
* Manager
* Cashier

### Tampilan Manajemen Pengguna

**Gambar 3.8 Manajemen Pengguna**

*(Tambahkan screenshot user management di sini)*

### Hasil Implementasi

Admin dapat mengelola akun pengguna dan menentukan hak akses sesuai kebutuhan operasional.

---

## 3.3.9 Laporan Penjualan

Halaman laporan digunakan untuk memantau performa bisnis berdasarkan data transaksi.

Informasi yang tersedia:

* Total penjualan
* Total transaksi
* Produk terlaris
* Grafik penjualan

### Tampilan Laporan

**Gambar 3.9 Laporan Penjualan**

*(Tambahkan screenshot laporan di sini)*

### Hasil Implementasi

Laporan berhasil menampilkan informasi penjualan secara visual sehingga memudahkan proses analisis bisnis.

---

## 3.3.10 Analytics Apriori

Halaman Analytics digunakan untuk menampilkan hasil analisis pola pembelian pelanggan menggunakan algoritma Apriori.

Informasi yang ditampilkan:

* Association Rules
* Support
* Confidence
* Lift

### Tampilan Analytics

**Gambar 3.10 Analytics Apriori**

*(Tambahkan screenshot analytics di sini)*

### Hasil Implementasi

Sistem berhasil menghasilkan aturan asosiasi berdasarkan data transaksi yang tersimpan.

---

# 3.4 Implementasi FIFO

Sistem menerapkan metode FIFO (First In First Out) dalam pengelolaan stok.

Metode FIFO memastikan stok yang pertama kali masuk akan menjadi stok yang pertama kali digunakan.

### Contoh Implementasi

| Batch   | Jumlah |
| ------- | ------ |
| Batch 1 | 50     |
| Batch 2 | 50     |

Jika terjadi penjualan sebanyak 60 unit maka:

| Batch   | Sisa |
| ------- | ---- |
| Batch 1 | 0    |
| Batch 2 | 40   |

### Hasil Implementasi

Metode FIFO berhasil diterapkan untuk menjaga akurasi pengelolaan persediaan.

---

# 3.5 Implementasi Market Basket Analysis

Market Basket Analysis diterapkan menggunakan algoritma Apriori.

Tujuannya adalah menemukan hubungan antar produk yang sering dibeli secara bersamaan.

### Contoh Data Transaksi

| Transaksi | Produk              |
| --------- | ------------------- |
| T1        | Espresso, Croissant |
| T2        | Espresso, Brownies  |
| T3        | Espresso, Croissant |
| T4        | Latte, Brownies     |
| T5        | Espresso, Croissant |

### Contoh Hasil Analisis

| Rule                 | Support | Confidence |
| -------------------- | ------- | ---------- |
| Espresso → Croissant | 60%     | 75%        |
| Croissant → Espresso | 60%     | 100%       |

### Hasil Implementasi

Hasil analisis dapat digunakan sebagai dasar dalam penyusunan strategi promosi dan paket bundling produk.

---

# 3.6 Ringkasan Implementasi

Berdasarkan hasil implementasi yang telah dilakukan, seluruh modul utama sistem berhasil dibangun dan dapat berjalan sesuai kebutuhan yang telah ditentukan.

Modul yang berhasil diimplementasikan meliputi:

* Login dan Manajemen Pengguna
* Dashboard
* Point of Sale (POS)
* Manajemen Produk
* Manajemen Kategori
* Pembayaran QRIS
* Laporan Penjualan
* FIFO Inventory
* Analytics Apriori
* Sinkronisasi Offline

Dengan demikian sistem Brew & Bytes POS telah berhasil dikembangkan sebagai aplikasi Point of Sale berbasis web yang mampu mendukung operasional bisnis secara terintegrasi.


# BAB IV

# PENGUJIAN DAN KESIMPULAN

## 4.1 Pengujian Sistem

Pengujian sistem dilakukan untuk memastikan seluruh fitur yang terdapat pada Brew & Bytes POS dapat berjalan sesuai dengan kebutuhan yang telah dirancang. Metode pengujian yang digunakan adalah **Black Box Testing**, yaitu metode pengujian yang berfokus pada fungsi sistem tanpa melihat implementasi kode program.

Tujuan pengujian adalah untuk memastikan bahwa setiap fitur dapat menerima input, memproses data, dan menghasilkan output yang sesuai dengan kebutuhan pengguna.

---

# 4.2 Pengujian Fitur Login

Pengujian dilakukan untuk memastikan sistem autentikasi berjalan dengan baik.

| No | Skenario Pengujian                    | Hasil Yang Diharapkan       | Hasil    |
| -- | ------------------------------------- | --------------------------- | -------- |
| 1  | Login dengan email dan password valid | Berhasil masuk ke dashboard | Berhasil |
| 2  | Login dengan password salah           | Menampilkan pesan error     | Berhasil |
| 3  | Login dengan email kosong             | Menampilkan validasi        | Berhasil |
| 4  | Login dengan password kosong          | Menampilkan validasi        | Berhasil |

### Hasil Pengujian

Berdasarkan pengujian yang dilakukan, fitur login berhasil berjalan sesuai dengan kebutuhan sistem.

---

# 4.3 Pengujian Manajemen Produk

Pengujian dilakukan pada fitur pengelolaan produk.

| No | Skenario Pengujian   | Hasil Yang Diharapkan | Hasil    |
| -- | -------------------- | --------------------- | -------- |
| 1  | Menambah produk baru | Produk tersimpan      | Berhasil |
| 2  | Mengubah data produk | Data diperbarui       | Berhasil |
| 3  | Menghapus produk     | Produk terhapus       | Berhasil |
| 4  | Upload gambar produk | Gambar tersimpan      | Berhasil |

### Hasil Pengujian

Seluruh fitur manajemen produk berhasil berjalan dengan baik.

---

# 4.4 Pengujian Manajemen Kategori

| No | Skenario Pengujian | Hasil Yang Diharapkan | Hasil    |
| -- | ------------------ | --------------------- | -------- |
| 1  | Menambah kategori  | Data tersimpan        | Berhasil |
| 2  | Mengubah kategori  | Data diperbarui       | Berhasil |
| 3  | Menghapus kategori | Data terhapus         | Berhasil |

### Hasil Pengujian

Fitur kategori berhasil dijalankan sesuai dengan kebutuhan.

---

# 4.5 Pengujian Transaksi Point of Sale

Pengujian dilakukan terhadap proses transaksi penjualan.

| No | Skenario Pengujian              | Hasil Yang Diharapkan  | Hasil    |
| -- | ------------------------------- | ---------------------- | -------- |
| 1  | Menambahkan produk ke keranjang | Produk masuk keranjang | Berhasil |
| 2  | Mengubah jumlah produk          | Total diperbarui       | Berhasil |
| 3  | Menghapus produk dari keranjang | Produk terhapus        | Berhasil |
| 4  | Checkout transaksi              | Transaksi tersimpan    | Berhasil |

### Hasil Pengujian

Modul Point of Sale berhasil memproses transaksi penjualan dengan baik.

---

# 4.6 Pengujian Pembayaran QRIS

Pengujian dilakukan pada integrasi Payment Gateway Midtrans.

| No | Skenario Pengujian     | Hasil Yang Diharapkan                    | Hasil    |
| -- | ---------------------- | ---------------------------------------- | -------- |
| 1  | Generate QRIS          | QR Code berhasil dibuat                  | Berhasil |
| 2  | Pembayaran berhasil    | Status transaksi menjadi Paid            | Berhasil |
| 3  | Pembayaran dibatalkan  | Status transaksi menjadi Failed          | Berhasil |
| 4  | Pembayaran kedaluwarsa | Status transaksi berubah menjadi Expired | Berhasil |

### Hasil Pengujian

Integrasi QRIS berhasil berjalan sesuai dengan alur pembayaran yang dirancang.

---

# 4.7 Pengujian FIFO

Pengujian dilakukan untuk memastikan sistem mengurangi stok berdasarkan urutan batch yang masuk terlebih dahulu.

### Data Awal

| Batch   | Jumlah |
| ------- | ------ |
| Batch 1 | 50     |
| Batch 2 | 50     |

Total stok: 100 unit

### Simulasi Penjualan

Penjualan sebanyak 60 unit.

### Hasil

| Batch   | Sisa |
| ------- | ---- |
| Batch 1 | 0    |
| Batch 2 | 40   |

### Analisis

Hasil menunjukkan bahwa sistem berhasil menerapkan metode FIFO dengan benar. Batch pertama digunakan terlebih dahulu sebelum mengambil stok dari batch berikutnya.

---

# 4.8 Pengujian Analytics Apriori

Pengujian dilakukan untuk memastikan sistem dapat menghasilkan aturan asosiasi berdasarkan data transaksi.

### Data Sampel

| Transaksi | Produk              |
| --------- | ------------------- |
| T1        | Espresso, Croissant |
| T2        | Espresso, Brownies  |
| T3        | Espresso, Croissant |
| T4        | Latte, Brownies     |
| T5        | Espresso, Croissant |

### Hasil Analisis

| Rule                 | Support | Confidence |
| -------------------- | ------- | ---------- |
| Espresso → Croissant | 60%     | 75%        |
| Croissant → Espresso | 60%     | 100%       |

### Analisis

Berdasarkan hasil pengujian, algoritma Apriori berhasil menemukan hubungan antar produk yang sering dibeli secara bersamaan.

Informasi tersebut dapat digunakan untuk:

* Strategi bundling produk
* Cross-selling
* Penempatan produk
* Program promosi

---

# 4.9 Pengujian Mode Offline

Pengujian dilakukan untuk memastikan sistem tetap dapat digunakan ketika koneksi internet terputus.

| No | Skenario Pengujian       | Hasil Yang Diharapkan          | Hasil    |
| -- | ------------------------ | ------------------------------ | -------- |
| 1  | Internet terputus        | Sistem tetap berjalan          | Berhasil |
| 2  | Simpan transaksi offline | Data tersimpan lokal           | Berhasil |
| 3  | Internet kembali aktif   | Sinkronisasi otomatis berjalan | Berhasil |

### Hasil Pengujian

Fitur offline berhasil berjalan sesuai perancangan dan mampu menyimpan transaksi sementara sebelum dilakukan sinkronisasi ke server.

---

# 4.10 Ringkasan Hasil Pengujian

Berdasarkan seluruh pengujian yang telah dilakukan, seluruh fitur utama sistem berhasil berjalan sesuai kebutuhan.

Ringkasan hasil pengujian dapat dilihat pada tabel berikut.

| Modul             | Status   |
| ----------------- | -------- |
| Login             | Berhasil |
| Dashboard         | Berhasil |
| POS               | Berhasil |
| Produk            | Berhasil |
| Kategori          | Berhasil |
| Pengguna          | Berhasil |
| QRIS              | Berhasil |
| FIFO              | Berhasil |
| Analytics Apriori | Berhasil |
| Offline Sync      | Berhasil |

---

# 4.11 Kesimpulan

Berdasarkan hasil pengembangan dan pengujian yang telah dilakukan, dapat disimpulkan bahwa proyek Brew & Bytes POS berhasil dibangun sesuai dengan kebutuhan yang telah ditentukan.

Sistem mampu mendukung proses transaksi penjualan, pengelolaan produk, pengelolaan stok, pembayaran digital melalui QRIS, penyusunan laporan penjualan, serta analisis pola pembelian pelanggan menggunakan algoritma Apriori.

Penerapan metode FIFO berhasil membantu pengelolaan persediaan barang, sedangkan implementasi algoritma Apriori mampu menghasilkan informasi yang dapat digunakan untuk mendukung strategi pemasaran dan pengambilan keputusan bisnis.

Secara keseluruhan, Brew & Bytes POS berhasil menjadi solusi terintegrasi yang dapat membantu operasional kafe dan restoran secara lebih efektif, efisien, dan berbasis data.
