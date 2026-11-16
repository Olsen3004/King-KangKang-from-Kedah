import React from 'react';
import { ChatMessage } from '../types/chat';

interface NlpTraceViewProps {
  latestBotMessage: ChatMessage | undefined;
  userName: string | null;
}

export function NlpTraceView({ latestBotMessage, userName }: NlpTraceViewProps) {
  const analysis = latestBotMessage?.analysis;

  return (
    <div className="space-y-4">
      <div className="border-b border-[#E2D9C8] pb-3">
        <h2 className="font-display text-lg font-semibold text-[#1C1917]">
          NLP &amp; Inference Pipeline Trace
        </h2>
        <p className="text-xs text-[#57534E]">
          Live record of input validation, Levenshtein spell correction, synonym matching, and rule firing.
        </p>
      </div>

      {!analysis ? (
        <div className="rounded-xl border border-[#E2D9C8] bg-[#FAF7F0] p-4 text-sm text-[#57534E]">
          Send a message to King KangKang to inspect the real-time NLP preprocessing, spelling
          corrections, synonym cluster hits, and Semantic Network rule trace.
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-[#E2D9C8] bg-white p-4">
          <dl className="divide-y divide-[#EFE9DC] text-xs">
            <div className="grid grid-cols-3 gap-2 py-2 first:pt-0">
              <dt className="font-semibold text-[#57534E]">Visitor Memory</dt>
              <dd className="col-span-2 font-medium text-[#115E59]">
                {userName ?? 'Awaiting visitor name'}
              </dd>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2">
              <dt className="font-semibold text-[#57534E]">Validation</dt>
              <dd className="col-span-2 font-mono text-[#1C1917]">
                {analysis.isValid ? 'PASS (valid domain query)' : `BLOCKED (${analysis.validationError})`}
              </dd>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2">
              <dt className="font-semibold text-[#57534E]">Normalized Text</dt>
              <dd className="col-span-2 font-mono text-[#1C1917]">
                {analysis.normalizedText || '—'}
              </dd>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2">
              <dt className="font-semibold text-[#57534E]">Spell Corrections</dt>
              <dd className="col-span-2 font-mono text-[#B45309]">
                {analysis.spellingCorrections.length > 0
                  ? analysis.spellingCorrections
                      .map((c) => `${c.original} → ${c.corrected} (d=${c.distance})`)
                      .join(', ')
                  : 'None needed'}
              </dd>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2">
              <dt className="font-semibold text-[#57534E]">Synonym Hits</dt>
              <dd className="col-span-2 font-mono text-[#1C1917]">
                {analysis.matchedSynonyms.length > 0
                  ? analysis.matchedSynonyms
                      .map((s) => `${s.matchedTerm} ⇒ ${s.concept}`)
                      .join(' · ')
                  : 'None'}
              </dd>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2">
              <dt className="font-semibold text-[#57534E]">Intent &amp; Rule</dt>
              <dd className="col-span-2 font-mono text-[#115E59]">
                {analysis.detectedIntent} ({analysis.questionType}) · {latestBotMessage?.ruleFired}
              </dd>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 last:pb-0">
              <dt className="font-semibold text-[#57534E]">Confidence</dt>
              <dd className="col-span-2 font-mono text-[#1C1917]">
                {Math.round(analysis.confidence * 100)}% · Engine: {latestBotMessage?.engine ?? 'expert-system'}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
