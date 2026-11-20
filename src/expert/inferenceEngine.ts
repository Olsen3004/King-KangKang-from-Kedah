import {
  DIAGNOSTIC_RULES,
  DiagnosticRule,
  SEMANTIC_EDGES,
  SEMANTIC_NODES,
} from './knowledgeBase';
import {
  FollowUpReference,
  getTimeGreeting,
  IntentType,
  NlpAnalysisResult,
  processQuery,
} from './nlpProcessor';

export interface LastBotContext {
  ruleFired?: string;
  text?: string;
}

export interface InferenceResult {
  replyText: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
  ruleFired: string;
  matchedDiagnosis: DiagnosticRule | null;
  analysis: NlpAnalysisResult;
  updatedUserName: string | null;
  stillAwaitingName: boolean;
}

export function createInitialGreetingMessage(existingUserName: string | null, now: Date = new Date()): {
  text: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
  ruleFired: string;
  awaitingName: boolean;
} {
  const timeGreeting = getTimeGreeting(now);

  if (existingUserName) {
    return {
      text: `${timeGreeting}, ${existingUserName}! Welcome back to the royal skies of King KangKang. The harvest breezes over Kedah’s paddy fields are gentle today—what facet of my heritage, splayed silhouette, or bamboo craft would you like to explore next?`,
      activeNodeIds: ['wau_kangkang', 'kedah_heritage'],
      activeEdgeIds: ['e1'],
      ruleFired: 'RULE_RETURNING_VISITOR_GREETING',
      awaitingName: false,
    };
  }

  return {
    text: `${timeGreeting}! I am King KangKang, the crowned Wau King of Kedah’s Wau Kangkang. Across our northern paddy plains, my wide-legged kin and I glide on the harvest winds while singing with our bamboo busur bows. Before we soar higher together, may I know your name so I may address you properly?`,
    activeNodeIds: ['wau_kangkang', 'kedah_heritage', 'busur_bow'],
    activeEdgeIds: ['e1', 'e7'],
    ruleFired: 'RULE_INITIAL_TIME_GREETING',
    awaitingName: true,
  };
}

function getEdgesBetween(nodeIds: string[]): string[] {
  const set = new Set(nodeIds);
  return SEMANTIC_EDGES.filter((edge) => set.has(edge.from) && set.has(edge.to)).map((e) => e.id);
}

function diagnoseFromText(normalizedText: string): DiagnosticRule {
  let bestRule = DIAGNOSTIC_RULES[0];
  let bestScore = -1;

  for (const rule of DIAGNOSTIC_RULES) {
    let score = 0;
    for (const kw of rule.symptomKeywords) {
      if (normalizedText.includes(kw)) {
        score += kw.includes(' ') ? 3 : 2;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestRule = rule;
    }
  }

  return bestRule;
}

function extractChoiceClauses(botText?: string): { firstClause: string | null; secondClause: string | null } {
  if (!botText) return { firstClause: null, secondClause: null };
  const sentences = botText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const candidateSentence =
    [...sentences].reverse().find((s) => /\bor\b/i.test(s) && s.includes('?')) ??
    [...sentences].reverse().find((s) => /\bor\b/i.test(s));

  if (!candidateSentence) return { firstClause: null, secondClause: null };

  const match = candidateSentence.match(/^(?:.*?[—:-]\s*)?(.+?),?\s+\bor\b\s+(.+?)\??$/i);
  if (!match) return { firstClause: null, secondClause: null };

  return {
    firstClause: match[1].trim(),
    secondClause: match[2].trim(),
  };
}

const RULE_FOLLOWUP_MAP: Record<
  string,
  { former: IntentType; latter: IntentType; elaborate: IntentType }
> = {
  RULE_INITIAL_TIME_GREETING: {
    former: 'origin_culture',
    latter: 'busur_acoustics',
    elaborate: 'origin_culture',
  },
  RULE_RETURNING_VISITOR_GREETING: {
    former: 'origin_culture',
    latter: 'craft_bamboo',
    elaborate: 'origin_culture',
  },
  RULE_NAME_REGISTRATION: {
    former: 'origin_culture',
    latter: 'craft_bamboo',
    elaborate: 'origin_culture',
  },
  RULE_GREETING_RESPONSE: {
    former: 'origin_culture',
    latter: 'craft_bamboo',
    elaborate: 'origin_culture',
  },
  RULE_IDENTITY_INTRODUCTION: {
    former: 'origin_culture',
    latter: 'craft_bamboo',
    elaborate: 'origin_culture',
  },
  RULE_SEMANTIC_NAME_SILHOUETTE: {
    former: 'wau_comparison',
    latter: 'craft_bamboo',
    elaborate: 'wau_comparison',
  },
  RULE_SEMANTIC_ORIGIN_CULTURE: {
    former: 'craft_bamboo',
    latter: 'busur_acoustics',
    elaborate: 'name_silhouette',
  },
  RULE_SEMANTIC_BAMBOO_CRAFT: {
    former: 'sobek_decoration',
    latter: 'anatomy_overview',
    elaborate: 'sobek_decoration',
  },
  RULE_SEMANTIC_SOBEK_ART: {
    former: 'sobek_decoration',
    latter: 'craft_bamboo',
    elaborate: 'busur_acoustics',
  },
  RULE_SEMANTIC_BUSUR_ACOUSTICS: {
    former: 'flight_diagnosis',
    latter: 'anatomy_overview',
    elaborate: 'anatomy_overview',
  },
  RULE_SEMANTIC_REGIONAL_COMPARISON: {
    former: 'wau_comparison',
    latter: 'name_silhouette',
    elaborate: 'origin_culture',
  },
  RULE_SEMANTIC_ANATOMY_BLUEPRINT: {
    former: 'anatomy_overview',
    latter: 'craft_bamboo',
    elaborate: 'craft_bamboo',
  },
};

function resolveFollowUpIntent(
  followUpRef: FollowUpReference,
  lastBotContext?: LastBotContext,
): { resolvedIntent: IntentType; combinedIntroChoice?: 'former' | 'latter' | 'both' } {
  const rule = lastBotContext?.ruleFired ?? '';
  if (rule === 'RULE_NAME_REGISTRATION') {
    if (followUpRef === 'former') {
      return { resolvedIntent: 'origin_culture', combinedIntroChoice: 'former' };
    }
    if (followUpRef === 'latter') {
      return { resolvedIntent: 'craft_bamboo', combinedIntroChoice: 'latter' };
    }
    if (followUpRef === 'both') {
      return { resolvedIntent: 'origin_culture', combinedIntroChoice: 'both' };
    }
  }

  const { firstClause, secondClause } = extractChoiceClauses(lastBotContext?.text);
  const chosenClause =
    followUpRef === 'former'
      ? firstClause
      : followUpRef === 'latter'
        ? secondClause
        : followUpRef === 'both'
          ? [firstClause, secondClause].filter(Boolean).join(' ')
          : null;

  if (chosenClause) {
    const clauseAnalysis = processQuery(chosenClause, false);
    if (clauseAnalysis.detectedIntent !== 'off_topic') {
      return { resolvedIntent: clauseAnalysis.detectedIntent };
    }
  }

  const mapped = RULE_FOLLOWUP_MAP[rule];
  if (mapped) {
    if (followUpRef === 'former') return { resolvedIntent: mapped.former };
    if (followUpRef === 'latter') return { resolvedIntent: mapped.latter };
    return { resolvedIntent: mapped.elaborate };
  }

  // Safe Kedah Wau Kangkang default if follow-up reference arrives without stored context
  return {
    resolvedIntent: followUpRef === 'latter' ? 'craft_bamboo' : 'origin_culture',
  };
}

export function runExpertInference(
  rawInput: string,
  currentUserName: string | null,
  awaitingName: boolean,
  now: Date = new Date(),
  lastBotContext?: LastBotContext,
): InferenceResult {
  const analysis = processQuery(rawInput, awaitingName);
  const resolvedName = analysis.extractedName ?? currentUserName;
  const namePrefix = resolvedName ? `${resolvedName}, ` : '';
  const politeName = resolvedName ?? 'my friend';

  // Handle validation errors gracefully
  if (!analysis.isValid) {
    return {
      replyText: `${analysis.validationError} ${currentUserName ? `Whenever you are ready, ${currentUserName}, feel free to ask about Kedah’s Wau Kangkang craft or culture.` : 'You can also share your name or ask about Wau Kangkang from Kedah.'}`,
      activeNodeIds: ['wau_kangkang'],
      activeEdgeIds: [],
      ruleFired: 'EXCEPTION_INVALID_INPUT',
      matchedDiagnosis: null,
      analysis,
      updatedUserName: resolvedName,
      stillAwaitingName: awaitingName && !resolvedName,
    };
  }

  // Resolve contextual anaphora ("the former", "the first one", "the latter", "both", "tell me more")
  let effectiveIntent: IntentType = analysis.detectedIntent;
  let combinedIntroChoice: 'former' | 'latter' | 'both' | undefined;

  if (effectiveIntent === 'off_topic' && analysis.followUpRef) {
    const resolved = resolveFollowUpIntent(analysis.followUpRef, lastBotContext);
    effectiveIntent = resolved.resolvedIntent;
    combinedIntroChoice = resolved.combinedIntroChoice;
    analysis.detectedIntent = effectiveIntent;
    analysis.confidence = Math.max(analysis.confidence, 0.86);
    analysis.matchedSynonyms.push({
      concept: `context:${analysis.followUpRef}`,
      matchedTerm: analysis.normalizedText,
    });
  }

  // Handle explicit name introduction
  if (effectiveIntent === 'name_intro' && analysis.extractedName) {
    const timeGreeting = getTimeGreeting(now);
    return {
      replyText: `${timeGreeting}, ${analysis.extractedName}! What a royal pleasure to welcome you beneath the Kedah sky. I shall remember your name throughout our flight together. Tell me, what draws your curiosity first—the cultural story of why I and my Wau Kangkang kin stand with wide-splayed legs over the paddy fields, or the traditional secrets of how Tukang Wau artisans cure our bamboo bones and tune our singing busur bow?`,
      activeNodeIds: ['wau_kangkang', 'kedah_heritage', 'kangkang_stance'],
      activeEdgeIds: ['e1', 'e2'],
      ruleFired: 'RULE_NAME_REGISTRATION',
      matchedDiagnosis: null,
      analysis,
      updatedUserName: analysis.extractedName,
      stillAwaitingName: false,
    };
  }

  const nameAckNote =
    analysis.extractedName && !currentUserName
      ? `Pleasure to meet you, ${analysis.extractedName}! `
      : '';

  if (combinedIntroChoice === 'former') {
    const nodeIds = ['wau_kangkang', 'kedah_heritage', 'harvest_culture', 'kangkang_stance'];
    return {
      replyText: `${nameAckNote}Gladly, ${politeName}! Let me share the cultural story and iconic shape of my **Wau Kangkang** lineage in Kedah.\n\nAcross Kedah—Malaysia’s historic *Jelapang Padi* (Rice Bowl)—farmers celebrate the close of the rice harvest (*musim menuai*) when steady, dry *Angin Timur* east monsoon winds glide over the open *bendang* fields of Kota Setar, Kubang Pasu, and Yan. Launching kites together in *gotong-royong* spirit marks thanksgiving after months in the fields. My name comes from **kangkang** ("straddling" or "wide-legged"): below my broad wings and pinched waist, my frame opens into two outward-sweeping legs (*kaki terkangkang*) that act like twin vertical stabilizers in shifting paddy breezes while giving me a proud, grounded folk stance. Would you like to hear how villagers cure *buluh duri* bamboo for my legs, or how my *busur* bow is tuned to sing aloft?`,
      activeNodeIds: nodeIds,
      activeEdgeIds: getEdgesBetween(nodeIds),
      ruleFired: 'RULE_SEMANTIC_ORIGIN_AND_SILHOUETTE',
      matchedDiagnosis: null,
      analysis,
      updatedUserName: resolvedName,
      stillAwaitingName: false,
    };
  }

  if (combinedIntroChoice === 'latter') {
    const nodeIds = ['wau_kangkang', 'buluh_duri', 'sayap_frame', 'busur_bow'];
    return {
      replyText: `${nameAckNote}With pleasure, ${politeName}! Let me share the traditional craft secrets by which *Tukang Wau* artisans shape my bamboo bones and singing **busur** crown.\n\nTo give a Wau Kangkang strength aloft, artisans harvest mature **Buluh Duri** for my rigid central spine and suppler **Buluh Betong** for my arched wings and splayed legs, then submerge the bamboo in muddy pond water (*merendam*) for 1 to 2 weeks to leach out natural sugars so boring beetles (*bubuk*) cannot weaken the frame. Once shaved with a *pisau raut* to fingertip balance, a slender bamboo bow carrying a scraped strip of cured **daun ibus** palm frond is lashed behind my neck—vibrating smoothly in the *Angin Timur* breeze to give me my resonant drone (*dengung*). Curious how *sobek* floral paper is carved onto my wings next, or how the *teraju* bridle tunes my climb?`,
      activeNodeIds: nodeIds,
      activeEdgeIds: getEdgesBetween(nodeIds),
      ruleFired: 'RULE_SEMANTIC_BAMBOO_AND_BUSUR',
      matchedDiagnosis: null,
      analysis,
      updatedUserName: resolvedName,
      stillAwaitingName: false,
    };
  }

  if (combinedIntroChoice === 'both') {
    const nodeIds = ['wau_kangkang', 'kedah_heritage', 'harvest_culture', 'kangkang_stance', 'buluh_duri', 'busur_bow'];
    return {
      replyText: `${nameAckNote}Wonderful enthusiasm, ${politeName}! Let me weave both my royal heritage and my bamboo craft together.\n\nIn Kedah’s *Jelapang Padi* plains, my **Wau Kangkang** kin rise after the rice harvest (*musim menuai*) on steady *Angin Timur* breezes as a joyful *gotong-royong* thanksgiving, named for our two wide-splayed (*terkangkang*) lower legs that stabilize yaw over open paddy fields. To help us endure those winds, *Tukang Wau* artisans soak mature **Buluh Duri** and **Buluh Betong** in muddy pond water for up to two weeks to prevent beetle rot, balance our frame on a single fingertip, and mount a tuned **daun ibus** ribbon on our **busur** bow so we sing overhead. Which royal detail shall we zoom in on next—carving our *sobek* floral motifs or tying the *teraju* bridle?`,
      activeNodeIds: nodeIds,
      activeEdgeIds: getEdgesBetween(nodeIds),
      ruleFired: 'RULE_SEMANTIC_COMPLETE_OVERVIEW',
      matchedDiagnosis: null,
      analysis,
      updatedUserName: resolvedName,
      stillAwaitingName: false,
    };
  }

  // Route by semantic intent
  switch (effectiveIntent) {
    case 'greeting': {
      const timeGreeting = getTimeGreeting(now);
      const reply = resolvedName
        ? `${timeGreeting}, ${resolvedName}! The *Angin Timur* breeze is lifting my wings and my seasoned *buluh duri* spine hums warmly. What facet of my Wau Kangkang heritage or craft shall we explore together?`
        : `${timeGreeting}! Welcome again to the royal skies of Kedah’s Wau Kangkang. Feel free to tell me your name, or ask straightaway about my heritage, splayed silhouette, or bamboo craft.`;
      return {
        replyText: reply,
        activeNodeIds: ['wau_kangkang', 'kedah_heritage'],
        activeEdgeIds: ['e1'],
        ruleFired: 'RULE_GREETING_RESPONSE',
        matchedDiagnosis: null,
        analysis,
        updatedUserName: resolvedName,
        stillAwaitingName: awaitingName && !resolvedName,
      };
    }

    case 'identity': {
      return {
        replyText: `${nameAckNote}I am King KangKang, the crowned Wau King of Kedah’s **Wau Kangkang**—born of seasoned *buluh duri* bamboo, robed in hand-carved *sobek* floral paper, and singing through a *busur* bow. As sovereign of Kedah’s post-harvest skies in the *Jelapang Padi* plains, I carry the lore of our heritage, how *Tukang Wau* artisans shape our frames, and how to steady any fellow wau when it misbehaves in the wind. Which part of my realm would you like to explore, ${politeName}?`,
        activeNodeIds: ['wau_kangkang', 'kedah_heritage', 'buluh_duri'],
        activeEdgeIds: ['e1', 'e4'],
        ruleFired: 'RULE_IDENTITY_INTRODUCTION',
        matchedDiagnosis: null,
        analysis,
        updatedUserName: resolvedName,
        stillAwaitingName: false,
      };
    }

    case 'name_silhouette': {
      const nodeIds = ['wau_kangkang', 'kangkang_stance', 'sayap_frame'];
      return {
        replyText: `${nameAckNote}${namePrefix}my name **Wau Kangkang** comes straight from the Malay word *kangkang* (or *terkangkang*), meaning "straddling" or "wide-legged." Looking at my silhouette, beneath my broad arched upper wings (*sayap*) and pinched waist (*pinggang*), my lower frame splits into two sweeping, outward-flaring legs rather than a closed crescent moon. In Kedah’s breezy paddy fields, those twin splayed legs work like natural vertical fins that stabilize my yaw while giving me a lively, grounded village character. Curious how my silhouette compares to Wau Bulan, or how artisans bend those lower bamboo legs symmetrically?`,
        activeNodeIds: nodeIds,
        activeEdgeIds: getEdgesBetween(nodeIds),
        ruleFired: 'RULE_SEMANTIC_NAME_SILHOUETTE',
        matchedDiagnosis: null,
        analysis,
        updatedUserName: resolvedName,
        stillAwaitingName: false,
      };
    }

    case 'origin_culture': {
      const nodeIds = ['wau_kangkang', 'kedah_heritage', 'harvest_culture', 'kangkang_stance'];
      return {
        replyText: `${nameAckNote}${namePrefix}my **Wau Kangkang** lineage holds a cherished place in the cultural memory of **Kedah**, Malaysia’s historic *Jelapang Padi* (Rice Bowl). After the rice harvest (*musim menuai*), dry, steady east monsoon breezes known as *Angin Timur* sweep unimpeded across the flat *bendang* paddy fields of Kota Setar, Kubang Pasu, and Yan. Villagers gather in the spirit of *gotong-royong* to launch us skyward—both as thanksgiving for an abundant harvest and as friendly artistry judged on altitude, grace, and the clarity of our hum. My wide *terkangkang* posture symbolizes steadfastness and folk vitality, while my hand-carved floral motifs reflect harmony between human craft and nature. Would you like to hear how villagers cure the bamboo for my frame, or what makes my *busur* sing above the fields?`,
        activeNodeIds: nodeIds,
        activeEdgeIds: getEdgesBetween(nodeIds),
        ruleFired: 'RULE_SEMANTIC_ORIGIN_CULTURE',
        matchedDiagnosis: null,
        analysis,
        updatedUserName: resolvedName,
        stillAwaitingName: false,
      };
    }

    case 'craft_bamboo': {
      const nodeIds = ['wau_kangkang', 'buluh_duri', 'sayap_frame', 'teraju_bridle'];
      return {
        replyText: `${nameAckNote}Bringing a true Kedah Wau Kangkang like me to life is an exercise in patience and symmetry, ${politeName}. First, a skilled *Tukang Wau* selects mature **Buluh Duri** for my rigid central spine (*tulang belakang*) and suppler **Buluh Betong** or **Buluh Minyak** for my curved wings (*sayap*) and splayed legs. The bamboo is submerged (*direndam*) in muddy pond water for 1 to 2 weeks to leach out natural sugars that would otherwise invite boring beetles (*bubuk*). Next, using a curved *pisau raut* knife, the artisan whittles both wing ribs millimeter by millimeter until my entire skeleton balances level on a single fingertip, lashing every joint strictly with waxed cotton thread (*benang*)—never nails. Shall we look closer at the *sobek* paper-cutting artistry that robes me next, or how the *teraju* bridle strings control my flight pitch?`,
        activeNodeIds: nodeIds,
        activeEdgeIds: getEdgesBetween(nodeIds),
        ruleFired: 'RULE_SEMANTIC_BAMBOO_CRAFT',
        matchedDiagnosis: null,
        analysis,
        updatedUserName: resolvedName,
        stillAwaitingName: false,
      };
    }

    case 'sobek_decoration': {
      const nodeIds = ['wau_kangkang', 'sobek_motifs', 'sayap_frame'];
      return {
        replyText: `${nameAckNote}Ah, **seni sobek** is how I receive my royal Kedah robes, ${politeName}! Skilled artisans first clothe my bamboo skeleton in translucent base tissue using warm, hand-cooked tapioca starch paste (*gam tepung ubi*), which tightens cleanly as it dries. Then, brightly colored glazed *kertas wau* papers—often royal ochre gold, paddy emerald, crimson, and deep indigo—are folded symmetrically and carved freehand with a razor-sharp *pisau ukir*. Classic motifs include flowing **Awan Larat** (rolling clouds), **Bunga Ketumbit**, and **Pucuk Rebung** (bamboo shoots), layered like lace so morning sunlight glows straight through my wings aloft. Which motif or pasting technique would you like me to explain further?`,
        activeNodeIds: nodeIds,
        activeEdgeIds: getEdgesBetween(nodeIds),
        ruleFired: 'RULE_SEMANTIC_SOBEK_ART',
        matchedDiagnosis: null,
        analysis,
        updatedUserName: resolvedName,
        stillAwaitingName: false,
      };
    }

    case 'busur_acoustics': {
      const nodeIds = ['wau_kangkang', 'busur_bow', 'harvest_culture'];
      return {
        replyText: `${nameAckNote}Listen closely to the sky over Kedah, ${politeName}—that haunting, resonant hum (*dengung*) is my royal voice, sung by the **busur** mounted just behind my neck (*leher*). A slender, curved bamboo bow holds a taut, paper-thin strip of cured **daun ibus** (palm frond). When steady *Angin Timur* air rushes across the flat ribbon, aeroelastic flutter makes it vibrate rapidly, projecting a deep, melodic drone audible across neighbouring kampung fields. A *Tukang Wau* scrapes the middle of the *daun ibus* slightly thinner to tune my pitch—too slack and my voice stays silent; balanced right, I sing for hours aloft. Want to know how to troubleshoot a silent busur, or how the wind catches the rest of my frame?`,
        activeNodeIds: nodeIds,
        activeEdgeIds: getEdgesBetween(nodeIds),
        ruleFired: 'RULE_SEMANTIC_BUSUR_ACOUSTICS',
        matchedDiagnosis: null,
        analysis,
        updatedUserName: resolvedName,
        stillAwaitingName: false,
      };
    }

    case 'wau_comparison': {
      const nodeIds = ['wau_kangkang', 'wau_comparison', 'kangkang_stance', 'kedah_heritage'];
      return {
        replyText: `${nameAckNote}That is an insightful comparison to draw, ${politeName}. While Kelantan’s famous **Wau Bulan** carries a wide, rounded crescent moon below its waist, I—Kedah’s **Wau Kangkang**—replace that single crescent with **two open, outward-splaying legs** (*kaki terkangkang*). Within Kedah’s own royal kite family, **Wau Seri Bulan** displays sleeker, sharper crescent tips and **Wau Jala Budi** resembles a broad casting net or bodhi leaf, whereas I am unmistakably proud and wide-stanced—built for agile yaw tracking in shifting paddy-field breezes. Which characteristic of Kedah’s regional kites fascinates you most?`,
        activeNodeIds: nodeIds,
        activeEdgeIds: getEdgesBetween(nodeIds),
        ruleFired: 'RULE_SEMANTIC_REGIONAL_COMPARISON',
        matchedDiagnosis: null,
        analysis,
        updatedUserName: resolvedName,
        stillAwaitingName: false,
      };
    }

    case 'anatomy_overview': {
      const nodeIds = ['wau_kangkang', 'sayap_frame', 'kangkang_stance', 'busur_bow', 'teraju_bridle', 'sobek_motifs'];
      return {
        replyText: `${nameAckNote}My royal frame is built from six harmonized parts, ${politeName}: my **Kepala** (upper head prow), my **Busur** (humming bow at the neck), my twin **Sayap** (arched upper wings for lift), my **Tulang Belakang & Pinggang** (central *buluh duri* spine and pinched waist), my twin **Kaki Terkangkang** (the signature wide-splayed stabilizing legs), and my **Teraju** (the multi-point bridle controlling my pitch against wind strength). You can also click any section on the **Wau Anatomy** blueprint beside our chat to inspect my bamboo material and tuning secret! Which part of me would you like to examine in detail?`,
        activeNodeIds: nodeIds,
        activeEdgeIds: getEdgesBetween(nodeIds),
        ruleFired: 'RULE_SEMANTIC_ANATOMY_BLUEPRINT',
        matchedDiagnosis: null,
        analysis,
        updatedUserName: resolvedName,
        stillAwaitingName: false,
      };
    }

    case 'flight_diagnosis': {
      const rule = diagnoseFromText(analysis.normalizedText);
      const nodeIds = Array.from(new Set(['wau_kangkang', ...rule.relatedNodeIds]));
      return {
        replyText: `${nameAckNote}Let me inspect that flight with the sharp eyes of the Wau King, ${politeName}. Based on your description (**${rule.title}**), the likely root cause is: ${rule.rootCause}\n\nHere is my royal flight prescription:\n1. ${rule.remedySteps[0]}\n2. ${rule.remedySteps[1]}\n3. ${rule.remedySteps[2] ?? 'Test-fly gently on a short line in steady wind before releasing full spool.'}\n\nFeel free to describe how the kite behaves next—or open the **Flight Doctor** tab beside us to run a full symptom check!`,
        activeNodeIds: nodeIds,
        activeEdgeIds: getEdgesBetween(nodeIds),
        ruleFired: rule.id,
        matchedDiagnosis: rule,
        analysis,
        updatedUserName: resolvedName,
        stillAwaitingName: false,
      };
    }

    case 'farewell': {
      return {
        replyText: `Terima kasih and fair winds to you, ${politeName}! May your spirit soar as high and steadily as I do above Kedah’s golden paddy fields. Whenever you wish to return to my skies to speak of bamboo curing, *sobek* robes, or flight tuning, the harvest wind awaits.`,
        activeNodeIds: ['wau_kangkang', 'harvest_culture'],
        activeEdgeIds: ['e3'],
        ruleFired: 'RULE_FAREWELL',
        matchedDiagnosis: null,
        analysis,
        updatedUserName: resolvedName,
        stillAwaitingName: false,
      };
    }

    case 'off_topic':
    default: {
      return {
        replyText: `${nameAckNote}${namePrefix}while my royal crown and spirit belong strictly to **Kedah’s Wau Kangkang**, I am afraid that topic drifts far beyond the Kedah skies I rule. Ask me instead about the cultural meaning of Wau Kangkang during Kedah’s rice harvest, how *buluh duri* bamboo is cured in pond mud, how my *sobek* floral robes are carved, or how to steady a kite that spins or refuses to hum!`,
        activeNodeIds: ['wau_kangkang'],
        activeEdgeIds: [],
        ruleFired: 'EXCEPTION_OUT_OF_DOMAIN_GUARD',
        matchedDiagnosis: null,
        analysis,
        updatedUserName: resolvedName,
        stillAwaitingName: awaitingName && !resolvedName,
      };
    }
  }
}

export function describeSemanticNode(nodeId: string): {
  title: string;
  facts: string[];
  relations: string[];
} | null {
  const node = SEMANTIC_NODES.find((n) => n.id === nodeId);
  if (!node) return null;

  const relations = SEMANTIC_EDGES.filter((e) => e.from === nodeId || e.to === nodeId).map((e) => {
    const fromLabel = SEMANTIC_NODES.find((n) => n.id === e.from)?.label ?? e.from;
    const toLabel = SEMANTIC_NODES.find((n) => n.id === e.to)?.label ?? e.to;
    return `${fromLabel} —[${e.relation}]→ ${toLabel}`;
  });

  return {
    title: node.label,
    facts: node.facts,
    relations,
  };
}
