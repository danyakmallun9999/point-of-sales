# PowerShell Script untuk Otomatisasi Konversi Markdown ke LaTeX via Pandoc

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   Pandoc Converter: laporan.md -> laporan.tex" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Periksa apakah Pandoc terpasang
$pandocPath = "pandoc"
$pandocInstalled = Get-Command pandoc -ErrorAction SilentlyContinue

if (-not $pandocInstalled) {
    # Check fallback local path
    $localFallback = "C:\Users\danya\AppData\Local\Pandoc\pandoc.exe"
    if (Test-Path $localFallback) {
        $pandocPath = $localFallback
        $pandocInstalled = $true
    }
}

if (-not $pandocInstalled) {
    Write-Host "[!] Pandoc belum terpasang di sistem Anda." -ForegroundColor Yellow
    Write-Host "    Silakan pasang menggunakan winget dengan menjalankan perintah berikut di PowerShell Administrator:" -ForegroundColor Yellow
    Write-Host "    winget install jgm.pandoc" -ForegroundColor Green
    Write-Host ""
    Write-Host "    Atau unduh installer resminya di: https://github.com/jgm/pandoc/releases" -ForegroundColor Yellow
    Exit
}

Write-Host "[+] Pandoc terdeteksi. Memulai proses konversi..." -ForegroundColor Green

# 2. Jalankan konversi Pandoc
# --wrap=none digunakan agar kalimat tidak dipatahkan di 80 karakter (mempermudah pengeditan di LaTeX)
& $pandocPath -f markdown -t latex laporan.md -o laporan.tex --wrap=none

if ($LastExitCode -eq 0) {
    Write-Host "[V] Konversi Sukses! File 'laporan.tex' telah dibuat di folder pandoc." -ForegroundColor Green
    Write-Host "    Anda sekarang dapat membuka 'main.tex' dan melakukan kompilasi." -ForegroundColor Green
} else {
    Write-Host "[X] Gagal melakukan konversi. Silakan periksa format laporan.md Anda." -ForegroundColor Red
}
