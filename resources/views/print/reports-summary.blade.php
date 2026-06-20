<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Penjualan POSO - {{ $startDate }} s/d {{ $endDate }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 13px;
            color: #333;
            margin: 0;
            padding: 40px;
            background: #fff;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
            margin-bottom: 30px;
        }
        .brand {
            font-size: 24px;
            font-weight: bold;
            color: #111;
        }
        .report-title {
            font-size: 16px;
            text-align: right;
            color: #666;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-top: 25px;
            margin-bottom: 10px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
            text-transform: uppercase;
        }
        .grid-summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 25px;
        }
        .card-summary {
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 12px;
            background: #fafafa;
        }
        .card-summary .label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .card-summary .value {
            font-size: 16px;
            font-weight: bold;
            color: #111;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px 10px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge-success {
            background-color: #e6fffa;
            color: #047481;
        }
        .badge-warning {
            background-color: #fffaf0;
            color: #b7791f;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 11px;
            color: #777;
            border-top: 1px solid #eee;
            padding-top: 15px;
        }
        @media print {
            body {
                padding: 0;
            }
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>

<div class="header">
    <div>
        <div class="brand">POSO</div>
        <div style="font-size: 11px; color: #777; margin-top: 3px;">Point of Sales System</div>
    </div>
    <div class="report-title">
        <strong>LAPORAN KEUANGAN & SHIFT</strong><br>
        <span style="font-size: 12px;">Periode: {{ date('d M Y', strtotime($startDate)) }} - {{ date('d M Y', strtotime($endDate)) }}</span>
    </div>
</div>

<div class="section-title">Ringkasan Penjualan</div>
<div class="grid-summary">
    <div class="card-summary">
        <div class="label">Total Pendapatan</div>
        <div class="value">Rp {{ number_format($summary->total_revenue ?? 0, 0, ',', '.') }}</div>
    </div>
    <div class="card-summary">
        <div class="label">Total Transaksi</div>
        <div class="value">{{ number_format($summary->total_orders ?? 0, 0, ',', '.') }}</div>
    </div>
    <div class="card-summary">
        <div class="label">Total Diskon</div>
        <div class="value">Rp {{ number_format($summary->total_discount ?? 0, 0, ',', '.') }}</div>
    </div>
    <div class="card-summary">
        <div class="label">Total Pajak</div>
        <div class="value">Rp {{ number_format($summary->total_tax ?? 0, 0, ',', '.') }}</div>
    </div>
</div>

<div class="section-title">Top 10 Produk Terlaris</div>
<table>
    <thead>
        <tr>
            <th width="60" class="text-center">No</th>
            <th>Nama Produk</th>
            <th class="text-center" width="120">Qty Terjual</th>
            <th class="text-right" width="180">Total Penjualan</th>
        </tr>
    </thead>
    <tbody>
        @forelse($topProducts as $index => $item)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $item->product ? $item->product->name : 'Produk Tidak Dikenal (Dihapus)' }}</td>
                <td class="text-center">{{ $item->total_quantity }}</td>
                <td class="text-right">Rp {{ number_format($item->total_sales, 0, ',', '.') }}</td>
            </tr>
        @empty
            <tr>
                <td colspan="4" class="text-center">Tidak ada data produk</td>
            </tr>
        @endforelse
    </tbody>
</table>

<div class="section-title">Riwayat Shift Kasir</div>
<table>
    <thead>
        <tr>
            <th width="60" class="text-center">Shift ID</th>
            <th>Nama Kasir</th>
            <th>Outlet</th>
            <th class="text-right">Kas Awal</th>
            <th class="text-right">Kas Ekspektasi</th>
            <th class="text-right">Kas Aktual</th>
            <th class="text-right">Selisih</th>
            <th class="text-center">Status</th>
            <th class="text-center">Waktu Buka / Tutup</th>
        </tr>
    </thead>
    <tbody>
        @forelse($shifts as $shift)
            @php
                $selisih = $shift->end_amount_actual - $shift->end_amount_expected;
            @endphp
            <tr>
                <td class="text-center">#{{ $shift->id }}</td>
                <td>{{ $shift->user->name }}</td>
                <td>{{ $shift->outlet ? $shift->outlet->name : 'Global' }}</td>
                <td class="text-right">Rp {{ number_format($shift->start_amount, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($shift->end_amount_expected, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($shift->end_amount_actual, 0, ',', '.') }}</td>
                <td class="text-right" style="color: {{ $selisih < 0 ? '#e53e3e' : ($selisih > 0 ? '#38a169' : '#333') }}">
                    {{ $selisih >= 0 ? '+' : '' }}Rp {{ number_format($selisih, 0, ',', '.') }}
                </td>
                <td class="text-center">
                    <span class="badge {{ $shift->status === 'closed' ? 'badge-success' : 'badge-warning' }}">
                        {{ $shift->status }}
                    </span>
                </td>
                <td class="text-center" style="font-size: 11px;">
                    {{ $shift->opened_at->format('d/m/y H:i') }}<br>
                    <span style="color: #888;">s/d</span><br>
                    {{ $shift->closed_at ? $shift->closed_at->format('d/m/y H:i') : '-' }}
                </td>
            </tr>
        @empty
            <tr>
                <td colspan="9" class="text-center">Tidak ada data shift kasir</td>
            </tr>
        @endforelse
    </tbody>
</table>

<div class="footer">
    Dicetak secara otomatis pada {{ now()->format('d F Y, H:i:s') }} oleh POSO POS System.
</div>

<script>
    window.onload = function() {
        window.print();
    }
</script>
</body>
</html>
