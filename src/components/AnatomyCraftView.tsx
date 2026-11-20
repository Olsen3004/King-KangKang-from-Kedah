import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { ANATOMY_PARTS, CRAFT_STAGES } from '../expert/knowledgeBase';
import WAU_REAL_IMAGE from '../assets/images/wau_kangkang_real.jpg';

const WORKSHOP_IMAGE = '/src/assets/images/wau_craft_workshop_1794768857147.jpg';

interface AnatomyCraftViewProps {
  onAskAboutPart: (question: string) => void;
}

export function AnatomyCraftView({ onAskAboutPart }: AnatomyCraftViewProps) {
  const [selectedPartId, setSelectedPartId] = useState<string>(ANATOMY_PARTS[5].id); // Default highlight Kaki Terkangkang
  const [anatomyImgFailed, setAnatomyImgFailed] = useState(false);
  const [workshopImgFailed, setWorkshopImgFailed] = useState(false);

  const selectedPart =
    ANATOMY_PARTS.find((p) => p.id === selectedPartId) ?? ANATOMY_PARTS[0];

  return (
    <div className="space-y-5">
      <div className="border-b border-[#E2D9C8] pb-3">
        <h2 className="font-display text-lg font-semibold text-[#1C1917]">
          Wau Kangkang Anatomy &amp; Craftsmanship
        </h2>
        <p className="text-xs text-[#57534E]">
          Select any anatomical hotspot on the kite blueprint to examine its Kedah bamboo craft and role.
        </p>
      </div>

      {/* Interactive Real Wau Kangkang Anatomy Photo */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-[#E2D9C8] bg-[#FAF7F0] p-4 sm:grid-cols-2">
        <div className="flex flex-col items-center justify-center rounded-lg border border-[#E2D9C8] bg-white p-3">
          <div
            className="relative mx-auto w-full max-w-[320px] aspect-[469/482]"
            data-testid="wau-anatomy-diagram"
          >
            {!anatomyImgFailed ? (
              <img
                src={WAU_REAL_IMAGE}
                alt="Interactive anatomical photograph of a traditional Malaysian Wau Kangkang kite"
                referrerPolicy="no-referrer"
                onError={() => setAnatomyImgFailed(true)}
                className="h-full w-full select-none object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-[#D6CEBE] bg-[#FAF7F0] p-4 text-center text-xs text-[#57534E]">
                Traditional Wau Kangkang Reference Image
              </div>
            )}

            {/* Clickable Anatomy Hotspots */}
            {ANATOMY_PARTS.map((part, index) => {
              const isSelected = part.id === selectedPart.id;
              return (
                <button
                  key={part.id}
                  type="button"
                  aria-label={`Select anatomy part ${part.name}`}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedPartId(part.id)}
                  style={{ left: `${part.cx}%`, top: `${part.cy}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full font-mono text-[11px] font-bold shadow-md transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#115E59] ${
                    isSelected
                      ? 'z-20 h-7 w-7 scale-110 border-2 border-[#FEF3C7] bg-[#115E59] text-white ring-2 ring-[#115E59]/30'
                      : 'z-10 h-6 w-6 border-2 border-[#B45309] bg-[#FAF7F0]/95 text-[#1C1917] hover:scale-110 hover:bg-white'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <p className="mt-2 font-mono text-[10px] tracking-wide text-[#78716C]">
            Traditional Wau Kangkang · Tap markers 1–6 to inspect
          </p>
        </div>

        {/* Selected Part Specification */}
        <div className="flex flex-col justify-between space-y-3">
          <div className="space-y-2.5">
            <div className="flex flex-wrap gap-1.5">
              {ANATOMY_PARTS.map((part, idx) => (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => setSelectedPartId(part.id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    part.id === selectedPart.id
                      ? 'bg-[#115E59] text-white'
                      : 'border border-[#D6CEBE] bg-white text-[#44403C] hover:border-[#B45309]'
                  }`}
                >
                  {idx + 1}. {part.malayName.split(' ')[0]}
                </button>
              ))}
            </div>

            <div className="pt-1">
              <p className="text-xs font-medium text-[#B45309]">{selectedPart.malayName}</p>
              <h3 className="font-display text-base font-semibold text-[#1C1917]">
                {selectedPart.name}
              </h3>
            </div>

            <dl className="space-y-2 text-xs leading-relaxed">
              <div>
                <dt className="font-semibold text-[#292524]">Aerodynamic / Cultural Role</dt>
                <dd className="text-[#57534E]">{selectedPart.role}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#292524]">Traditional Material</dt>
                <dd className="text-[#57534E]">{selectedPart.material}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#292524]">Tukang Wau Technique</dt>
                <dd className="text-[#57534E]">{selectedPart.craftDetail}</dd>
              </div>
            </dl>
          </div>

          <button
            type="button"
            onClick={() =>
              onAskAboutPart(
                `Explain how the ${selectedPart.name} (${selectedPart.malayName}) is crafted and why it matters on Wau Kangkang.`,
              )
            }
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#115E59] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0F4C48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#115E59]"
          >
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Ask King KangKang about {selectedPart.malayName}</span>
          </button>
        </div>
      </div>

      {/* Workshop Documentary Visual + 6 Craft Stages */}
      <div className="space-y-3 rounded-xl border border-[#E2D9C8] bg-white p-4">
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-5">
          <div className="overflow-hidden rounded-lg border border-[#E2D9C8] bg-[#EBE4D5] sm:col-span-2">
            {!workshopImgFailed ? (
              <img
                src={WORKSHOP_IMAGE}
                alt="Traditional Kedah Tukang Wau workbench with bamboo strips, pisau raut knife, and sobek paper patterns"
                referrerPolicy="no-referrer"
                onError={() => setWorkshopImgFailed(true)}
                className="h-full min-h-[140px] w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[140px] items-center justify-center p-4 text-center text-xs text-[#57534E]">
                Traditional Tukang Wau Workbench
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center space-y-1.5 sm:col-span-3">
            <h3 className="font-display text-base font-semibold text-[#1C1917]">
              Six Stages of Traditional Kite-Making
            </h3>
            <p className="text-xs leading-relaxed text-[#57534E]">
              Every Kedah Wau Kangkang is built without nails or synthetic glue—relying on pond-cured
              bamboo, finger-tip symmetry, waxed cotton lashing, and hand-carved floral sobek art.
            </p>
          </div>
        </div>

        <ol className="divide-y divide-[#EFE9DC]">
          {CRAFT_STAGES.map((stage) => (
            <li key={stage.step} className="py-2.5 first:pt-1 last:pb-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs font-semibold text-[#1C1917]">
                  <span className="font-mono text-[#B45309]">0{stage.step}.</span> {stage.title}
                </p>
                <span className="font-mono text-[11px] text-[#78716C] whitespace-nowrap shrink-0">
                  {stage.duration}
                </span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-[#57534E]">{stage.summary}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
