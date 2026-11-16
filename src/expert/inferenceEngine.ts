import {
  DIAGNOSTIC_RULES,
  DiagnosticRule,
  SEMANTIC_EDGES,
  SEMANTIC_NODES,
} from './knowledgeBase';
import {
  getTimeGreeting,
  NlpAnalysisResult,
  processQuery,
} from './nlpProcessor';

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
      text: `${timeGreeting}, ${existingUserName}! Welcome back to the royal workshop of King KangKang. The harvest breezes over Kedah’s paddy fields are gentle today—what aspect of Wau Kangkang’s heritage, splayed silhouette, or traditional bamboo craft would you like to explore next?`,
      activeNodeIds: ['wau_kangkang', 'kedah_heritage'],
      activeEdgeIds: ['e1'],
      ruleFired: 'RULE_RETURNING_VISITOR_GREETING',
      awaitingName: false,
    };
  }

  return {
    text: `${timeGreeting}! I am King KangKang, master artisan and royal guardian of Kedah’s traditional Wau Kangkang. Across our northern paddy plains, this wide-legged kite sings with a bamboo busur bow whenever the harvest winds blow. Before we step into the workshop, may I know your name so I can address you properly?`,
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

export function runExpertInference(
  rawInput: string,
  currentUserName: string | null,
  awaitingName: boolean,
  now: Date = new Date(),
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

  // Handle explicit name introduction
  if (analysis.detectedIntent === 'name_intro' && analysis.extractedName) {
    const timeGreeting = getTimeGreeting(now);
    return {
      replyText: `${timeGreeting}, ${analysis.extractedName}! What a pleasure to welcome you into my Kedah atelier. I will remember your name throughout our conversation. Tell me, what draws your curiosity first—the cultural story of why Wau Kangkang is shaped with wide-splayed legs over the paddy fields, or the traditional Tukang Wau secrets of curing bamboo and tuning the singing busur bow?`,
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

  // Route by semantic intent
  switch (analysis.detectedIntent) {
    case 'greeting': {
      const timeGreeting = getTimeGreeting(now);
      const reply = resolvedName
        ? `${timeGreeting}, ${resolvedName}! The bamboo frames are laid out and the workshop smells of seasoned buluh duri. What facet of Kedah’s Wau Kangkang would you like us to inspect together?`
        : `${timeGreeting}! Welcome again to my Kedah kite workshop. Feel free to tell me your name, or ask straightaway about Wau Kangkang’s heritage, cultural meaning, or crafting methods.`;
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
        replyText: `${nameAckNote}I am King KangKang, the royal master kite-maker (*Tukang Wau*) dedicated to preserving Kedah’s Wau Kangkang. I carry knowledge of its post-harvest significance in the Jelapang Padi plains, its *buluh duri* bamboo selection, *sobek* floral carving, and even flight troubleshooting when a kite misbehaves in the wind. Which part of the craft would you like to explore, ${politeName}?`,
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
        replyText: `${nameAckNote}${namePrefix}the name **Wau Kangkang** comes straight from the Malay word *kangkang* (or *terkangkang*), meaning "straddling" or "wide-legged." Looking at the kite’s silhouette, beneath its broad arched upper wings (*sayap*) and pinched waist (*pinggang*), the lower frame splits into two sweeping, outward-flaring legs rather than a closed crescent moon. In Kedah’s breezy paddy fields, those twin splayed legs work like natural vertical fins that stabilize yaw while giving the kite a lively, grounded village character. Curious how its silhouette compares to Wau Bulan, or how artisans bend those lower bamboo legs symmetrically?`,
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
        replyText: `${nameAckNote}${namePrefix}**Wau Kangkang** holds a cherished place in the cultural memory of **Kedah**, Malaysia’s historic *Jelapang Padi* (Rice Bowl). After the rice harvest (*musim menuai*), dry, steady east monsoon breezes known as *Angin Timur* sweep unimpeded across the flat *bendang* paddy fields of Kota Setar, Kubang Pasu, and Yan. Villagers gather in the spirit of *gotong-royong* to launch their hand-built wau—both as thanksgiving for an abundant harvest and as friendly artistry judged on altitude, grace, and the clarity of the kite’s hum. Its wide *terkangkang* posture symbolizes steadfastness and folk vitality, while its hand-carved floral motifs reflect harmony between human craft and nature. Would you like to hear how villagers craft its bamboo frame, or what makes the *busur* sing above the fields?`,
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
        replyText: `${nameAckNote}Crafting a true Kedah Wau Kangkang is an exercise in patience and symmetry, ${politeName}. First, a *Tukang Wau* selects mature **Buluh Duri** for the rigid central spine (*tulang belakang*) and suppler **Buluh Betong** or **Buluh Minyak** for the curved wings (*sayap*) and splayed legs. The bamboo is submerged (*direndam*) in muddy pond water for 1 to 2 weeks to leach out natural sugars that would otherwise invite boring beetles (*bubuk*). Next, using a curved *pisau raut* knife, we whittle both wing ribs millimeter by millimeter until the entire skeleton balances level on a single fingertip, lashing every joint strictly with waxed cotton thread (*benang*)—never nails. Shall we look closer at the *sobek* paper-cutting artistry next, or how the *teraju* bridle strings control flight pitch?`,
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
        replyText: `${nameAckNote}Ah, **seni sobek** is where the kite receives its royal Kedah dress, ${politeName}! Artisans first cover the bamboo skeleton with translucent base tissue using warm, hand-cooked tapioca starch paste (*gam tepung ubi*), which tightens cleanly as it dries. Then, brightly colored glazed *kertas wau* papers—often royal ochre gold, paddy emerald, crimson, and deep indigo—are folded symmetrically and carved freehand with a razor-sharp *pisau ukir*. Classic motifs include flowing **Awan Larat** (rolling clouds), **Bunga Ketumbit**, and **Pucuk Rebung** (bamboo shoots), layered like lace so morning light glows straight through the wings aloft. Which motif or pasting technique would you like me to break down further?`,
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
        replyText: `${nameAckNote}Listen closely to the sky over Kedah, ${politeName}—that haunting, resonant hum (*dengung*) comes from the **busur** mounted just behind the kite’s neck (*leher*). A slender, curved bamboo bow holds a taut, paper-thin strip of cured **daun ibus** (palm frond). When steady *Angin Timur* air rushes across the flat ribbon, aeroelastic flutter makes it vibrate rapidly, projecting a deep, melodic drone audible across neighbouring kampung fields. A master craftsman scrapes the middle of the *daun ibus* slightly thinner to tune its pitch—too slack and it stays silent; balanced right, it sings for hours aloft. Want to know how to troubleshoot a silent busur, or how the wind catches the rest of the frame?`,
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
        replyText: `${nameAckNote}That is an insightful comparison to draw, ${politeName}. While Kelantan’s famous **Wau Bulan** carries a wide, rounded crescent moon below its waist, Kedah’s **Wau Kangkang** replaces that single crescent with **two open, outward-splaying legs** (*kaki terkangkang*). Within Kedah’s own heritage family, **Wau Seri Bulan** displays sleeker, sharper crescent tips and **Wau Jala Budi** resembles a broad casting net or bodhi leaf, whereas Wau Kangkang is unmistakably proud and wide-stanced—offering agile yaw tracking in shifting paddy-field breezes. Which characteristic of Kedah’s regional kites fascinates you most?`,
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
        replyText: `${nameAckNote}Every Wau Kangkang is built from six harmonized parts, ${politeName}: the **Kepala** (upper head prow), the **Busur** (humming bow at the neck), twin **Sayap** (arched upper wings for lift), the **Tulang Belakang & Pinggang** (central *buluh duri* spine and pinched waist), the twin **Kaki Terkangkang** (the signature wide-splayed stabilizing legs), and the **Teraju** (the multi-point bridle controlling pitch against wind strength). You can also click any section on the **Wau Anatomy** blueprint beside our chat to inspect its bamboo material and tuning secret! Which part would you like to examine in detail?`,
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
        replyText: `${nameAckNote}Let us put on our *Tukang Wau* diagnostic eye, ${politeName}. Based on your description (**${rule.title}**), the likely root cause is: ${rule.rootCause}\n\nHere is my workshop prescription:\n1. ${rule.remedySteps[0]}\n2. ${rule.remedySteps[1]}\n3. ${rule.remedySteps[2] ?? 'Test-fly gently on a short line in steady wind before releasing full spool.'}\n\nFeel free to describe what the kite does next—or open the **Flight Doctor** tab beside us to run a full symptom check!`,
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
        replyText: `Terima kasih and safe winds to you, ${politeName}! May your curiosity soar as high and steadily as a Wau Kangkang above Kedah’s golden paddy fields. Whenever you wish to revisit bamboo curing, *sobek* carving, or flight tuning, my atelier door stays open.`,
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
        replyText: `${nameAckNote}${namePrefix}while my heart and training belong strictly to **Kedah’s Wau Kangkang**, I am afraid that topic lies outside my royal kite-making atelier. Ask me instead about the cultural meaning of Wau Kangkang during Kedah’s rice harvest, how *buluh duri* bamboo is cured in pond mud, how *sobek* floral patterns are carved, or how to fix a kite that spins or refuses to hum!`,
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
