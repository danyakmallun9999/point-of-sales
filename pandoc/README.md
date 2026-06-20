# Panduan Kompilasi LaTeX - Tugas Akhir POS

Folder ini dirancang khusus untuk mempermudah konversi laporan Tugas Akhir Anda dari format **Markdown (`laporan.md`)** ke format **LaTeX (`laporan.tex` / `main.tex`)** yang siap dikompilasi secara akademik.

---

## Isi Folder `pandoc/`

1. **`laporan.md`**: File dokumen sumber. Tulis seluruh laporan Tugas Akhir Anda di file ini menggunakan format Markdown.
2. **`main.tex`**: File utama (*Master Template*) LaTeX. File ini mengatur struktur margin (4-3-3-3), halaman sampul (cover), daftar isi, dan mengimpor file `laporan.tex`.
3. **`logoPOS.png`**: Gambar logo yang akan disisipkan di halaman sampul (*cover*) dokumen LaTeX.
4. **`convert.ps1`**: Skrip otomatisasi PowerShell untuk mengonversi `laporan.md` menjadi `laporan.tex`.
5. **`laporan.tex`** (Akan dihasilkan setelah konversi): File output LaTeX hasil terjemahan dari Markdown. *Jangan mengedit file ini langsung, editlah laporan.md saja.*

---

## Metode 1: Menggunakan Overleaf (Sangat Direkomendasikan)

Jika Anda ingin mengedit dan mengompilasi laporan secara online tanpa memasang aplikasi apapun di komputer:

1. **Lakukan konversi lokal** terlebih dahulu menggunakan **Metode 2** di bawah ini untuk menghasilkan berkas `laporan.tex`.
2. Buka [Overleaf](https://www.overleaf.com/) dan buat proyek baru (*Blank Project*).
3. Unggah berkas berikut dari folder `pandoc/` ke Overleaf:
   - `main.tex`
   - `laporan.tex`
   - `logoPOS.png`
4. Pilih file `main.tex` di panel kiri Overleaf, lalu klik tombol **Recompile** (Ctrl + Enter).
5. Dokumen PDF Tugas Akhir Anda yang rapi dan sesuai format akademik siap diunduh!

---

## Metode 2: Konversi & Kompilasi Lokal (Windows)

Jika Anda ingin melakukan konversi di komputer sendiri secara lokal:

### Langkah 1: Pasang Pandoc
Buka terminal PowerShell Anda dan ketik perintah berikut untuk memasang Pandoc secara otomatis:
```powershell
winget install jgm.pandoc
```
*Catatan: Setelah instalasi selesai, silakan tutup dan buka kembali jendela PowerShell Anda agar sistem mendeteksi perintah Pandoc.*

### Langkah 2: Jalankan Konversi
Buka PowerShell di dalam folder `pandoc/` dan jalankan perintah skrip otomatis:
```powershell
.\convert.ps1
```
Skrip ini akan otomatis menghasilkan berkas `laporan.tex` dari `laporan.md` dengan penataan spasi kalimat yang rapi.

### Langkah 3: Kompilasi ke PDF
Anda memerlukan kompiler LaTeX lokal (seperti [MiKTeX](https://miktex.org/) atau [TeX Live](https://www.tug.org/texlive/)) beserta editor LaTeX seperti TeXworks atau TeXstudio untuk membuka berkas `main.tex` dan menekan tombol *Build PDF*.
