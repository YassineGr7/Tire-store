<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: DejaVu Sans, sans-serif;
    font-size: 12px;
    color: #1a1a1a;
    background: #fff;
  }

  .page {
    padding: 40px 48px;
  }

  /* ── Header ── */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40px;
    padding-bottom: 24px;
    border-bottom: 2px solid #18a06a;
  }

  .company-name {
    font-size: 22px;
    font-weight: 700;
    color: #18a06a;
    letter-spacing: -0.5px;
  }

  .company-info {
    font-size: 11px;
    color: #6b7280;
    margin-top: 4px;
    line-height: 1.6;
  }

  .invoice-meta {
    text-align: right;
  }

  .invoice-title {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .invoice-number {
    font-size: 14px;
    color: #18a06a;
    font-weight: 600;
    margin-top: 4px;
  }

  .invoice-date {
    font-size: 11px;
    color: #6b7280;
    margin-top: 2px;
  }

  /* ── Client + payment block ── */
  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 32px;
    gap: 24px;
  }

  .info-block {
    flex: 1;
  }

  .info-block-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #9ca3af;
    margin-bottom: 8px;
  }

  .info-block-card {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px 14px;
    line-height: 1.7;
  }

  .info-block-card strong {
    font-size: 13px;
    color: #111827;
    display: block;
  }

  .info-block-card span {
    font-size: 11px;
    color: #6b7280;
  }

  /* ── Status badge ── */
  .badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .badge-completed { background: #dcfce7; color: #15803d; }
  .badge-pending   { background: #fef3c7; color: #b45309; }
  .badge-canceled  { background: #fee2e2; color: #b91c1c; }

  /* ── Items table ── */
  .table-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #9ca3af;
    margin-bottom: 8px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
  }

  thead tr {
    background: #111827;
    color: #fff;
  }

  thead th {
    padding: 10px 14px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    text-align: left;
  }

  thead th:last-child,
  thead th:nth-child(3),
  thead th:nth-child(4) {
    text-align: right;
  }

  tbody tr:nth-child(odd)  { background: #f9fafb; }
  tbody tr:nth-child(even) { background: #ffffff; }

  tbody td {
    padding: 10px 14px;
    font-size: 11px;
    color: #374151;
    border-bottom: 1px solid #f3f4f6;
  }

  tbody td:last-child,
  tbody td:nth-child(3),
  tbody td:nth-child(4) {
    text-align: right;
  }

  .tire-ref {
    font-family: monospace;
    font-size: 10px;
    color: #9ca3af;
    display: block;
    margin-top: 1px;
  }

  /* ── Totals ── */
  .totals {
    float: right;
    width: 260px;
    margin-bottom: 32px;
  }

  .totals table {
    margin: 0;
  }

  .totals td {
    padding: 6px 0;
    font-size: 12px;
    color: #374151;
    border: none;
    background: transparent !important;
  }

  .totals td:last-child {
    text-align: right;
    font-weight: 600;
  }

  .totals .grand-total td {
    font-size: 15px;
    font-weight: 700;
    color: #111827;
    border-top: 2px solid #18a06a;
    padding-top: 10px;
  }

  /* ── Footer ── */
  .clearfix::after { content: ''; display: table; clear: both; }

  .footer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    text-align: center;
    font-size: 10px;
    color: #9ca3af;
    line-height: 1.6;
  }

  .payment-method {
    display: inline-block;
    margin-top: 8px;
    padding: 4px 12px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 20px;
    font-size: 10px;
    color: #15803d;
    font-weight: 600;
  }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div>
      <div class="company-name">MonEntreprise</div>
      <div class="company-info">
        Rue Hassan II, Casablanca 20000<br>
        Tél : +212 522 000 000 · contact@monentreprise.ma<br>
        RC : 123456 · IF : 78901234 · ICE : 000000000000000
      </div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-title">Facture</div>
      <div class="invoice-number">{{ $transaction->invoice_number }}</div>
      <div class="invoice-date">
        {{ \Carbon\Carbon::parse($transaction->transaction_date)->format('d/m/Y') }}
      </div>
      <br>
      <span class="badge badge-{{ $transaction->status }}">
        {{ $transaction->type }}
      </span>
    </div>
  </div>

  <!-- CLIENT + PAYMENT -->
  <div class="info-row">
    <div class="info-block">
      <div class="info-block-title">Facturé à</div>
      <div class="info-block-card">
        <strong>{{ $transaction->contact->name ?? '—' }}</strong>
        @if($transaction->contact?->email)
          <span>{{ $transaction->contact->email }}</span>
        @endif
        @if($transaction->contact?->phone)
          <span>{{ $transaction->contact->phone }}</span>
        @endif
        @if($transaction->contact?->address)
          <span>{{ $transaction->contact->address }}</span>
        @endif
      </div>
    </div>

    <div class="info-block">
      <div class="info-block-title">Détails</div>
      <div class="info-block-card">
        <strong>Mode de paiement</strong>
        <span>
          @switch($transaction->payment_method)
            @case('cash')    Espèces @break
            @case('cheque')  Chèque @break
            @case('virement') Virement bancaire @break
          @endswitch
        </span>
        <strong style="margin-top:8px">Établi par</strong>
        <span>{{ $transaction->user->name ?? '—' }}</span>
      </div>
    </div>
  </div>

  <!-- ITEMS TABLE -->
  <div class="table-title">Articles</div>
  <table>
    <thead>
      <tr>
        <th style="width:35%">Désignation</th>
        <th style="width:20%">Dépôt</th>
        <th style="width:12%">Qté</th>
        <th style="width:16%">Prix unit. HT</th>
        <th style="width:17%">Total HT</th>
      </tr>
    </thead>
    <tbody>
      @foreach($transaction->details as $detail)
      <tr>
        <td>
          {{ $detail->tire->brand->name ?? '' }}
          <span class="tire-ref">{{ $detail->tire->reference ?? '' }}</span>
        </td>
        <td>{{ $detail->fromWarehouse->name ?? '—' }}</td>
        <td>{{ $detail->quantity }}</td>
        <td>{{ number_format($detail->unit_price, 2, ',', ' ') }} DH</td>
        <td>{{ number_format($detail->total_price, 2, ',', ' ') }} DH</td>
      </tr>
      @endforeach
    </tbody>
  </table>

  <!-- TOTALS -->
  <div class="totals">
    <table>
      <tr>
        <td>Sous-total HT</td>
        <td>{{ number_format($transaction->grand_total, 2, ',', ' ') }} DH</td>
      </tr>
      <tr>
        <td>TVA (20%)</td>
        <td>{{ number_format($transaction->grand_total * 0.20, 2, ',', ' ') }} DH</td>
      </tr>
      <tr class="grand-total">
        <td>Total TTC</td>
        <td>{{ number_format($transaction->grand_total * 1.20, 2, ',', ' ') }} DH</td>
      </tr>
    </table>
  </div>

  <div class="clearfix"></div>

  <!-- FOOTER -->
  <div class="footer">
    Merci pour votre confiance. Ce document tient lieu de facture.
    <br>
    MonEntreprise · RC 123456 · IF 78901234 · ICE 000000000000000
    <br>
    <span class="payment-method">
      Paiement :
      @switch($transaction->payment_method)
        @case('cash') Espèces @break
        @case('cheque') Chèque @break
        @case('virement') Virement bancaire @break
      @endswitch
    </span>
  </div>

</div>
</body>
</html>