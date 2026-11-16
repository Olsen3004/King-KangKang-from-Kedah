import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Feather, Send } from 'lucide-react';
import { ChatMessage } from '../types/chat';
import { FormattedProse } from './FormattedProse';

const AVATAR_PATH = '/src/assets/images/king_kangkang_avatar_1794768856165.jpg';
const HERO_PATH = '/src/assets/images/wau_kangkang_hero_1794768856663.jpg';

interface ChatPanelProps {
  messages: ChatMessage[];
  userName: string | null;
  timeGreeting: string;
  isSending: boolean;
  onSendMessage: (text: string) => void;
}

const OPTIONAL_TOPIC_STARTERS = [
  {
    label: 'Origin in Kedah',
    prompt: 'Where did Wau Kangkang originate in Kedah and why is it flown after harvest?',
  },
  {
    label: 'Why "Kangkang"?',
    prompt: 'Why is this kite named Wau Kangkang and what does its splayed silhouette symbolize?',
  },
  {
    label: 'Bamboo Curing',
    prompt: 'How do traditional Kedah artisans select and cure bamboo for the kite frame?',
  },
  {
    label: 'Sobek Paper Art',
    prompt: 'How are traditional floral sobek patterns carved and pasted onto Wau Kangkang?',
  },
  {
    label: 'Singing Busur Bow',
    prompt: 'How does the busur humming bow produce its resonant sound in the sky?',
  },
  {
    label: 'Fix Spinning Kite',
    prompt: 'My Wau Kangkang keeps spinning to one side when I fly it—how do I fix it?',
  },
];

export function ChatPanel({
  messages,
  userName,
  timeGreeting,
  isSending,
  onSendMessage,
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [showTopicMenu, setShowTopicMenu] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [heroFailed, setHeroFailed] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setInputError('Please enter a message, your name, or a question about Wau Kangkang.');
      return;
    }
    setInputError(null);
    onSendMessage(trimmed);
    setInputValue('');
  };

  const handleTopicPick = (prompt: string) => {
    setShowTopicMenu(false);
    setInputError(null);
    onSendMessage(prompt);
  };

  return (
    <section
      aria-label="Conversation with King KangKang"
      className="flex h-full min-h-[620px] flex-col overflow-hidden rounded-xl border border-[#E2D9C8] bg-white"
    >
      {/* Heritage Atelier Persona Banner */}
      <div className="border-b border-[#E2D9C8] bg-[#F7F3EA] px-5 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[#D6CEBE] bg-[#EBE4D5]">
              {!avatarFailed ? (
                <img
                  src={AVATAR_PATH}
                  alt="King KangKang, Royal Kedah Kite Artisan Avatar"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#115E59] text-white">
                  <Feather className="h-6 w-6" aria-hidden="true" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h1 className="font-display text-lg font-semibold leading-tight text-[#1C1917] sm:text-xl">
                King KangKang
              </h1>
              <p className="mt-0.5 text-xs text-[#57534E]">
                <span>{timeGreeting}</span>
                <span aria-hidden="true" className="mx-1.5">·</span>
                <span>Kedah Wau Kangkang Expert</span>
                <span aria-hidden="true" className="mx-1.5">·</span>
                <span data-testid="visitor-name-label" className="font-medium text-[#115E59]">
                  {userName ? `Visitor: ${userName}` : 'Visitor: Guest'}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-expanded={showTopicMenu}
            onClick={() => setShowTopicMenu((prev) => !prev)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#D6CEBE] bg-white px-3.5 py-2 text-xs font-medium text-[#292524] transition-colors hover:border-[#115E59] hover:text-[#115E59] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#115E59]"
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Topic Menu</span>
            {showTopicMenu ? (
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Collapsible Optional Topic Menu (available when user wants inspiration, never forced) */}
        {showTopicMenu && (
          <div className="mt-3.5 border-t border-[#E2D9C8] pt-3">
            <p className="mb-2 text-xs text-[#57534E]">
              Optional conversation starters — or simply type any question in your own words below:
            </p>
            <div className="flex flex-wrap gap-2">
              {OPTIONAL_TOPIC_STARTERS.map((topic) => (
                <button
                  key={topic.label}
                  type="button"
                  onClick={() => handleTopicPick(topic.prompt)}
                  className="rounded-lg border border-[#D6CEBE] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1917] transition-colors hover:border-[#B45309] hover:bg-[#FEF8EE] hover:text-[#92400E] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#115E59]"
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Compact Editorial Context Strip */}
      <div className="relative h-32 w-full shrink-0 overflow-hidden border-b border-[#E2D9C8] bg-[#EBE4D5] sm:h-36">
        {!heroFailed ? (
          <img
            src={HERO_PATH}
            alt="Traditional Kedah Wau Kangkang kite soaring above golden rice paddy fields"
            referrerPolicy="no-referrer"
            onError={() => setHeroFailed(true)}
            className="h-full w-full object-cover object-[50%_20%]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-[#115E59] to-[#B45309] text-sm font-medium text-white">
            Wau Kangkang — Traditional Kite Heritage of Kedah
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 py-2.5 text-white">
          <p className="font-display text-sm font-medium tracking-wide sm:text-base">
            Wau Kangkang of Kedah — Heritage, Craft &amp; Aerodynamics
          </p>
          <span className="hidden text-xs text-white/85 sm:inline">
            Jelapang Padi Tradition
          </span>
        </div>
      </div>

      {/* Conversation Transcript */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        className="flex-1 space-y-5 overflow-y-auto px-5 py-5"
      >
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-[#115E59] px-4 py-3 text-[15px] leading-relaxed text-white">
                  <p>{msg.text}</p>
                  <div className="mt-1.5 text-right text-[11px] text-white/75">
                    {userName ?? 'You'} · {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          }

          const corrections = msg.analysis?.spellingCorrections ?? [];

          return (
            <div key={msg.id} className="flex items-start gap-3">
              <div className="mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#D6CEBE] bg-[#F2ECE0]">
                {!avatarFailed ? (
                  <img
                    src={AVATAR_PATH}
                    alt="King KangKang"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#B45309] text-white">
                    <Feather className="h-4 w-4" aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="max-w-[86%] space-y-2 rounded-2xl rounded-tl-sm border border-[#E7E0D3] bg-[#FAF7F0] px-4 py-3.5">
                <FormattedProse text={msg.text} />

                {corrections.length > 0 && (
                  <p className="text-xs text-[#78716C]">
                    Interpreted:{' '}
                    {corrections
                      .map((c) => `"${c.original}" as "${c.corrected}"`)
                      .join(', ')}
                  </p>
                )}

                <p className="pt-1 text-[11px] text-[#78716C]">
                  King KangKang · {msg.timestamp}
                </p>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-3 text-xs text-[#57534E]">
            <div className="h-8 w-8 overflow-hidden rounded-full border border-[#D6CEBE] bg-[#F2ECE0]">
              {!avatarFailed && (
                <img
                  src={AVATAR_PATH}
                  alt="King KangKang"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <span>King KangKang is consulting the workshop records...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Chat Composer */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-[#E2D9C8] bg-[#FAF7F0] px-4 py-3.5"
      >
        {inputError && (
          <p role="alert" className="mb-2 text-xs font-medium text-[#B91C1C]">
            {inputError}
          </p>
        )}
        <div className="flex items-center gap-2.5">
          <label htmlFor="chat-input" className="sr-only">
            Message King KangKang
          </label>
          <input
            id="chat-input"
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (inputError) setInputError(null);
            }}
            placeholder={
              userName
                ? `Ask King KangKang about Wau Kangkang, ${userName}...`
                : 'Share your name or ask about Kedah’s Wau Kangkang...'
            }
            maxLength={500}
            className="min-h-[44px] flex-1 rounded-lg border border-[#D6CEBE] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#115E59] focus:outline-none focus:ring-2 focus:ring-[#115E59]/20"
          />
          <button
            type="submit"
            disabled={isSending}
            aria-label="Send message"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#115E59] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0F4C48] disabled:opacity-60 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#115E59]"
          >
            <span>Send</span>
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </form>
    </section>
  );
}
