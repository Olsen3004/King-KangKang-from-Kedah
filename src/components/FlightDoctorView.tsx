import React, { useState } from 'react';
import { MessageSquare, Stethoscope } from 'lucide-react';
import { DIAGNOSTIC_RULES, DiagnosticRule } from '../expert/knowledgeBase';

interface FlightDoctorViewProps {
  onSendDiagnosisToChat: (prompt: string) => void;
}

export function FlightDoctorView({ onSendDiagnosisToChat }: FlightDoctorViewProps) {
  const [selectedRuleId, setSelectedRuleId] = useState<string>(DIAGNOSTIC_RULES[0].id);
  const [windCondition, setWindCondition] = useState<'light' | 'steady' | 'gusty'>('steady');
  const [diagnosedRule, setDiagnosedRule] = useState<DiagnosticRule | null>(DIAGNOSTIC_RULES[0]);

  const handleRunDiagnosis = (e: React.FormEvent) => {
    e.preventDefault();
    const found = DIAGNOSTIC_RULES.find((r) => r.id === selectedRuleId) ?? DIAGNOSTIC_RULES[0];
    setDiagnosedRule(found);
  };

  const windAdvice =
    windCondition === 'light'
      ? 'Light breeze (<10 knots): shift the teraju tow knot 3–5 mm lower toward the waist to maximize lift.'
      : windCondition === 'gusty'
        ? 'Gusty Angin Timur (>18 knots): shift the teraju tow knot slightly upward toward the head so excess wind spills safely.'
        : 'Steady Kedah harvest wind (10–16 knots): standard mid-neck teraju balance works ideally.';

  return (
    <div className="space-y-5">
      <div className="border-b border-[#E2D9C8] pb-3">
        <h2 className="font-display text-lg font-semibold text-[#1C1917]">
          Tukang Wau Flight &amp; Craft Doctor
        </h2>
        <p className="text-xs text-[#57534E]">
          Rule-based diagnostic consultant mimicking a master Kedah kite-maker to solve flight and material defects.
        </p>
      </div>

      <form
        onSubmit={handleRunDiagnosis}
        className="space-y-4 rounded-xl border border-[#E2D9C8] bg-[#FAF7F0] p-4"
      >
        <div>
          <label
            htmlFor="symptom-select"
            className="mb-1.5 block text-xs font-semibold text-[#292524]"
          >
            Observed Symptom or Craft Defect
          </label>
          <select
            id="symptom-select"
            value={selectedRuleId}
            onChange={(e) => setSelectedRuleId(e.target.value)}
            className="min-h-[42px] w-full rounded-lg border border-[#D6CEBE] bg-white px-3 py-2 text-sm text-[#1C1917] focus:border-[#115E59] focus:outline-none focus:ring-2 focus:ring-[#115E59]/20"
          >
            {DIAGNOSTIC_RULES.map((rule) => (
              <option key={rule.id} value={rule.id}>
                {rule.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-semibold text-[#292524]">
            Kedah Field Wind Condition
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(['light', 'steady', 'gusty'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setWindCondition(mode)}
                className={`rounded-lg px-3 py-2 text-xs font-medium capitalize transition-colors ${
                  windCondition === mode
                    ? 'bg-[#115E59] text-white'
                    : 'border border-[#D6CEBE] bg-white text-[#44403C] hover:border-[#B45309]'
                }`}
              >
                {mode} Wind
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#B45309] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#92400E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B45309]"
        >
          <Stethoscope className="h-4 w-4" aria-hidden="true" />
          <span>Run Expert Diagnosis</span>
        </button>
      </form>

      {diagnosedRule && (
        <div
          data-testid="diagnosis-result"
          className="space-y-3 rounded-xl border border-[#E2D9C8] bg-white p-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#EFE9DC] pb-2.5">
            <h3 className="font-display text-base font-semibold text-[#1C1917]">
              {diagnosedRule.title}
            </h3>
            <span className="font-mono text-[11px] text-[#B45309]">{diagnosedRule.id}</span>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#292524]">Root Cause Analysis</p>
            <p className="text-xs leading-relaxed text-[#44403C]">{diagnosedRule.rootCause}</p>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#292524]">Recommended Workshop Fixes</p>
            <ol className="list-decimal space-y-1 pl-4 text-xs leading-relaxed text-[#44403C]">
              {diagnosedRule.remedySteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg bg-[#FAF7F0] p-3 text-xs leading-relaxed text-[#57534E]">
            <span className="font-semibold text-[#115E59]">Wind Calibration: </span>
            {windAdvice}
          </div>

          <button
            type="button"
            onClick={() =>
              onSendDiagnosisToChat(
                `My Wau Kangkang has this issue: ${diagnosedRule.title} in ${windCondition} wind. How can I fix it?`,
              )
            }
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#115E59] bg-white px-3 py-2 text-xs font-semibold text-[#115E59] transition-colors hover:bg-[#115E59] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#115E59]"
          >
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Discuss Diagnosis with King KangKang</span>
          </button>
        </div>
      )}
    </div>
  );
}
