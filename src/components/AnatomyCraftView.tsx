import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { ANATOMY_PARTS, CRAFT_STAGES } from '../expert/knowledgeBase';

const WORKSHOP_IMAGE = '/src/assets/images/wau_craft_workshop_1794768857147.jpg';

interface AnatomyCraftViewProps {
  onAskAboutPart: (question: string) => void;
}

export function AnatomyCraftView({ onAskAboutPart }: AnatomyCraftViewProps) {
  const [selectedPartId, setSelectedPartId] = useState<string>(ANATOMY_PARTS[5].id); // Default highlight Kaki Terkangkang
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

      {/* Interactive Blueprint SVG */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-[#E2D9C8] bg-[#FAF7F0] p-4 sm:grid-cols-2">
        <div className="flex items-center justify-center rounded-lg border border-[#E2D9C8] bg-white p-2">
          <svg
            viewBox="0 0 400 320"
            className="h-auto w-full max-w-[300px]"
            role="img"
            aria-label="Interactive anatomical blueprint of a traditional Kedah Wau Kangkang kite"
          >
            {/* Busur Humming Bow */}
            <path
              d="M 110 92 Q 200 66 290 92"
              fill="none"
              stroke="#B45309"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <line
              x1="112"
              y1="92"
              x2="288"
              y2="92"
              stroke="#78716C"
              strokeWidth="1.25"
              strokeDasharray="3 2"
            />

            {/* Main Upper Wings + Narrow Waist + Distinctive Splayed Twin Kangkang Legs */}
            <path
              d="M 200 36
                 L 216 96
                 C 278 90, 354 114, 358 140
                 C 356 168, 276 184, 214 184
                 C 214 210, 250 242, 286 286
                 C 246 274, 218 248, 200 222
                 C 182 248, 154 274, 114 286
                 C 150 242, 186 210, 186 184
                 C 124 184, 44 168, 42 140
                 C 46 114, 122 90, 184 96
                 Z"
              fill="#F3EBDD"
              stroke="#115E59"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Sobek Floral Rosette */}
            <circle cx="200" cy="142" r="24" fill="#115E59" fillOpacity="0.14" stroke="#B45309" strokeWidth="1.5" />
            <circle cx="122" cy="140" r="14" fill="#B45309" fillOpacity="0.16" stroke="#B45309" strokeWidth="1.2" />
            <circle cx="278" cy="140" r="14" fill="#B45309" fillOpacity="0.16" stroke="#B45309" strokeWidth="1.2" />

            {/* Central Tulang Belakang Spine */}
            <line
              x1="200"
              y1="36"
              x2="200"
              y2="225"
              stroke="#78350F"
              strokeWidth="2.5"
            />

            {/* Clickable Anatomy Hotspots */}
            {ANATOMY_PARTS.map((part, index) => {
              const isSelected = part.id === selectedPart.id;
              return (
                <g
                  key={part.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select anatomy part ${part.name}`}
                  onClick={() => setSelectedPartId(part.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPartId(part.id);
                    }
                  }}
                  className="cursor-pointer focus:outline-none"
                >
                  <circle
                    cx={part.cx}
                    cy={part.cy}
                    r={isSelected ? 14 : 11}
                    fill={isSelected ? '#115E59' : '#FFFFFF'}
                    stroke={isSelected ? '#0F4C48' : '#B45309'}
                    strokeWidth="2"
                  />
                  <text
                    x={part.cx}
                    y={part.cy + 4}
                    textAnchor="middle"
                    fill={isSelected ? '#FFFFFF' : '#1C1917'}
                    className="font-mono text-[10px] font-semibold"
                  >
                    {index + 1}
                  </text>
                </g>
              );
            })}
          </svg>
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
