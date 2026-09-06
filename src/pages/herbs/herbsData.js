// Herbs Library — curated reference content for the formulations that ship
// as Vedikshaya pods. Kept factual and sourced to classical texts / AYUSH
// guidance so it stands up to scrutiny.

export const KASHAYAS = [
  {
    slug: 'nilavembu-kudineer',
    name: 'Nilavembu Kudineer Chooranam',
    tradition: 'Siddha',
    tagline: 'The classical nine-herb antipyretic decoction of Tamil Nadu',
    summary:
      'A polyherbal kudineer (decoction powder) from the Siddha system, used for centuries against seasonal and epidemic fevers. It is an official formulation of the Tamil Nadu Government Siddha pharmacopoeia and was distributed at state scale during dengue, chikungunya and H1N1 outbreaks.',
    history: [
      'Nilavembu Kudineer is documented in the Siddha classical literature attributed to the Siddhar tradition, where "kudineer" denotes a water decoction taken warm. Its name comes from its principal herb — Nilavembu, "the neem that grows on the ground" — Andrographis paniculata, long called the "King of Bitters".',
      'In modern Tamil Nadu it is manufactured under the Indian Medicine & Homoeopathy Department and issued free through Primary Health Centres during fever seasons. During the 2012 dengue and 2016 chikungunya epidemics it was given prophylactically to lakhs of people, and it was included in the state’s integrative COVID-19 care advisories.',
      'Pharmacological studies on the whole formulation and on Andrographis report antipyretic, anti-inflammatory, hepatoprotective and immunomodulatory activity, and in-vitro antiviral effects against chikungunya and dengue virus — which is why it remains a research focus rather than a folk remedy alone.',
    ],
    modern:
      'Vedikshaya brews it to the pharmacopoeial 1:4 reduction so the bitter principles (andrographolides) and the aromatic cooling fraction (from vetiver and sandalwood) are extracted consistently — the two things a hand-boiled kashaya usually gets wrong.',
    prep:
      'Coarse powder of all nine herbs, boiled in ~4 parts water and reduced to 1 part, strained and taken warm. Traditionally 30–60 mL, twice daily, during fever.',
    ingredients: [
      {
        name: 'Nilavembu',
        botanical: 'Andrographis paniculata',
        part: 'Whole plant',
        role: 'Principal herb. Intensely bitter; antipyretic, hepatoprotective and immunomodulatory. Contributes the diterpenoid andrographolides that most research attributes the antiviral and fever-reducing action to.',
      },
      {
        name: 'Vetiver / Vettiver',
        botanical: 'Chrysopogon zizanioides',
        part: 'Root',
        role: 'Cooling and diaphoretic — promotes sweating to break a fever, and settles the burning sensation and thirst that accompany it.',
      },
      {
        name: 'Vilamichai ver',
        botanical: 'Plectranthus vettiveroides',
        part: 'Root',
        role: 'Aromatic coolant used alongside vetiver; traditionally regarded as pitta-pacifying and a mild diuretic.',
      },
      {
        name: 'Chandanam',
        botanical: 'Santalum album',
        part: 'Heartwood',
        role: 'Sandalwood — cooling, anti-inflammatory, calms the heat and restlessness of febrile illness; also lends the decoction its characteristic aroma.',
      },
      {
        name: 'Peyputtal',
        botanical: 'Trichosanthes cucumerina',
        part: 'Whole plant',
        role: 'Snake gourd — bitter, febrifuge and mildly laxative; supports appetite and digestion during recovery.',
      },
      {
        name: 'Korai kizhangu (Musta)',
        botanical: 'Cyperus rotundus',
        part: 'Rhizome',
        role: 'Nut-grass — classical anti-pyretic and digestive; used across Ayurveda and Siddha for jwara (fever) with poor appetite and loose stool.',
      },
      {
        name: 'Kadukkai',
        botanical: 'Terminalia chebula',
        part: 'Fruit rind',
        role: 'Haritaki — gentle bowel regulator and rasayana; helps clear the ama (metabolic residue) that Siddha and Ayurveda consider central to fever.',
      },
      {
        name: 'Sukku',
        botanical: 'Zingiber officinale',
        part: 'Dried rhizome',
        role: 'Dry ginger — warming counterweight to the many cold herbs, protects digestion and improves absorption of the other actives.',
      },
      {
        name: 'Milagu',
        botanical: 'Piper nigrum',
        part: 'Fruit',
        role: 'Black pepper — a classical bio-enhancer; its piperine improves the bioavailability of co-administered phytochemicals.',
      },
    ],
    references: [
      'Siddha Formulary of India, Part I & II (Govt. of India).',
      'Tamil Nadu Dr. MGR Medical University / NIS studies on Nilavembu Kudineer in dengue and chikungunya.',
      'Ministry of AYUSH integrative COVID-19 clinical advisories (2020–21).',
    ],
  },
  {
    slug: 'tulsi-dalchini-sunthi-marich',
    name: 'Tulsi-Dalchini-Sunthi-Marich',
    tradition: 'Ayurveda / AYUSH',
    tagline: 'The four-herb immunity kadha the Ministry of AYUSH put in every home',
    summary:
      'A simple, warming four-ingredient decoction — holy basil, cinnamon, dry ginger and black pepper. It is the core of the "Ayush Kwath / Kadha" that the Ministry of AYUSH recommended nationwide for immunity and respiratory wellness during the COVID-19 period.',
    history: [
      'Each of the four herbs is a staple of Ayurvedic gruha-chikitsa (household medicine) and appears in classical kashaya recipes for kasa (cough), shwasa (breathlessness) and pratishyaya (the common cold). The combination as a daily preventive drink was formalised by the Ministry of AYUSH in its January 2020 "immunity" guidelines and the "Ayush Kwath" advisory that followed.',
      'The Ayush Kwath ratio popularised by AYUSH is Tulsi 4 : Dalchini 2 : Sunthi 2 : Marich 1 parts, boiled in water and taken once or twice a day. State AYUSH departments distributed the powder in tens of millions of sachets in 2020–21.',
      'Tulsi (Ocimum sanctum) has a large body of research as an adaptogen and immunomodulator; ginger and cinnamon are well studied for anti-inflammatory and antimicrobial activity; black pepper’s piperine is the classic absorption enhancer that ties the formula together.',
    ],
    modern:
      'It is pleasant, safe for daily use, and needs almost nothing from the user — which is exactly why it travelled so well as a public-health intervention. Vedikshaya standardises the boil time and reduction so the volatile oils in tulsi and cinnamon are not driven off by over-boiling.',
    prep:
      'Tulsi : Dalchini : Sunthi : Marich in 4:2:2:1 parts, boiled in ~2 parts water for a few minutes, strained. 50–100 mL once or twice daily; may be taken with a little jaggery or lemon.',
    ingredients: [
      {
        name: 'Tulsi',
        botanical: 'Ocimum tenuiflorum (O. sanctum)',
        part: 'Leaf',
        role: 'Holy basil — the lead herb. Adaptogenic and immunomodulatory; classically indicated for cough, cold and low-grade fever, and for clearing the respiratory passages.',
      },
      {
        name: 'Dalchini',
        botanical: 'Cinnamomum verum (C. zeylanicum)',
        part: 'Inner bark',
        role: 'True cinnamon — warming, antimicrobial and carminative; eases congestion and adds palatability. Contributes cinnamaldehyde.',
      },
      {
        name: 'Sunthi',
        botanical: 'Zingiber officinale',
        part: 'Dried rhizome',
        role: 'Dry ginger — deepipana-pachana (kindles digestion, clears ama), anti-emetic and anti-inflammatory; the "universal medicine" (vishwabheshaja) of Ayurveda.',
      },
      {
        name: 'Marich',
        botanical: 'Piper nigrum',
        part: 'Fruit',
        role: 'Black pepper — pungent, opens the channels (srotoshodhana) and, via piperine, raises the bioavailability of the other three herbs’ actives.',
      },
    ],
    references: [
      'Ministry of AYUSH — "Ayurveda’s immunity boosting measures for self care during COVID-19 crisis" (2020) and the Ayush Kwath advisory.',
      'Charaka Samhita & Bhavaprakasha references for Tulsi, Shunthi, Maricha and Twak (Dalchini) in kasa/shwasa.',
      'Reviews on Ocimum sanctum as an adaptogen (J. Ayurveda Integr. Med.).',
    ],
  },
  {
    slug: 'shadanga-paniya',
    name: 'Shadanga Paniya',
    tradition: 'Ayurveda (Charaka Samhita)',
    tagline: '“Six-limbed water” — the classical medicated drinking water for fever',
    summary:
      'Shadanga Paniya (षडङ्गपानीयम्, "water of six parts") is a preparation from the Charaka Samhita in which six herbs are boiled in water, reduced, and the strained liquid is then used as the patient’s drinking water throughout a fever. It is the textbook answer for trishna (pathological thirst) and the burning of jwara.',
    history: [
      'The formulation is given in Charaka Samhita, Chikitsa Sthana (Jwara Chikitsa): water boiled with Musta, Parpataka, Usheera, Chandana, Udichya and Nagara, reduced to one-eighth, cooled, and given to drink. Sushruta and later compendia (Ashtanga Hridaya, Sharngadhara) carry the same recipe with minor substitutions.',
      'The logic is elegant: rather than a dose taken twice a day, the medicine replaces ordinary water — so a feverish patient who is drinking constantly is dosed continuously with a gentle antipyretic, digestive and thirst-relieving decoction. Five of the six herbs are cooling and aromatic; a small amount of dry ginger keeps it from aggravating the digestion.',
      'Modern Ayurvedic hospitals still prescribe Shadanga Paniya as supportive care in viral fevers and post-fever weakness, and small clinical studies report reduced fever duration and better relief of thirst and malaise versus plain water.',
    ],
    modern:
      'It is one of the safest "medicines" in the classical repertoire — essentially flavoured, mildly active water. Vedikshaya reproduces the one-eighth reduction the text specifies, which a home cook almost never has the patience for, and serves it at a controlled cool temperature.',
    prep:
      'Equal parts of the six herbs (coarse powder), boiled in 8 parts water and reduced to 1 part, strained and cooled. Used as drinking water, ~30–50 mL at a time, through the febrile phase.',
    ingredients: [
      {
        name: 'Musta',
        botanical: 'Cyperus rotundus',
        part: 'Rhizome',
        role: 'Nut-grass — deepana-pachana and jwaraghna (anti-pyretic); a classical first choice for fever with indigestion and diarrhoea.',
      },
      {
        name: 'Parpataka',
        botanical: 'Fumaria parviflora (F. indica)',
        part: 'Whole plant',
        role: 'Pittapapra — bitter, cooling, specifically praised in the texts for fever with burning sensation and delirium; blood-cooling (raktaprasadana).',
      },
      {
        name: 'Usheera',
        botanical: 'Chrysopogon zizanioides',
        part: 'Root',
        role: 'Vetiver — fragrant coolant and diaphoretic; relieves trishna (thirst) and daha (burning), and gives the drink its pleasant scent.',
      },
      {
        name: 'Chandana',
        botanical: 'Santalum album',
        part: 'Heartwood',
        role: 'Sandalwood — cooling, anti-inflammatory, calms restlessness and the heat of the fever; mild diuretic.',
      },
      {
        name: 'Udichya (Balaka / Hrivera)',
        botanical: 'Pavonia odorata',
        part: 'Root',
        role: 'Aromatic coolant paired with vetiver in the classical texts; carminative and thirst-relieving.',
      },
      {
        name: 'Nagara (Shunthi)',
        botanical: 'Zingiber officinale',
        part: 'Dried rhizome',
        role: 'Dry ginger — the single warm herb; guards agni (digestive fire) so the five cold herbs do not dull the appetite, and improves extraction of the others.',
      },
    ],
    references: [
      'Charaka Samhita, Chikitsa Sthana 3 (Jwara Chikitsa) — Shadanga Paniya.',
      'Ashtanga Hridaya, Nidana/Chikitsa Sthana; Sharngadhara Samhita, Madhyama Khanda.',
      'Contemporary reviews of Shadanga Paniya in the management of Jwara (AYU / IJRAP).',
    ],
  },
];

export function getKashaya(slug) {
  return KASHAYAS.find((k) => k.slug === slug);
}
