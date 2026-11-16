import React, { useCallback, useEffect, useState } from 'react';
import { TopBar } from './components/TopBar';
import { ChatPanel } from './components/ChatPanel';
import { AnatomyCraftView } from './components/AnatomyCraftView';
import { FlightDoctorView } from './components/FlightDoctorView';
import { NlpTraceView } from './components/NlpTraceView';
import { StandaloneSemanticNetworkPage } from './components/StandaloneSemanticNetworkPage';
import { WauMinigame } from './components/WauMinigame';
import { SEMANTIC_NODES } from './expert/knowledgeBase';
import { getTimeGreeting } from './expert/nlpProcessor';
import {
  createInitialGreetingMessage,
  runExpertInference,
} from './expert/inferenceEngine';
import { ChatMessage, StudioTab } from './types/chat';

const VISITOR_STORAGE_KEY = 'king_kangkang_visitor_name';

function formatClock(date: Date = new Date()): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function buildOpeningMessage(savedName: string | null): {
  message: ChatMessage;
  awaitingName: boolean;
} {
  const now = new Date();
  const initial = createInitialGreetingMessage(savedName, now);
  return {
    message: {
      id: `bot-init-${now.getTime()}`,
      sender: 'bot',
      text: initial.text,
      timestamp: formatClock(now),
      activeNodeIds: initial.activeNodeIds,
      activeEdgeIds: initial.activeEdgeIds,
      ruleFired: initial.ruleFired,
      engine: 'expert-system',
    },
    awaitingName: initial.awaitingName,
  };
}

export default function App() {
  const [userName, setUserName] = useState<string | null>(() => {
    try {
      return localStorage.getItem(VISITOR_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const isStandaloneSemanticRoute =
    typeof window !== 'undefined' && window.location.pathname === '/semantic-network';

  const initialSearchParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const autostartMinigame = initialSearchParams?.get('autostart') === '1';
  const initialMinigameOpen =
    typeof window !== 'undefined' &&
    (window.location.pathname === '/minigame' || Boolean(initialSearchParams?.has('autostart')));

  const [showMinigame, setShowMinigame] = useState<boolean>(initialMinigameOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [awaitingName, setAwaitingName] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<StudioTab>('anatomy');
  const [mobilePane, setMobilePane] = useState<'chat' | 'studio'>('chat');
  const [isSending, setIsSending] = useState<boolean>(false);

  const timeGreeting = getTimeGreeting();

  // Chatbot starts first on mount
  useEffect(() => {
    const { message, awaitingName: shouldAwait } = buildOpeningMessage(userName);
    setMessages([message]);
    setAwaitingName(shouldAwait);
  }, []); // Run once on initial boot with persisted visitor name

  const handleNewVisitor = useCallback(() => {
    try {
      localStorage.removeItem(VISITOR_STORAGE_KEY);
    } catch {
      // Ignore storage failures in private sessions
    }
    setUserName(null);
    const { message, awaitingName: shouldAwait } = buildOpeningMessage(null);
    setMessages([message]);
    setAwaitingName(shouldAwait);
    setMobilePane('chat');
  }, []);

  const handleSendMessage = useCallback(
    async (rawText: string) => {
      const now = new Date();
      const userMsg: ChatMessage = {
        id: `user-${now.getTime()}`,
        sender: 'user',
        text: rawText,
        timestamp: formatClock(now),
      };

      const inference = runExpertInference(rawText, userName, awaitingName, now);

      // Update remembered visitor name
      if (inference.updatedUserName && inference.updatedUserName !== userName) {
        setUserName(inference.updatedUserName);
        try {
          localStorage.setItem(VISITOR_STORAGE_KEY, inference.updatedUserName);
        } catch {
          // Ignore storage error
        }
      }
      setAwaitingName(inference.stillAwaitingName);
      setMessages((prev) => [...prev, userMsg]);

      const shouldEnrichWithServer =
        inference.analysis.isValid &&
        inference.analysis.detectedIntent !== 'off_topic' &&
        inference.analysis.detectedIntent !== 'name_intro' &&
        inference.analysis.detectedIntent !== 'farewell';

      let finalReply = inference.replyText;
      let engineUsed: 'expert-system' | 'hybrid-gemini-expert' = 'expert-system';

      if (shouldEnrichWithServer) {
        setIsSending(true);
        try {
          const activeNodeSummaries = inference.activeNodeIds
            .map((id) => SEMANTIC_NODES.find((n) => n.id === id))
            .filter(Boolean)
            .map((n) => `${n!.label} (${n!.malayTerm ?? ''}): ${n!.facts.join(' ')}`);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              userMessage: rawText,
              userName: inference.updatedUserName,
              timeGreeting: getTimeGreeting(now),
              intent: inference.analysis.detectedIntent,
              ruleFired: inference.ruleFired,
              activeNodeSummaries,
              deterministicReply: inference.replyText,
              conversationHistory: messages.slice(-4).map((m) => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                text: m.text,
              })),
            }),
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = (await res.json()) as {
              text?: string;
              engine?: 'expert-system' | 'hybrid-gemini-expert';
            };
            if (data.text) {
              finalReply = data.text;
              engineUsed = data.engine ?? 'expert-system';
            }
          }
        } catch {
          // Graceful deterministic fallback
        } finally {
          setIsSending(false);
        }
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: finalReply,
        timestamp: formatClock(new Date()),
        activeNodeIds: inference.activeNodeIds,
        activeEdgeIds: inference.activeEdgeIds,
        ruleFired: inference.ruleFired,
        matchedDiagnosis: inference.matchedDiagnosis,
        analysis: inference.analysis,
        engine: engineUsed,
      };

      setMessages((prev) => [...prev, botMsg]);
    },
    [userName, awaitingName, messages],
  );

  const handleAskFromStudio = useCallback(
    (question: string) => {
      setMobilePane('chat');
      void handleSendMessage(question);
    },
    [handleSendMessage],
  );

  const handleSelectStudioTab = useCallback((tab: StudioTab) => {
    setActiveTab(tab);
    setMobilePane('studio');
  }, []);

  const latestBotMessage = [...messages]
    .reverse()
    .find((m) => m.sender === 'bot' && m.analysis);

  if (isStandaloneSemanticRoute) {
    return <StandaloneSemanticNetworkPage />;
  }

  if (showMinigame) {
    return (
      <WauMinigame
        autostart={autostartMinigame}
        onExitToAtelier={() => {
          setShowMinigame(false);
          if (
            typeof window !== 'undefined' &&
            (window.location.pathname === '/minigame' || window.location.search.includes('autostart'))
          ) {
            window.history.replaceState({}, '', '/');
          }
        }}
      />
    );
  }

  return (
    <div id="top" className="min-h-screen bg-[#FAF7F0] text-[#1C1917]">
      <TopBar
        activeTab={activeTab}
        onSelectTab={handleSelectStudioTab}
        onOpenMinigame={() => setShowMinigame(true)}
        onNewVisitor={handleNewVisitor}
      />

      <main className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
        {/* Mobile Pane Switcher */}
        <div className="mb-4 flex gap-1.5 rounded-lg border border-[#E2D9C8] bg-[#F2ECE0] p-1 lg:hidden">
          <button
            type="button"
            onClick={() => setMobilePane('chat')}
            className={`flex-1 rounded-md py-2 text-xs font-semibold transition-colors ${
              mobilePane === 'chat'
                ? 'bg-white text-[#1C1917] shadow-sm'
                : 'text-[#57534E]'
            }`}
          >
            Atelier Chat
          </button>
          <button
            type="button"
            onClick={() => setMobilePane('studio')}
            className={`flex-1 rounded-md py-2 text-xs font-semibold transition-colors ${
              mobilePane === 'studio'
                ? 'bg-white text-[#1C1917] shadow-sm'
                : 'text-[#57534E]'
            }`}
          >
            Knowledge Studio
          </button>
          <button
            type="button"
            onClick={() => setShowMinigame(true)}
            className="flex-1 rounded-md py-2 text-xs font-semibold text-[#B45309] transition-colors hover:bg-white/60"
          >
            Minigame
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:h-[calc(100vh-112px)] lg:min-h-[660px] lg:grid-cols-12">
          {/* Primary Chat Atelier (Left 7 cols) */}
          <div
            className={`lg:col-span-7 lg:h-full ${
              mobilePane === 'chat' ? 'block' : 'hidden lg:block'
            }`}
          >
            <ChatPanel
              messages={messages}
              userName={userName}
              timeGreeting={timeGreeting}
              isSending={isSending}
              onSendMessage={(txt) => void handleSendMessage(txt)}
            />
          </div>

          {/* Interactive Knowledge Studio (Right 5 cols) */}
          <aside
            aria-label="Kedah Wau Kangkang Knowledge Studio"
            className={`flex flex-col overflow-hidden rounded-xl border border-[#E2D9C8] bg-white lg:col-span-5 lg:h-full ${
              mobilePane === 'studio' ? 'block' : 'hidden lg:flex'
            }`}
          >
            {/* Studio Sub-Navigation Tabs (Mobile/Tablet only; desktop uses TopBar) */}
            <div
              role="tablist"
              aria-label="Knowledge Studio Tabs"
              className="grid grid-cols-3 border-b border-[#E2D9C8] bg-[#F7F3EA] p-1.5 gap-1 lg:hidden"
            >
              {(
                [
                  { id: 'anatomy', label: 'Anatomy' },
                  { id: 'doctor', label: 'Doctor' },
                  { id: 'nlp', label: 'NLP' },
                ] as const
              ).map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    type="button"
                    aria-selected={isSelected}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-md px-2 py-2 text-xs font-semibold transition-colors whitespace-nowrap truncate focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#115E59] ${
                      isSelected
                        ? 'bg-white text-[#115E59] shadow-sm'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {activeTab === 'anatomy' && (
                <AnatomyCraftView onAskAboutPart={handleAskFromStudio} />
              )}

              {activeTab === 'doctor' && (
                <FlightDoctorView onSendDiagnosisToChat={handleAskFromStudio} />
              )}

              {activeTab === 'nlp' && (
                <NlpTraceView
                  latestBotMessage={latestBotMessage}
                  userName={userName}
                />
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
