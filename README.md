Kubernetes-Based Nanoservices Checkout Workflow with KEDA Scaling
Module Continuous Assessment

This project implements a nanoservices-based e-commerce checkout workflow deployed on Kubernetes (K3s).
It demonstrates:

Microservices composition
Ingress-based routing
KEDA autoscaling with scale-to-zero
Partial failure handling
Request correlation using X-Request-Id
Repeatable troubleshooting workflow
Persistent storage using PostgreSQL

<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="720" viewBox="0 0 1100 720" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
    <style>
      .title { font-size: 16px; font-weight: 600; fill: #1a1a2e; }
      .label { font-size: 12px; font-weight: 500; fill: #1a1a2e; }
      .sublabel { font-size: 10px; fill: #555; }
      .ns-label { font-size: 11px; font-weight: 600; fill: #0d47a1; }
      .arrow-line { stroke: #666; stroke-width: 1.2; fill: none; marker-end: url(#arrow); }
      .container { fill: #f5f7fa; stroke: #c0c8d4; stroke-width: 1; rx: 10; }
      .ns-box { fill: #e3f2fd; stroke: #90caf9; stroke-width: 1; rx: 8; }
      .pod { fill: #fff; stroke: #90caf9; stroke-width: 1; rx: 6; }
      .svc { fill: #fff; stroke: #66bb6a; stroke-width: 1; rx: 6; }
      .infra { fill: #fff3e0; stroke: #ffb74d; stroke-width: 1; rx: 6; }
      .storage { fill: #e8f5e9; stroke: #81c784; stroke-width: 1; rx: 6; }
      .config { fill: #fce4ec; stroke: #ef9a9a; stroke-width: 1; rx: 6; }
      .keda { fill: #ede7f6; stroke: #b39ddb; stroke-width: 1; rx: 6; }
    </style>
  </defs>

  <!-- Title -->
  <text x="550" y="30" text-anchor="middle" font-size="20" font-weight="700" fill="#1a1a2e">K3S (Kubernetes) — Shop Application Architecture</text>

  <!-- VM boundary -->
  <rect x="20" y="50" width="1060" height="660" class="container" stroke-dasharray="6 3"/>
  <text x="40" y="72" class="ns-label" fill="#555">Virtual Machine</text>

  <!-- End User -->
  <rect x="40" y="150" width="90" height="44" rx="22" fill="#e1f5fe" stroke="#4fc3f7" stroke-width="1"/>
  <text x="85" y="176" text-anchor="middle" class="label">End User</text>

  <!-- Traefik -->
  <rect x="180" y="148" width="100" height="48" class="infra"/>
  <text x="230" y="168" text-anchor="middle" class="label">Traefik</text>
  <text x="230" y="182" text-anchor="middle" class="sublabel">Ingress Controller</text>
  <line x1="130" y1="172" x2="178" y2="172" class="arrow-line"/>

  <!-- Namespace: Shop — Gateway -->
  <rect x="330" y="90" width="260" height="160" class="ns-box"/>
  <text x="340" y="108" class="ns-label">namespace: shop</text>

  <rect x="345" y="120" width="105" height="48" class="svc"/>
  <text x="397" y="140" text-anchor="middle" class="label">gateway-svc</text>
  <text x="397" y="154" text-anchor="middle" class="sublabel">Service</text>

  <rect x="465" y="120" width="110" height="48" class="pod"/>
  <text x="520" y="140" text-anchor="middle" class="label">gateway</text>
  <text x="520" y="154" text-anchor="middle" class="sublabel">Pod (Frontend)</text>

  <!-- KEDA -->
  <rect x="345" y="185" width="230" height="48" class="keda"/>
  <text x="460" y="205" text-anchor="middle" class="label">KEDA Autoscaler</text>
  <text x="460" y="219" text-anchor="middle" class="sublabel">Scale 0–5 based on request trigger</text>

  <!-- ConfigMap -->
  <rect x="345" y="270" width="105" height="40" class="config"/>
  <text x="397" y="294" text-anchor="middle" class="label">ConfigMap</text>

  <!-- Arrow: Traefik → gateway-svc -->
  <line x1="280" y1="172" x2="343" y2="145" class="arrow-line"/>

  <!-- Namespace: Shop — Checkout -->
  <rect x="640" y="90" width="260" height="120" class="ns-box"/>
  <text x="650" y="108" class="ns-label">namespace: shop</text>

  <rect x="655" y="120" width="110" height="48" class="svc"/>
  <text x="710" y="140" text-anchor="middle" class="label">checkout-svc</text>
  <text x="710" y="154" text-anchor="middle" class="sublabel">Service</text>

  <rect x="778" y="120" width="110" height="48" class="pod"/>
  <text x="833" y="140" text-anchor="middle" class="label">checkout-fn</text>
  <text x="833" y="154" text-anchor="middle" class="sublabel">Pod (Middleware)</text>

  <!-- Arrow: gateway → checkout-svc -->
  <line x1="575" y1="144" x2="653" y2="144" class="arrow-line"/>

  <!-- Namespace: Shop — Pricing -->
  <rect x="640" y="240" width="260" height="80" class="ns-box"/>
  <text x="650" y="258" class="ns-label">namespace: shop</text>

  <rect x="655" y="268" width="105" height="40" class="svc"/>
  <text x="707" y="292" text-anchor="middle" class="label">pricing-svc</text>

  <rect x="778" y="268" width="110" height="40" class="pod"/>
  <text x="833" y="292" text-anchor="middle" class="label">pricing-fn</text>
  <text x="833" y="302" text-anchor="middle" class="sublabel">Pod (Backend)</text>

  <!-- Arrow: checkout → pricing-svc -->
  <line x1="833" y1="168" x2="833" y2="210" class="arrow-line" stroke-dasharray="none"/>
  <path d="M833 210 L770 210 L770 266" class="arrow-line"/>

  <!-- Namespace: Shop — Inventory -->
  <rect x="640" y="350" width="260" height="80" class="ns-box"/>
  <text x="650" y="368" class="ns-label">namespace: shop</text>

  <rect x="655" y="378" width="110" height="40" class="svc"/>
  <text x="710" y="402" text-anchor="middle" class="label">inventory-svc</text>

  <rect x="778" y="378" width="110" height="40" class="pod"/>
  <text x="833" y="396" text-anchor="middle" class="label">inventory-fn</text>
  <text x="833" y="408" text-anchor="middle" class="sublabel">Pod (Backend)</text>

  <!-- Arrow: checkout → inventory-svc -->
  <path d="M888 168 L920 168 L920 398 L890 398" class="arrow-line"/>

  <!-- Secret -->
  <rect x="640" y="460" width="100" height="40" class="config"/>
  <text x="690" y="484" text-anchor="middle" class="label">Secret</text>

  <!-- PostgreSQL -->
  <rect x="330" y="380" width="260" height="110" class="ns-box" fill="#fff8e1" stroke="#ffe082"/>
  <text x="340" y="398" class="ns-label" fill="#e65100">Database</text>

  <rect x="345" y="410" width="115" height="48" class="svc"/>
  <text x="402" y="430" text-anchor="middle" class="label">postgres-svc</text>
  <text x="402" y="444" text-anchor="middle" class="sublabel">Service</text>

  <rect x="475" y="410" width="100" height="48" class="pod"/>
  <text x="525" y="430" text-anchor="middle" class="label">PostgreSQL</text>
  <text x="525" y="444" text-anchor="middle" class="sublabel">Pod</text>

  <!-- Arrow: checkout → postgres -->
  <path d="M710 168 L710 230 L460 230 L460 408" class="arrow-line"/>

  <!-- PV + PVC -->
  <rect x="330" y="530" width="260" height="80" class="storage"/>
  <text x="340" y="548" class="ns-label" fill="#2e7d32">Storage</text>

  <rect x="345" y="558" width="110" height="40" rx="6" fill="#fff" stroke="#81c784"/>
  <text x="400" y="578" text-anchor="middle" class="label" font-size="11">PersistentVolume</text>

  <rect x="468" y="558" width="110" height="40" rx="6" fill="#fff" stroke="#81c784"/>
  <text x="523" y="574" text-anchor="middle" class="label" font-size="11">PVC</text>
  <text x="523" y="586" text-anchor="middle" class="sublabel">Bound</text>

  <!-- Arrow: postgres → PV -->
  <line x1="460" y1="458" x2="460" y2="528" class="arrow-line"/>

  <!-- VM Disk -->
  <rect x="345" y="640" width="230" height="40" rx="20" fill="#eceff1" stroke="#90a4ae"/>
  <text x="460" y="664" text-anchor="middle" class="label">VM Disk</text>

  <!-- Arrow: PV → VM Disk -->
  <line x1="460" y1="610" x2="460" y2="638" class="arrow-line"/>

  <!-- Legend -->
  <g transform="translate(940, 460)">
    <text x="0" y="0" font-size="12" font-weight="600" fill="#1a1a2e">Legend</text>
    <rect x="0" y="12" width="14" height="14" class="pod"/><text x="22" y="23" class="sublabel">Pod</text>
    <rect x="0" y="34" width="14" height="14" class="svc"/><text x="22" y="45" class="sublabel">Service</text>
    <rect x="0" y="56" width="14" height="14" class="infra"/><text x="22" y="67" class="sublabel">Infrastructure</text>
    <rect x="0" y="78" width="14" height="14" class="config"/><text x="22" y="89" class="sublabel">Config / Secret</text>
    <rect x="0" y="100" width="14" height="14" class="storage"/><text x="22" y="111" class="sublabel">Storage</text>
    <rect x="0" y="122" width="14" height="14" class="keda"/><text x="22" y="133" class="sublabel">KEDA Autoscaler</text>
  </g>
</svg>

