import { StudioTab } from '../types/chat';

interface TopBarProps {
  activeTab: StudioTab;
  onSelectTab: (tab: StudioTab) => void;
  onNewVisitor: () => void;
}

const NAV_ITEMS: Array<{ id: StudioTab; label: string }> = [
  { id: 'anatomy', label: 'Wau Anatomy' },
  { id: 'doctor', label: 'Flight Doctor' },
  { id: 'nlp', label: 'NLP Trace' },
];

export function TopBar({ activeTab, onSelectTab, onNewVisitor }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E2D9C8] bg-[#FAF7F0]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-4 py-3 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="font-display text-xl font-semibold tracking-tight text-[#1C1917] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#115E59]"
        >
          King KangKang
        </a>

        <nav aria-label="Knowledge Studio Views" className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#115E59] ${
                  isActive
                    ? 'text-[#115E59]'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-[#115E59]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onNewVisitor}
            className="rounded-lg border border-[#D6CEBE] bg-white px-4 py-2 text-xs font-semibold text-[#1C1917] transition-colors hover:border-[#B45309] hover:text-[#B45309] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#115E59]"
          >
            New Visitor
          </button>
        </div>
      </div>
    </header>
  );
}
