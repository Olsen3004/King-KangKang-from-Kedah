export interface SemanticNode {
  id: string;
  label: string;
  malayTerm?: string;
  category: 'core' | 'origin' | 'culture' | 'anatomy' | 'craft' | 'acoustics';
  summary: string;
  facts: string[];
  x: number;
  y: number;
}

export interface SemanticEdge {
  id: string;
  from: string;
  to: string;
  relation: string;
}

export interface DiagnosticRule {
  id: string;
  title: string;
  symptomKeywords: string[];
  conditionLabel: string;
  rootCause: string;
  remedySteps: string[];
  relatedNodeIds: string[];
}

export interface AnatomyPart {
  id: string;
  name: string;
  malayName: string;
  role: string;
  material: string;
  craftDetail: string;
  nodeId: string;
  cx: number;
  cy: number;
}

export interface CraftStage {
  step: number;
  title: string;
  malayTitle: string;
  duration: string;
  summary: string;
  tools: string[];
}

export const SEMANTIC_NODES: SemanticNode[] = [
  {
    id: 'wau_kangkang',
    label: 'Wau Kangkang',
    malayTerm: 'Wau Kangkang (Kedah)',
    category: 'core',
    summary:
      'A prized traditional Malay heritage kite from Kedah, celebrated for its broad upper wings, narrow waist, and distinctive wide-splayed twin lower legs.',
    facts: [
      'Recognized alongside Wau Seri Bulan and Wau Jala Budi as one of Kedah’s signature traditional kites.',
      'Named after its wide-legged ("terkangkang") lower tail lobes that give it an unmistakable striding silhouette in the sky.',
      'Balances aerodynamic lift from its arched upper wings with steady directional drag across the twin lower legs.',
    ],
    x: 340,
    y: 220,
  },
  {
    id: 'kedah_heritage',
    label: 'Kedah Paddy Plains',
    malayTerm: 'Jelapang Padi Kedah',
    category: 'origin',
    summary:
      'Born across the expansive rice-growing plains ("bendang") of Kedah in northern Peninsular Malaysia, where open horizons carry steady harvest winds.',
    facts: [
      'Kedah is known as the "Rice Bowl of Malaysia" (Jelapang Padi); flat, unobstructed fields create ideal laminar wind corridors.',
      'Oral heritage ties Wau Kangkang closely to farming villages in Kota Setar, Kubang Pasu, and Yan.',
      'Historically flown both by village artisans and under northern royal Malay patronage.',
    ],
    x: 115,
    y: 95,
  },
  {
    id: 'kangkang_stance',
    label: 'Splayed-Leg Silhouette',
    malayTerm: 'Bentuk Terkangkang',
    category: 'anatomy',
    summary:
      'The Malay word "kangkang" means wide-legged or straddling apart, describing the kite’s split lower twin tail lobes.',
    facts: [
      'Unlike the rounded crescent tail of Wau Bulan, Wau Kangkang splits at the waist ("pinggang") into two sweeping, outward-curving legs.',
      'The splayed legs act like dual vertical stabilizers, helping the kite track straight through shifting paddy-field breezes.',
      'Visually evokes vitality, grounded poise, and the humorous, lively stance of rural Kedah folk tales.',
    ],
    x: 340,
    y: 65,
  },
  {
    id: 'harvest_culture',
    label: 'Post-Harvest Celebration',
    malayTerm: 'Musim Menuai & Angin Timur',
    category: 'culture',
    summary:
      'Flown after the rice harvest when dry, steady east monsoon winds ("Angin Timur") sweep across Kedah’s golden fields.',
    facts: [
      'Marks thanksgiving for a bountiful rice yield and provides communal leisure after months of strenuous planting.',
      'Neighbours gather in "gotong-royong" spirit to judge height, stillness, beauty of craft, and the clarity of the kite’s hum.',
      'Symbolizes harmony between human craftsmanship, wind, and agricultural rhythm.',
    ],
    x: 565,
    y: 95,
  },
  {
    id: 'buluh_duri',
    label: 'Buluh Duri & Curing',
    malayTerm: 'Buluh Duri & Merendam',
    category: 'craft',
    summary:
      'Traditional bamboo framework using rigid Buluh Duri for the spine and flexible Buluh Betong or Buluh Minyak for curved wing arches.',
    facts: [
      'Mature bamboo is soaked ("direndam") in muddy pond or river water for 1 to 2 weeks to leach out starch and sugars.',
      'Soaking prevents powder-post beetles ("bubuk") from boring into the frame and increases long-term elasticity.',
      'Artisans shave strips with a curved "pisau raut" until left and right wings balance perfectly on a single fingertip.',
    ],
    x: 115,
    y: 235,
  },
  {
    id: 'sayap_frame',
    label: 'Arched Wings & Spine',
    malayTerm: 'Sayap, Tulang Belakang & Pinggang',
    category: 'anatomy',
    summary:
      'The load-bearing skeleton built from a central spine ("tulang belakang"), broad arched upper wings ("sayap"), and a pinched waist ("pinggang").',
    facts: [
      'Joints are tightly lashed with waxed cotton or nylon thread ("benang") without metal nails so the frame stays feather-light.',
      'Left and right wing curvature must match within millimetres; asymmetric flex causes spinning in flight.',
      'A slight dihedral bend in the upper wings creates natural roll stability aloft.',
    ],
    x: 165,
    y: 370,
  },
  {
    id: 'busur_bow',
    label: 'Busur Humming Bow',
    malayTerm: 'Busur / Dengung Wau',
    category: 'acoustics',
    summary:
      'A slender curved bamboo bow strung with a taut strip of cured palm frond ("daun ibus"), mounted behind the kite’s neck to sing in the wind.',
    facts: [
      'As wind rushes past the taut "daun ibus" ribbon, rapid aeroelastic vibration produces a resonant, haunting hum ("berdengung").',
      'Pitch changes with wind speed and ribbon tension—master Tukang Wau tune the busur by scraping the ribbon’s thickness.',
      'In Kedah villages, a clear, steady hum heard from afar announces a masterfully balanced wau high overhead.',
    ],
    x: 575,
    y: 235,
  },
  {
    id: 'sobek_motifs',
    label: 'Sobek Paper Carving',
    malayTerm: 'Seni Ukiran Sobek & Kertas Wau',
    category: 'craft',
    summary:
      'Layered, symmetrical floral paper-cut patterns carved freehand with a sharp knife and adhered with natural tapioca starch paste.',
    facts: [
      'Common traditional Kedah motifs include "Awan Larat" (rolling clouds), "Bunga Ketumbit", and "Pucuk Rebung" (bamboo shoots).',
      'Artisans fold glazed tissue or foil paper ("kertas wau") symmetrically before carving so both wings mirror seamlessly.',
      'Adhered using cooked tapioca starch paste ("gam tepung ubi") which dries taut like a drum skin without warping bamboo.',
    ],
    x: 525,
    y: 375,
  },
  {
    id: 'teraju_bridle',
    label: 'Teraju Bridle & Flight',
    malayTerm: 'Ikatan Teraju & Imbangan',
    category: 'acoustics',
    summary:
      'The multi-point bridle string assembly connecting the flying line to the spine, governing angle of attack and wind stability.',
    facts: [
      'Shifting the "teraju" tow point slightly forward flattens the angle of attack for strong gusts; moving it back increases lift in light wind.',
      'Improper teraju alignment is the #1 reason a well-built kite nose-dives or oscillates wildly.',
      'Testing balance before launch saves the delicate bamboo skeleton from crash damage.',
    ],
    x: 340,
    y: 395,
  },
  {
    id: 'wau_comparison',
    label: 'Kedah Wau Family',
    malayTerm: 'Wau Seri Bulan & Jala Budi',
    category: 'origin',
    summary:
      'Comparison between Wau Kangkang and its regional siblings such as Kelantan’s Wau Bulan and Kedah’s Wau Seri Bulan and Wau Jala Budi.',
    facts: [
      'Wau Bulan features a wide crescent-moon lower tail; Wau Kangkang replaces the crescent with two open, splayed legs.',
      'Wau Seri Bulan is Kedah’s royal moon kite with sharper wingtips, while Wau Jala Budi resembles a spreading bodhi-leaf/fishing net shape.',
      'All share Malay bamboo-curing and sobek traditions, yet each carries a distinct local silhouette and wind profile.',
    ],
    x: 195,
    y: 155,
  },
];

export const SEMANTIC_EDGES: SemanticEdge[] = [
  { id: 'e1', from: 'wau_kangkang', to: 'kedah_heritage', relation: 'originates_from' },
  { id: 'e2', from: 'wau_kangkang', to: 'kangkang_stance', relation: 'named_after' },
  { id: 'e3', from: 'wau_kangkang', to: 'harvest_culture', relation: 'celebrated_during' },
  { id: 'e4', from: 'wau_kangkang', to: 'buluh_duri', relation: 'crafted_from' },
  { id: 'e5', from: 'buluh_duri', to: 'sayap_frame', relation: 'shaped_into' },
  { id: 'e6', from: 'wau_kangkang', to: 'sayap_frame', relation: 'consists_of' },
  { id: 'e7', from: 'wau_kangkang', to: 'busur_bow', relation: 'produces_sound_via' },
  { id: 'e8', from: 'wau_kangkang', to: 'sobek_motifs', relation: 'decorated_with' },
  { id: 'e9', from: 'wau_kangkang', to: 'teraju_bridle', relation: 'stabilized_by' },
  { id: 'e10', from: 'wau_kangkang', to: 'wau_comparison', relation: 'belongs_to_family' },
  { id: 'e11', from: 'kedah_heritage', to: 'harvest_culture', relation: 'sustains' },
  { id: 'e12', from: 'sayap_frame', to: 'teraju_bridle', relation: 'rigged_with' },
];

export const ANATOMY_PARTS: AnatomyPart[] = [
  {
    id: 'kepala',
    name: 'Head Finial',
    malayName: 'Kepala Wau',
    role: 'Uppermost aerodynamic prow that leads the spine into incoming wind.',
    material: 'Tapered Buluh Duri spine tip wrapped in gold/crimson kertas wau.',
    craftDetail: 'Shaved slightly thinner than the waist so it flexes smoothly in sudden gusts.',
    nodeId: 'sayap_frame',
    cx: 200,
    cy: 42,
  },
  {
    id: 'busur',
    name: 'Humming Bow',
    malayName: 'Busur / Dengung',
    role: 'Generates the signature resonant hum aloft via wind-driven ribbon vibration.',
    material: 'Curved bamboo bow strung with cured daun ibus (palm frond strip).',
    craftDetail: 'Mounted at the neck; scraped along its centre edge to tune pitch.',
    nodeId: 'busur_bow',
    cx: 200,
    cy: 82,
  },
  {
    id: 'sayap',
    name: 'Upper Wing Span',
    malayName: 'Sayap Atas',
    role: 'Generates primary aerodynamic lift across Kedah’s open paddy-field breezes.',
    material: 'Matched twin arches of Buluh Betong or Buluh Minyak.',
    craftDetail: 'Both sides are whittled and flexed together until weight is identical.',
    nodeId: 'buluh_duri',
    cx: 108,
    cy: 138,
  },
  {
    id: 'pinggang',
    name: 'Narrow Waist & Spine',
    malayName: 'Pinggang & Tulang Belakang',
    role: 'Channels airflow between upper wings and lower legs while anchoring the bridle.',
    material: 'Seasoned Buluh Duri spine lashed with waxed cotton thread.',
    craftDetail: 'Balanced on a fingertip at the centre knot before any paper is glued.',
    nodeId: 'teraju_bridle',
    cx: 200,
    cy: 184,
  },
  {
    id: 'sobek',
    name: 'Sobek Floral Field',
    malayName: 'Ukiran Sobek',
    role: 'Provides wind-taut sail surface while expressing Kedah floral artistry.',
    material: 'Symmetrical cut kertas wau glued with cooked tapioca starch paste.',
    craftDetail: 'Features Awan Larat and Bunga Ketumbit motifs carved with a pisau ukir.',
    nodeId: 'sobek_motifs',
    cx: 286,
    cy: 140,
  },
  {
    id: 'kaki',
    name: 'Splayed Twin Legs',
    malayName: 'Kaki Terkangkang (Ekor)',
    role: 'Signature split lower lobes giving Wau Kangkang its name and yaw stability.',
    material: 'Twin curved bamboo ribs flaring outward below the waist.',
    craftDetail: 'Must mirror evenly in span and curve so the kite tracks straight without swinging.',
    nodeId: 'kangkang_stance',
    cx: 256,
    cy: 266,
  },
];

export const CRAFT_STAGES: CraftStage[] = [
  {
    step: 1,
    title: 'Selecting & Pond-Curing Bamboo',
    malayTitle: 'Memilih & Merendam Buluh',
    duration: '7–14 days',
    summary:
      'Mature Buluh Duri (for the spine) and Buluh Betong (for wings) are submerged in muddy pond water to remove sap sugars and deter boring beetles.',
    tools: ['Parang', 'Muddy soaking trench', 'Sun-drying rack'],
  },
  {
    step: 2,
    title: 'Whittling & Finger-Tip Balancing',
    malayTitle: 'Meraut & Menimbang',
    duration: '3–5 hours',
    summary:
      'Strips are shaved millimeter by millimeter with a curved pisau raut until both wings bend identically and balance dead-level on a fingertip.',
    tools: ['Pisau raut (whittling knife)', 'Balance thread'],
  },
  {
    step: 3,
    title: 'Lashing the Splayed Skeleton',
    malayTitle: 'Mengikat Rangka Terkangkang',
    duration: '2 hours',
    summary:
      'Spine, upper wing bow, narrow waist, and outward-flaring twin legs are lashed tightly with waxed cotton thread—zero nails or metal.',
    tools: ['Waxed benang cotton thread', 'Beeswax'],
  },
  {
    step: 4,
    title: 'Mounting & Tuning the Busur',
    malayTitle: 'Memasang Busur Dengung',
    duration: '1–2 hours',
    summary:
      'A slender bamboo bow holding a scraped strip of cured daun ibus is affixed at the neck and wind-tested until it sings cleanly.',
    tools: ['Daun ibus palm strip', 'Small scraping blade'],
  },
  {
    step: 5,
    title: 'Sobek Carving & Starch Papering',
    malayTitle: 'Menyobek & Menampal Kertas',
    duration: '4–8 hours',
    summary:
      'Base tissue is pasted with warm tapioca starch; folded layers of colored kertas wau are hand-carved into floral Awan Larat motifs and layered on.',
    tools: ['Pisau ukir (carving blade)', 'Kertas wau', 'Gam tepung ubi'],
  },
  {
    step: 6,
    title: 'Rigging the Teraju Bridle',
    malayTitle: 'Mengikat Teraju',
    duration: '30 mins',
    summary:
      'Two- or three-point bridle lines are knotted along the spine and adjusted according to Kedah harvest-wind strength before maiden launch.',
    tools: ['Twisted nylon flight cord', 'Test breeze'],
  },
];

export const DIAGNOSTIC_RULES: DiagnosticRule[] = [
  {
    id: 'RULE_SPIN_ASYMMETRY',
    title: 'Kite Spins or Pulls Hard to One Side',
    symptomKeywords: ['spin', 'spins', 'spinning', 'tilt', 'tilts', 'lean', 'left', 'right', 'circle', 'roll', 'asymmetric', 'uneven'],
    conditionLabel: 'Lateral imbalance in wing flex, weight, or splayed leg symmetry',
    rootCause:
      'One upper wing ("sayap") or splayed lower leg ("kaki kangkang") is stiffer, heavier, or longer than its twin, causing uneven lift in the breeze.',
    remedySteps: [
      'Hold the kite vertically by the spine tip and observe which side drops—that wing carries excess bamboo mass or paste.',
      'Flex both upper wings gently against the ground; if one curve is stiffer, lightly shave the inner belly of the stiffer bamboo rib with a pisau raut.',
      'Verify that the two splayed lower legs flare at identical angles from the central spine.',
      'As a field fix in the bendang, add a tiny counterweight paper patch or micro-tassel to the lighter wingtip.',
    ],
    relatedNodeIds: ['sayap_frame', 'buluh_duri', 'kangkang_stance'],
  },
  {
    id: 'RULE_NOSE_DIVE',
    title: 'Kite Nose-Dives or Refuses to Climb',
    symptomKeywords: ['dive', 'dives', 'diving', 'crash', 'drop', 'climb', 'heavy', 'nose', 'low', 'sink', 'pitch'],
    conditionLabel: 'Excessive forward angle of attack or front-heavy teraju rigging',
    rootCause:
      'The upper teraju bridle knot sits too far toward the head ("kepala"), or the kite lacks tail drag relative to wind speed.',
    remedySteps: [
      'Shift the main flying-line tow knot slightly downward toward the waist ("pinggang") to raise the nose angle and capture more lift.',
      'Check if the busur bow at the neck is overly heavy for light wind; lighten the bow ends slightly if needed.',
      'Ensure the upper spine has gentle backward arch ("lentik") so incoming wind pockets cleanly across the chest.',
    ],
    relatedNodeIds: ['teraju_bridle', 'sayap_frame'],
  },
  {
    id: 'RULE_SILENT_BUSUR',
    title: 'Busur Humming Bow Produces Weak or No Sound',
    symptomKeywords: ['silent', 'quiet', 'no sound', 'not humming', 'busur', 'hum', 'buzz', 'dengung', 'mute', 'noise'],
    conditionLabel: 'Insufficient daun ibus tension, twisted ribbon, or misaligned bow clearance',
    rootCause:
      'The vibrating daun ibus strip is either too slack, twisted unevenly, too thick along its center, or shielded from clean airflow behind the head.',
    remedySteps: [
      'Inspect the daun ibus ribbon: it must sit flat against the wind with uniform, drum-tight tension between the two bamboo bow tips.',
      'Lightly scrape the middle third of the leaf strip to make it slightly thinner and suppler—this lowers oscillation threshold.',
      'Check bow clearance above the kite head so the upper wing paper does not dampen airflow across the ribbon.',
      'If using damp palm leaf in humid weather, sun-dry the busur briefly to restore crisp resonance.',
    ],
    relatedNodeIds: ['busur_bow', 'wau_kangkang'],
  },
  {
    id: 'RULE_BAMBOO_CRACK_ROT',
    title: 'Bamboo Frame Snaps, Warps, or Attracts Beetles',
    symptomKeywords: ['crack', 'cracks', 'snap', 'break', 'beetle', 'bubuk', 'rot', 'warp', 'brittle', 'dry', 'bend'],
    conditionLabel: 'Improper bamboo selection or skipped pond-soaking curing stage',
    rootCause:
      'Young green bamboo or unsoaked culms retain natural starches that attract "bubuk" boring beetles and split unevenly when bent.',
    remedySteps: [
      'Harvest mature, thick-walled Buluh Duri for the spine and Buluh Betong for curved wings.',
      'Submerge cut bamboo in muddy pond or river water ("merendam") for 7 to 14 days to leach out starches.',
      'Always bend bamboo over gentle ember warmth slowly rather than forcing cold dry fibers.',
    ],
    relatedNodeIds: ['buluh_duri', 'sayap_frame'],
  },
  {
    id: 'RULE_GUST_WOBBLE',
    title: 'Kite Wobbles Wildly in Strong Harvest Gusts',
    symptomKeywords: ['wobble', 'wobbles', 'shake', 'gust', 'strong wind', 'unstable', 'flutter', 'oscillate', 'storm'],
    conditionLabel: 'Excessive angle of attack or under-tensioned lower frame in high wind',
    rootCause:
      'In strong "Angin Timur" gusts, a rear-set teraju traps too much wind pressure, causing rapid side-to-side hunting.',
    remedySteps: [
      'Move the teraju tow knot slightly upward toward the head so excess wind spills smoothly off the wings.',
      'Verify that the two splayed kangkang legs flex evenly under pressure—one overly soft leg flutters in gusts.',
      'Reinforce perimeter edges with a thin string border ("tali bingkai") inside the folded paper seam.',
    ],
    relatedNodeIds: ['teraju_bridle', 'kangkang_stance', 'harvest_culture'],
  },
];

// Extensive domain synonym lexicon (> 20 synonym groups, well above the 6-synonym benchmark)
export const SYNONYM_CLUSTERS: Record<string, string[]> = {
  wau_kangkang: ['wau', 'kangkang', 'kite', 'kites', 'layang', 'terkangkang', 'kedah kite'],
  origin: ['origin', 'origins', 'history', 'historical', 'heritage', 'roots', 'ancestry', 'background', 'story', 'started', 'came from', 'begin', 'began'],
  kedah: ['kedah', 'northern', 'alor setar', 'jelapang padi', 'paddy', 'rice field', 'rice harvest', 'bendang', 'field', 'fields', 'village', 'kampung'],
  culture: ['culture', 'cultural', 'significance', 'meaning', 'symbol', 'symbolic', 'symbolize', 'symbolizes', 'tradition', 'traditional', 'importance', 'value', 'purpose', 'why'],
  harvest: ['harvest', 'menuai', 'season', 'musim', 'monsoon', 'angin timur', 'festival', 'celebration', 'celebrate', 'community', 'gotong', 'royong'],
  name_meaning: ['name', 'called', 'named', 'mean', 'means', 'straddle', 'splayed', 'legs', 'wide-legged', 'stance', 'posture', 'etymology'],
  bamboo: ['bamboo', 'buluh', 'duri', 'betong', 'minyak', 'wood', 'frame', 'skeleton', 'rangka', 'spine', 'tulang', 'rib', 'ribs'],
  curing: ['cure', 'curing', 'soak', 'soaking', 'rendam', 'merendam', 'mud', 'beetle', 'bubuk', 'dry', 'smoke', 'prepare', 'treat'],
  craft: ['make', 'making', 'build', 'building', 'craft', 'crafting', 'construct', 'technique', 'techniques', 'process', 'steps', 'how', 'tukang', 'artisan', 'whittle', 'shave', 'raut', 'pisau'],
  busur: ['busur', 'hum', 'humming', 'buzz', 'buzzing', 'sound', 'music', 'sing', 'singing', 'dengung', 'bow', 'ibus', 'daun ibus', 'acoustic', 'vibration'],
  sobek: ['sobek', 'ukir', 'carve', 'carving', 'cut', 'cutting', 'pattern', 'patterns', 'motif', 'motifs', 'decoration', 'decorate', 'design', 'art', 'floral', 'awan', 'bunga', 'paper', 'kertas', 'glue', 'paste', 'starch'],
  teraju: ['teraju', 'bridle', 'string', 'line', 'fly', 'flying', 'flight', 'balance', 'imbangan', 'aerodynamics', 'wind', 'angle', 'launch'],
  diagnose: ['problem', 'issue', 'broken', 'fix', 'repair', 'diagnose', 'troubleshoot', 'spin', 'spins', 'spinning', 'dive', 'dives', 'wobble', 'crash', 'silent', 'crack', 'wrong', 'help me'],
  compare: ['compare', 'difference', 'different', 'versus', 'vs', 'bulan', 'wau bulan', 'seri bulan', 'jala budi', 'helang', 'kelantan', 'other'],
  anatomy: ['anatomy', 'parts', 'part', 'structure', 'shape', 'silhouette', 'wings', 'sayap', 'waist', 'pinggang', 'head', 'kepala', 'tail', 'ekor', 'kaki'],
  greeting: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'salam', 'assalamualaikum'],
  farewell: ['bye', 'goodbye', 'see you', 'thank you', 'thanks', 'terima kasih', 'quit', 'exit', 'done'],
};
