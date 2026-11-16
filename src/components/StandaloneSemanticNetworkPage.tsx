import React from 'react';
import { Download } from 'lucide-react';

const SEMANTIC_TRIPLES = [
  { subject: 'Wau Kangkang', relation: 'is_a', object: 'Traditional Malay Kite' },
  { subject: 'Wau Kangkang', relation: 'originates_from', object: 'Kedah (Jelapang Padi)' },
  { subject: 'Kedah (Jelapang Padi)', relation: 'features_open', object: 'Paddy Fields (Bendang)' },
  { subject: 'Kedah (Jelapang Padi)', relation: 'sustains', object: 'Post-Harvest (Musim Menuai)' },
  { subject: 'Wau Kangkang', relation: 'contrasts_with', object: 'Wau Seri Bulan & Wau Bulan' },
  { subject: 'Wau Kangkang', relation: 'celebrated_during', object: 'Post-Harvest (Musim Menuai)' },
  { subject: 'Post-Harvest (Musim Menuai)', relation: 'brings_steady', object: 'Angin Timur Monsoon' },
  { subject: 'Wau Kangkang', relation: 'symbolizes', object: 'Gratitude & Gotong-Royong' },
  { subject: 'Wau Kangkang', relation: 'named_after', object: 'Splayed Legs (Terkangkang)' },
  { subject: 'Splayed Legs (Terkangkang)', relation: 'provides', object: 'Yaw Flight Stability' },
  { subject: 'Wau Kangkang', relation: 'consists_of', object: 'Upper Wings (Sayap) & Spine' },
  { subject: 'Upper Wings (Sayap) & Spine', relation: 'rigged_with', object: 'Teraju Bridle' },
  { subject: 'Teraju Bridle', relation: 'controls', object: 'Pitch & Wind Balance' },
  { subject: 'Wau Kangkang', relation: 'crafted_from', object: 'Buluh Duri & Buluh Betong' },
  { subject: 'Buluh Duri & Buluh Betong', relation: 'shaped_into', object: 'Upper Wings (Sayap) & Spine' },
  { subject: 'Buluh Duri & Buluh Betong', relation: 'cured_by', object: 'Pond Soaking (Merendam)' },
  { subject: 'Buluh Duri & Buluh Betong', relation: 'worked_with', object: 'Pisau Raut & Cotton Thread' },
  { subject: 'Wau Kangkang', relation: 'decorated_with', object: 'Sobek Floral Carving' },
  { subject: 'Sobek Floral Carving', relation: 'applied_using', object: 'Kertas Wau & Tapioca Starch' },
  { subject: 'Wau Kangkang', relation: 'produces_sound_via', object: 'Busur Humming Bow' },
  { subject: 'Busur Humming Bow', relation: 'strung_with', object: 'Daun Ibus Palm Strip' },
];

export function StandaloneSemanticNetworkPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F0] px-6 py-8 text-[#1C1917]">
      <div className="mx-auto max-w-[1200px] space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2D9C8] pb-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-[#1C1917]">
              Wau Kangkang Semantic Network
            </h1>
            <p className="mt-1 text-sm text-[#57534E]">
              Standalone Knowledge Representation Diagram (20 Concepts · 21 Semantic Relations)
            </p>
          </div>
          <a
            href="/wau_kangkang_semantic_network.svg"
            download="wau_kangkang_semantic_network.svg"
            className="inline-flex items-center gap-2 rounded-lg bg-[#115E59] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0F4C48]"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Download SVG Diagram</span>
          </a>
        </header>

        <div className="overflow-hidden rounded-xl border border-[#E2D9C8] bg-white p-3">
          <img
            src="/wau_kangkang_semantic_network.svg"
            alt="Standalone Semantic Network diagram for Wau Kangkang from Kedah"
            className="h-auto w-full"
          />
        </div>

        <section className="rounded-xl border border-[#E2D9C8] bg-white p-5">
          <h2 className="font-display text-lg font-semibold text-[#1C1917]">
            Semantic Network Triples (Subject → Relation → Object)
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2D9C8] text-[#57534E]">
                  <th className="py-2 pr-4 font-semibold">#</th>
                  <th className="py-2 pr-4 font-semibold">Subject Node</th>
                  <th className="py-2 pr-4 font-semibold">Semantic Relation</th>
                  <th className="py-2 font-semibold">Object Node</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DC]">
                {SEMANTIC_TRIPLES.map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-2 pr-4 font-mono text-[#78716C]">{idx + 1}</td>
                    <td className="py-2 pr-4 font-medium text-[#1C1917]">{row.subject}</td>
                    <td className="py-2 pr-4 font-mono text-[#B45309]">{row.relation}</td>
                    <td className="py-2 text-[#292524]">{row.object}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
