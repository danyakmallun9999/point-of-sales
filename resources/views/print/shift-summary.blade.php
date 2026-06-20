<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ringkasan Shift #{{ $shift->id }} - POSO</title>
    <style>
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            color: #000;
            margin: 0;
            padding: 20px;
            background: #fff;
        }
        .receipt-container {
            width: 80mm;
            margin: 0 auto;
            border: 1px dashed #ccc;
            padding: 10px;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .brand {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .divider {
            border-top: 1px dashed #000;
            margin: 10px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 3px 0;
            vertical-align: top;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
        }
        .summary-row.bold {
            font-weight: bold;
        }
        .footer-note {
            font-size: 10px;
            margin-top: 20px;
        }
        @media print {
            body {
                padding: 0;
            }
            .receipt-container {
                width: 100%;
                border: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>

<div class="receipt-container">
    <div class="text-center">
        <div class="brand">POSO</div>
        <div>{{ $shift->outlet ? $shift->outlet->name : 'Global' }}</div>
        <div>{{ $shift->outlet ? $shift->outlet->address : '' }}</div>
        <div class="divider"></div>
        <strong>LAPORAN SHIFT KASIR</strong>
    </div>

    <div class="divider"></div>

    <div class="summary-row">
        <span>No. Shift:</span>
        <span>#{{ $shift->id }}</span>
    </div>
    <div class="summary-row">
        <span>Kasir:</span>
        <span>{{ $shift->user->name }}</span>
    </div>
    <div class="summary-row">
        <span>Status:</span>
        <span>{{ strtoupper($shift->status) }}</span>
    </div>
    <div class="summary-row">
        <span>Buka:</span>
        <span>{{ $shift->opened_at->format('d/m/Y H:i') }}</span>
    </div>
    @if($shift->closed_at)
        <div class="summary-row">
            <span>Tutup:</span>
            <span>{{ $shift->closed_at->format('d/m/Y H:i') }}</span>
        </div>
    @endif

    <div class="divider"></div>

    <div class="summary-row bold">
        <span>Modal Awal:</span>
        <span>Rp {{ number_format($shift->start_amount, 0, ',', '.') }}</span>
    </div>
    <div class="summary-row">
        <span>Penjualan Tunai:</span>
        <span>Rp {{ number_format($shift->total_cash_sales, 0, ',', '.') }}</span>
    </div>
    <div class="summary-row">
        <span>Penjualan QRIS:</span>
        <span>Rp {{ number_format($shift->total_qris_sales, 0, ',', '.') }}</span>
    </div>
    
    <div class="divider"></div>
    
    <div class="summary-row bold">
        <span>Ekspektasi Kas:</span>
        <span>Rp {{ number_format($shift->end_amount_expected, 0, ',', '.') }}</span>
    </div>
    <div class="summary-row bold">
        <span>Uang Aktual:</span>
        <span>Rp {{ number_format($shift->end_amount_actual, 0, ',', '.') }}</span>
    </div>

    @php
        $selisih = $shift->end_amount_actual - $shift->end_amount_expected;
    @endphp
    <div class="summary-row bold">
        <span>Selisih:</span>
        <span style="color: {{ $selisih < 0 ? 'red' : 'green' }}">
            {{ $selisih >= 0 ? '+' : '' }}Rp {{ number_format($selisih, 0, ',', '.') }}
        </span>
    </div>

    <div class="divider"></div>

    <div class="text-center"><strong>DAFTAR TRANSAKSI</strong></div>
    <table>
        <thead>
            <tr>
                <th style="text-align: left;">Ref / Waktu</th>
                <th style="text-align: right;">Total</th>
                <th style="text-align: right;">Metode</th>
            </tr>
        </thead>
        <tbody>
            @forelse($orders as $order)
                <tr>
                    <td style="text-align: left;">
                        {{ $order->reference_number }}<br>
                        <small>{{ $order->created_at->format('H:i') }}</small>
                    </td>
                    <td style="text-align: right; vertical-align: middle;">
                        Rp {{ number_format($order->total_price, 0, ',', '.') }}
                    </td>
                    <td style="text-align: right; vertical-align: middle; text-transform: uppercase;">
                        {{ $order->payment_method }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="3" class="text-center">Tidak ada transaksi</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="divider"></div>

    <div class="text-center footer-note">
        Dicetak pada {{ now()->format('d/m/Y H:i:s') }}<br>
        POSO POS System
    </div>
</div>

<script>
    window.onload = function() {
        window.print();
    }
</script>
</body>
</html>
