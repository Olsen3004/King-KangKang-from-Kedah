import { SYNONYM_CLUSTERS } from './knowledgeBase';

export type IntentType =
  | 'greeting'
  | 'name_intro'
  | 'origin_culture'
  | 'name_silhouette'
  | 'craft_bamboo'
  | 'sobek_decoration'
  | 'busur_acoustics'
  | 'flight_diagnosis'
  | 'wau_comparison'
  | 'anatomy_overview'
  | 'farewell'
  | 'identity'
  | 'off_topic';

export type QuestionType = 'what' | 'how' | 'why' | 'where' | 'troubleshoot' | 'compare' | 'statement';

export interface SpellingCorrection {
  original: string;
  corrected: string;
  distance: number;
}

export interface SynonymMatch {
  concept: string;
  matchedTerm: string;
}

export interface NlpAnalysisResult {
  rawInput: string;
  normalizedText: string;
  isValid: boolean;
  validationError?: string;
  tokens: string[];
  meaningfulTokens: string[];
  spellingCorrections: SpellingCorrection[];
  matchedSynonyms: SynonymMatch[];
  detectedIntent: IntentType;
  questionType: QuestionType;
  extractedName: string | null;
  confidence: number;
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'am', 'be', 'been', 'being',
  'to', 'of', 'in', 'on', 'at', 'for', 'from', 'by', 'with', 'about', 'as',
  'into', 'like', 'through', 'after', 'over', 'between', 'out', 'against',
  'during', 'without', 'before', 'under', 'around', 'among', 'and', 'but',
  'or', 'so', 'yet', 'if', 'it', 'its', 'this', 'that', 'these', 'those',
  'i', 'me', 'my', 'you', 'your', 'we', 'our', 'they', 'their', 'can', 'could',
  'will', 'would', 'shall', 'should', 'do', 'does', 'did', 'have', 'has', 'had',
  'please', 'tell', 'explain', 'know', 'want', 'wanna', 'just', 'really', 'very',
  'much', 'more', 'some', 'any', 'all', 'also', 'there', 'here', 'then',
]);

const GRAMMAR_SHORTHANDS: Record<string, string> = {
  hw: 'how',
  wht: 'what',
  wat: 'what',
  y: 'why',
  whr: 'where',
  u: 'you',
  ur: 'your',
  im: 'i am',
  "i'm": 'i am',
  whats: 'what is',
  "what's": 'what is',
  hows: 'how is',
  "how's": 'how is',
  whys: 'why is',
  "why's": 'why is',
  dont: 'do not',
  "don't": 'do not',
  cant: 'cannot',
  "can't": 'cannot',
  wanna: 'want to',
  gonna: 'going to',
  mak: 'make',
  makeing: 'making',
  bmb00: 'bamboo',
  bambo: 'bamboo',
  bambu: 'bamboo',
  thx: 'thanks',
  tq: 'thank you',
  plz: 'please',
  pls: 'please',
};

const NON_NAME_WORDS = new Set([
  'hi', 'hello', 'hey', 'greetings', 'morning', 'afternoon', 'evening',
  'yes', 'no', 'ok', 'okay', 'sure', 'fine', 'good', 'great', 'thanks',
  'thank', 'bye', 'goodbye', 'what', 'why', 'how', 'where', 'when', 'who',
  'wau', 'kangkang', 'kedah', 'kite', 'kites', 'help', 'skip', 'none',
  'nothing', 'unknown', 'anonymous', 'test', 'testing', 'abc', 'asdf',
]);

// Build flat domain vocabulary from synonym clusters + key Malay/English craft terms
const EXTRA_DOMAIN_WORDS = [
  'kangkang', 'kedah', 'buluh', 'duri', 'betong', 'minyak', 'busur', 'dengung',
  'ibus', 'sobek', 'ukir', 'kertas', 'tepung', 'teraju', 'sayap', 'pinggang',
  'kepala', 'tulang', 'belakang', 'ekor', 'kaki', 'pisau', 'raut', 'bendang',
  'menuai', 'angin', 'timur', 'awan', 'larat', 'ketumbit', 'rebung', 'bubuk',
  'merendam', 'imbangan', 'kangkang', 'king', 'bamboo', 'heritage', 'culture',
  'significance', 'traditional', 'techniques', 'aerodynamics', 'silhouette',
  'symmetry', 'monsoon', 'harvest', 'diagnostic', 'troubleshoot', 'craftsman',
];

const DOMAIN_VOCABULARY: string[] = Array.from(
  new Set([
    ...EXTRA_DOMAIN_WORDS,
    ...Object.values(SYNONYM_CLUSTERS)
      .flat()
      .flatMap((phrase) => phrase.split(/\s+/))
      .filter((w) => w.length >= 3),
  ]),
);

export function getTimeGreeting(date: Date = new Date()): 'Good morning' | 'Good afternoon' | 'Good evening' {
  const hour = date.getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[m][n];
}

const COMMON_ENGLISH_GUARD = new Set([
  'price', 'today', 'tomorrow', 'yesterday', 'money', 'bitcoin', 'crypto',
  'stock', 'weather', 'movie', 'pizza', 'burger', 'phone', 'laptop', 'computer',
  'house', 'water', 'friend', 'school', 'class', 'teacher', 'student', 'assignment',
  'world', 'country', 'state', 'place', 'thing', 'person', 'people', 'color',
  'sound', 'shape', 'video', 'photo', 'image', 'write', 'speak', 'think',
]);

export function correctSpelling(token: string, vocabulary: string[] = DOMAIN_VOCABULARY): SpellingCorrection | null {
  if (
    token.length < 4 ||
    STOPWORDS.has(token) ||
    COMMON_ENGLISH_GUARD.has(token) ||
    vocabulary.includes(token)
  ) {
    return null;
  }

  const maxDistance = token.length >= 6 ? 2 : 1;
  let bestWord: string | null = null;
  let bestDist = Infinity;

  for (const candidate of vocabulary) {
    if (Math.abs(candidate.length - token.length) > maxDistance) continue;
    const dist = levenshteinDistance(token, candidate);
    if (dist > 0 && dist <= maxDistance && dist < bestDist) {
      bestDist = dist;
      bestWord = candidate;
    }
  }

  if (!bestWord) return null;
  return {
    original: token,
    corrected: bestWord,
    distance: bestDist,
  };
}

export function validateUserInput(raw: string): { isValid: boolean; error?: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Please share a question, greeting, or your name before sending.',
    };
  }
  if (trimmed.length > 500) {
    return {
      isValid: false,
      error: 'That message is quite long (over 500 characters). Please ask one focused question at a time so I can examine it thoroughly.',
    };
  }
  // Reject pure punctuation or digits without letters
  if (!/[a-zA-Z]/.test(trimmed)) {
    return {
      isValid: false,
      error: 'I could only detect symbols or numbers. Please write in words so we can converse properly.',
    };
  }
  // Detect repeated single-character mash like "aaaaaa" or "zzzzzz"
  if (/^(.)\1{4,}$/i.test(trimmed.replace(/\s+/g, ''))) {
    return {
      isValid: false,
      error: 'Those repeated characters look like an accidental keystroke. Ask me anything about Kedah’s Wau Kangkang!',
    };
  }
  // Detect obvious keyboard-mash gibberish (single long token >= 7 chars with zero vowels)
  const words = trimmed.toLowerCase().split(/\s+/);
  if (words.length === 1 && words[0].length >= 7 && !/[aeiouy]/i.test(words[0])) {
    return {
      isValid: false,
      error: 'I could not recognize that word. Could you rephrase your question about Wau Kangkang?',
    };
  }
  return { isValid: true };
}

function sanitizeCandidateName(candidate: string): string | null {
  const cleaned = candidate
    .replace(/[^a-zA-Z\s'-]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
  if (!cleaned || cleaned.length < 2 || cleaned.length > 32) return null;

  const parts = cleaned.split(' ').slice(0, 3);
  if (parts.some((p) => NON_NAME_WORDS.has(p.toLowerCase()))) {
    return null;
  }
  // Reject single-letter or repeated-character fake names like "aaa"
  if (parts.every((p) => p.length < 2 || /^(.)\1+$/i.test(p))) {
    return null;
  }
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

export function extractUserName(rawInput: string, awaitingName: boolean): string | null {
  const trimmed = rawInput.trim();

  // Explicit intro patterns
  const patterns = [
    /(?:my name is|name's|i am|i'm|im|call me|this is|saya|nama saya)\s+([a-zA-Z][a-zA-Z\s'-]{1,28})/i,
    /^(?:hi|hello|hey|good morning|good afternoon|good evening)[,!\s]+(?:i am|i'm|im|my name is)\s+([a-zA-Z][a-zA-Z\s'-]{1,28})/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) {
      // Stop before trailing clauses like "and i want to know..."
      const beforeClause = match[1].split(/\b(?:and|from|here|nice|pleased|want|tell|can|what|how|why)\b/i)[0];
      const name = sanitizeCandidateName(beforeClause);
      if (name) return name;
    }
  }

  // If King KangKang specifically just asked for their name, accept a clean 1-2 word name reply
  if (awaitingName) {
    const wordCount = trimmed.split(/\s+/).length;
    const looksLikeQuestion = /\?/.test(trimmed) || /^(what|how|why|where|when|who|can|tell|explain|show)\b/i.test(trimmed);
    if (wordCount <= 2 && !looksLikeQuestion) {
      return sanitizeCandidateName(trimmed);
    }
  }

  return null;
}

function detectQuestionType(normalizedText: string): QuestionType {
  if (/\b(compare|difference|versus|vs|different)\b/.test(normalizedText)) return 'compare';
  if (/\b(spin|spins|dive|dives|wobble|silent|crack|fix|repair|diagnose|troubleshoot|problem|issue|broken)\b/.test(normalizedText)) {
    return 'troubleshoot';
  }
  if (/^(how|\bhow\b)/.test(normalizedText)) return 'how';
  if (/^(why|\bwhy\b)/.test(normalizedText)) return 'why';
  if (/^(where|\bwhere\b)/.test(normalizedText)) return 'where';
  if (/^(what|who|which|\bwhat is\b|\bexplain\b|\btell me\b)/.test(normalizedText)) return 'what';
  return 'statement';
}

export function processQuery(rawInput: string, awaitingName = false): NlpAnalysisResult {
  const validation = validateUserInput(rawInput);
  if (!validation.isValid) {
    return {
      rawInput,
      normalizedText: rawInput.trim().toLowerCase(),
      isValid: false,
      validationError: validation.error,
      tokens: [],
      meaningfulTokens: [],
      spellingCorrections: [],
      matchedSynonyms: [],
      detectedIntent: 'off_topic',
      questionType: 'statement',
      extractedName: null,
      confidence: 0,
    };
  }

  const extractedName = extractUserName(rawInput, awaitingName);

  // Step 1: Lowercase, strip punctuation, expand grammar shorthands
  const baseClean = rawInput
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const rawTokens = baseClean.split(' ').flatMap((tok) => {
    const expanded = GRAMMAR_SHORTHANDS[tok];
    return expanded ? expanded.split(' ') : [tok];
  });

  const normalizedText = rawTokens.join(' ');

  // Step 2: Spell correction against domain lexicon
  const spellingCorrections: SpellingCorrection[] = [];
  const correctedTokens = rawTokens.map((tok) => {
    const correction = correctSpelling(tok);
    if (correction) {
      spellingCorrections.push(correction);
      return correction.corrected;
    }
    return tok;
  });

  const meaningfulTokens = correctedTokens.filter((t) => t.length > 1 && !STOPWORDS.has(t));
  const correctedText = correctedTokens.join(' ');

  // Step 3: Synonym expansion
  const matchedSynonyms: SynonymMatch[] = [];
  const conceptScores: Record<string, number> = {};

  for (const [concept, terms] of Object.entries(SYNONYM_CLUSTERS)) {
    for (const term of terms) {
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(correctedText)) {
        matchedSynonyms.push({ concept, matchedTerm: term });
        conceptScores[concept] = (conceptScores[concept] ?? 0) + (term.includes(' ') ? 2 : 1);
      }
    }
  }

  const questionType = detectQuestionType(correctedText);

  // Step 4: Intent classification with rule priority
  let detectedIntent: IntentType = 'off_topic';
  let confidence = 0.4;

  const has = (c: string) => (conceptScores[c] ?? 0) > 0;

  if (extractedName && meaningfulTokens.length <= 4 && !has('origin') && !has('craft') && !has('busur') && !has('sobek') && !has('diagnose')) {
    detectedIntent = 'name_intro';
    confidence = 0.95;
  } else if (has('farewell') && meaningfulTokens.length <= 4) {
    detectedIntent = 'farewell';
    confidence = 0.92;
  } else if (/\b(who are you|your name|about you|king kangkang)\b/.test(correctedText) && !has('origin') && !has('craft')) {
    detectedIntent = 'identity';
    confidence = 0.9;
  } else if (has('diagnose')) {
    detectedIntent = 'flight_diagnosis';
    confidence = 0.91;
  } else if (has('compare')) {
    detectedIntent = 'wau_comparison';
    confidence = 0.9;
  } else if (has('busur')) {
    detectedIntent = 'busur_acoustics';
    confidence = 0.92;
  } else if (has('sobek')) {
    detectedIntent = 'sobek_decoration';
    confidence = 0.91;
  } else if (has('bamboo') || has('curing') || has('craft')) {
    detectedIntent = 'craft_bamboo';
    confidence = 0.89;
  } else if (has('name_meaning') && (has('wau_kangkang') || !has('culture'))) {
    detectedIntent = 'name_silhouette';
    confidence = 0.88;
  } else if (has('anatomy') || has('teraju')) {
    detectedIntent = 'anatomy_overview';
    confidence = 0.87;
  } else if (has('origin') || has('kedah') || has('culture') || has('harvest')) {
    detectedIntent = 'origin_culture';
    confidence = 0.88;
  } else if (has('wau_kangkang')) {
    detectedIntent = 'origin_culture';
    confidence = 0.82;
  } else if (has('greeting') && meaningfulTokens.length <= 4) {
    detectedIntent = 'greeting';
    confidence = 0.88;
  } else {
    detectedIntent = 'off_topic';
    confidence = 0.25;
  }

  return {
    rawInput,
    normalizedText: correctedText,
    isValid: true,
    tokens: correctedTokens,
    meaningfulTokens,
    spellingCorrections,
    matchedSynonyms,
    detectedIntent,
    questionType,
    extractedName,
    confidence,
  };
}
