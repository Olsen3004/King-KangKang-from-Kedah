import { DiagnosticRule } from '../expert/knowledgeBase';
import { NlpAnalysisResult } from '../expert/nlpProcessor';

export type StudioTab = 'anatomy' | 'doctor' | 'nlp';

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  activeNodeIds?: string[];
  activeEdgeIds?: string[];
  ruleFired?: string;
  matchedDiagnosis?: DiagnosticRule | null;
  analysis?: NlpAnalysisResult;
  engine?: 'expert-system' | 'hybrid-gemini-expert';
}
