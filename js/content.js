// =====================================================================
//  content.js — MyFaceFate reading database (English edition)
//  Inspired by the three great classics of Chinese face reading (Mian Xiang 面相):
//   1) Ma Yi Shen Xiang (麻衣神相 / 麻衣相法) — Song dynasty. The root text that set up the
//      Five Officials, Three Zones and Twelve Palaces system.
//   2) Liu Zhuang Xiang Fa (柳莊相法) — Ming dynasty, by court face reader Yuan Gong and his son
//      Yuan Zhongche. Famous for reading "qi" — glow, expression and spirit.
//   3) Shen Xiang Quan Bian (神相全編) — Ming dynasty encyclopedia that gathered earlier texts and
//      sorted faces into the Five Elements (Wood, Fire, Earth, Metal, Water).
//  NOTE: Everything below is a modern, feel-good reinterpretation of those systems — not literal
//  quotations. Tone rules: always kind, never mock appearance, never reference race or ethnicity.
//  Every trait is described as a strength. For entertainment only.
// =====================================================================

export const BOOKS = [
  {
    id: "mayi",
    name: "Ma Yi Shen Xiang",
    hanja: "麻衣神相",
    era: "Song Dynasty · ~10th century",
    color: "#ff6f91",
    desc: "Legend says a hermit known only as \"Master Hemp Robe\" (Ma Yi) passed his secrets to the Taoist sage Chen Tuan in a mountain cave. The result became the backbone of face reading: the Five Officials, the Three Zones and the Twelve Palaces. Whenever you hear \"the nose is your wealth vault\" — it started here.",
    key: ["Five Officials", "Three Zones", "Twelve Palaces"],
  },
  {
    id: "liuzhuang",
    name: "Liu Zhuang Xiang Fa",
    hanja: "柳莊相法",
    era: "Ming Dynasty · ~15th century",
    color: "#2fc4b2",
    desc: "Written by Yuan Gong — the emperor's personal face reader — and his son. Instead of fixed features only, it reads the living face: glow, expression, posture and the spark in your eyes. Its big message is optimistic: your face changes with your habits, so your luck can change too.",
    key: ["Qi & Glow", "Spirit in the Eyes", "Real-life Readings"],
  },
  {
    id: "shenxiang",
    name: "Shen Xiang Quan Bian",
    hanja: "神相全編",
    era: "Ming Dynasty · ~16th century",
    color: "#f2b443",
    desc: "The \"Complete Encyclopedia of Face Reading.\" It collected the best of every earlier text and sorted faces into the Five Elements — Wood, Fire, Earth, Metal and Water — plus dozens of eye, nose, brow and lip types. For centuries it was the go-to textbook for face readers across East Asia.",
    key: ["Five Element Faces", "Feature Types", "The Big Picture"],
  },
];

// The Five Officials (五官)
export const FIVE_ORGANS = {
  ear: { name: "Ears", title: "The Listener · 採聽官", role: "Inborn blessings, luck in childhood and a long, healthy life" },
  brow: { name: "Brows", title: "The Guardian · 保壽官", role: "Emotions, friendships, siblings and your support circle" },
  eye: { name: "Eyes", title: "The Inspector · 監察官", role: "Windows to the soul — wisdom, intuition and judgment" },
  nose: { name: "Nose", title: "The Judge · 審辨官", role: "Your wealth vault — drive, confidence and money flow" },
  mouth: { name: "Mouth", title: "The Gatekeeper · 出納官", role: "Words and good food — charm, trust and generosity" },
};

// The Twelve Palaces (十二宮) — face map (x, y on a 0–100 SVG grid)
export const PALACES = [
  { id: "destiny", name: "Destiny", hanja: "命宮", place: "Between the brows", x: 50, y: 36, meaning: "The command center of your fate. A smooth, open space here means an open mind — things just seem to flow your way." },
  { id: "wealth", name: "Wealth", hanja: "財帛宮", place: "The nose (tip & wings)", x: 50, y: 57, meaning: "Your money vault. A rounded tip and full nostril wings are said to keep the money that comes in from slipping away." },
  { id: "siblings", name: "Friends", hanja: "兄弟宮", place: "The eyebrows", x: 30, y: 33, meaning: "Siblings, friends and coworkers. Neat, flowing brows mean lots of people in your corner." },
  { id: "property", name: "Home", hanja: "田宅宮", place: "Between brow and eye", x: 66, y: 36.5, meaning: "Home, property and family stability. A generous space here signals a relaxed, big-hearted nature." },
  { id: "children", name: "Family", hanja: "子女宮", place: "Under the eyes", x: 34, y: 47, below: true, meaning: "Children, playfulness and vitality. A soft, bright under-eye is linked to warm family luck and natural charm." },
  { id: "helpers", name: "Team", hanja: "奴僕宮", place: "Sides of the chin", x: 30, y: 84, meaning: "Your team, clients and supporters. A sturdy chin area means people love to follow your lead." },
  { id: "romance", name: "Romance", hanja: "夫妻宮", place: "Outer corners of the eyes", x: 80, y: 44, below: true, meaning: "Love and partnership. Smooth, glowing skin here points to a happy, harmonious love life." },
  { id: "health", name: "Health", hanja: "疾厄宮", place: "Bridge of the nose", x: 50, y: 44, meaning: "Energy and resilience. A smooth, unbroken nose bridge is said to mean fewer little health bumps." },
  { id: "travel", name: "Travel", hanja: "遷移宮", place: "Temples (forehead edges)", x: 20, y: 22, meaning: "Travel, relocation and luck abroad. Full temples mean opportunities find you far from home." },
  { id: "career", name: "Career", hanja: "官祿宮", place: "Center of the forehead", x: 50, y: 20, meaning: "Career, promotions and reputation. A clear, open center forehead is the classic 'gets noticed by the boss' sign." },
  { id: "fortune", name: "Blessings", hanja: "福德宮", place: "Above the brow tails", x: 78, y: 25, meaning: "Inborn good fortune and peace of mind. Fullness here means blessings that last a lifetime." },
  { id: "parents", name: "Parents", hanja: "父母宮", place: "Upper forehead corners", x: 38, y: 13, meaning: "Parents, mentors and elders. A bright upper forehead means support from the people above you." },
];

// Five Element face shapes — from Shen Xiang Quan Bian
export const FACE_SHAPES = {
  wood: { name: "Wood Face", alias: "The Visionary", emoji: "🌳", color: "#4caf7a",
    text: "Your long, elegant face is what the classics call a Wood face. Like a tree reaching for the sky, you're driven by big ideals and a love of learning and growing. You shine in anything that helps things grow — ideas, teams, students, projects — and you get more impressive with every passing year. A true late bloomer in the best possible way." },
  fire: { name: "Fire Face", alias: "The Spark", emoji: "🔥", color: "#ef5b5b",
    text: "A wide forehead and cheekbones that taper gracefully to the chin — that's a Fire face. Like a flame, your mind moves fast and your senses are sharp, so ideas and self-expression come naturally. Art, content, marketing, anything where being one step ahead matters — that's where Fire faces light up the room." },
  earth: { name: "Earth Face", alias: "The Rock", emoji: "⛰️", color: "#c7923e",
    text: "A full, grounded face with a solid, steady outline is an Earth face. You give off a deep, calm trust that naturally draws people — and resources — your way. Once you start something you see it through, which is why the classics link Earth faces with leadership, finance and building things that last." },
  metal: { name: "Metal Face", alias: "The Leader", emoji: "⚔️", color: "#8a94a6",
    text: "A defined, structured jawline makes this a Metal face. Like polished steel, you have clear principles and quick, decisive judgment — you come alive when you're in charge. Sports, law, leadership, any arena with clear rules and real stakes: that's where Metal faces earn their crown." },
  water: { name: "Water Face", alias: "The Charmer", emoji: "💧", color: "#4a8fe7",
    text: "Soft, rounded contours make this a Water face. Like water, you flow into any situation with warmth and flexibility — that's your superpower. People feel instantly at ease around you, so friends, fans and lucky breaks follow. Sales, hosting, media, anything people-facing is Water-face territory." },
  balance: { name: "Balanced Face", alias: "The All-Rounder", emoji: "🥚", color: "#a77bd9",
    text: "Your oval face has beautifully even proportions — in Five Element terms, no single element dominates. The classics prize balance above everything, and this is the face of someone who can be dropped into any situation and thrive. Adaptable, well-rounded and quietly impressive." },
};

// ---------------------------------------------------------------------
// Feature readings — chosen by measured level (hi / mid / lo).
// Every line is positive: "lo" is never bad, just a different strength.
// ---------------------------------------------------------------------
export const PART_READINGS = {
  forehead: {
    name: "Forehead", organ: "Career Palace · Youth Zone", emoji: "🌅",
    intro: "Face readers always look at the forehead first. It's the 'Heaven' zone — it holds the size of your thinking, your luck with mentors, and your fortune from about age 15 to 30.",
    outro: "The Parents, Career, Blessings and Travel palaces all live up here, which is why it's called 'the roof of your luck.' Tip from the classics: on big days, show a little forehead instead of hiding it under bangs — it's said to open the door to opportunity.",
    upper: {
      hi: "You have a wonderfully open, spacious forehead! In the classics this is the Upper Zone — the seat of early luck and wisdom. A forehead like this belongs to a quick thinker who gets noticed by mentors early. Your Career Palace is bright, so exams, interviews and anything where you're being evaluated is your stage.",
      mid: "Your forehead is perfectly proportioned — not too much, not too little. A balanced Upper Zone means a solid start in life and a great balance between thinking and doing. You're the 'smart but practical' type: not lost in dreams, not stuck in routine.",
      lo: "Your forehead is compact and neat. Face readers see this as the hands-on type — you learn by doing rather than overthinking. Luck often blooms in your 30s and beyond, so life tends to get better and better with time. The best chapters are still ahead.",
    },
  },
  brow: {
    name: "Eyebrows", organ: "The Guardian · Friends Palace", emoji: "〰️",
    intro: "Your brows are 'The Guardian' — they reveal your emotions, your energy, and the people standing beside you: siblings, friends and allies. They also govern your luck around age 31–34.",
    outro: "Fun fact: brows are the one feature you can actually reshape, so the classics call them the fastest way to change your luck. Keep them groomed and keep the space between them clean, and your people-luck gets a visible boost.",
    browLen: {
      hi: "Your brows sweep out longer than your eyes. The classics say brows that pass the eye mean loyal friends and helpful siblings — and it shows: you tend to have a big, supportive circle and a talent for connecting people.",
      mid: "Your brow length is a perfect match for your eyes. You're a natural at relationships — close without being clingy, independent without being distant.",
      lo: "Your brows are short and tidy. People with this look are independent trailblazers — you'd rather carve your own path than wait for help, and you make decisions fast and clean.",
    },
    browThick: {
      hi: "Your brows are full and strong. That signals powerful energy and real drive — once you commit to something, you finish it.",
      mid: "Your brows have just the right density — soft, but with definition.",
      lo: "Your brows are fine and delicate. That points to a sensitive, artistic soul who reads other people's moods with ease.",
    },
    browTilt: {
      hi: "Your brow tails lift upward — the classic 'sword brow.' It signals competitive spirit and decisiveness; you shine when the stakes are high.",
      mid: "Your brows sit level and steady, giving off calm, trustworthy energy.",
      lo: "Your brow tails curve gently down, giving you a kind, approachable look. You have the face people instantly want to talk to.",
    },
  },
  eye: {
    name: "Eyes", organ: "The Inspector · Window to the Soul", emoji: "👁️",
    intro: "Ancient face readers said: 'If the face is worth a thousand gold coins, the eyes are worth nine hundred.' Nothing matters more.",
    outro: "The classics actually valued the spirit in your eyes — their clarity and sparkle — even more than their shape. Good sleep and well-rested eyes are the easiest way to power up your Inspector.",
    eyeOpen: {
      hi: "Your eyes are big, bright and wide open! In the classics, the eyes are 'The Inspector,' where your spirit shows. Eyes like yours belong to someone honest, curious and expressive — the main character who lights up every room.",
      mid: "Your eyes are beautifully balanced in size and openness. Heart and head work together here — your judgment is sharp and people instinctively trust you.",
      lo: "You have elegant, elongated almond eyes — what the classics call 'phoenix eyes.' They signal depth, patience and razor-sharp observation. You don't reveal everything at once, which gives you an intriguing, magnetic mystery.",
    },
    eyeTilt: {
      hi: "Your outer eye corners lift slightly — a sharp, clever look. When you set a goal, your focus is unstoppable.",
      mid: "Your eye corners sit level, signaling a fair, balanced point of view.",
      lo: "Your eye corners soften gently downward, giving you a warm, kind look. Strangers open up to you within minutes.",
    },
    eyeGap: {
      hi: "Your eyes are set generously apart — a sign of an open heart and an easygoing, optimistic nature. Small stuff doesn't rattle you.",
      mid: "Your eye spacing is well balanced, combining focus with open-mindedness.",
      lo: "Your eyes are set closer together, a sign of laser focus and an eye for detail. Expert, craftsman, specialist energy.",
    },
  },
  nose: {
    name: "Nose", organ: "The Judge · Wealth Palace", emoji: "👃",
    intro: "Your nose stands in the very center of your face. It's 'The Judge' among the Five Officials and the Wealth Palace among the Twelve — the key to your prime years (about 41–50), your confidence and your drive.",
    outro: "In face reading, the glow of the nose matters as much as its shape. A clear, softly glowing nose tip is said to be a sign money is on its way — so a little skincare here is basically a wealth ritual.",
    noseWidth: {
      hi: "Your nose has full, generous wings! The nose is the Wealth Palace — your money vault — and the nostril wings are its doors. Sturdy doors mean money that comes in tends to stay. Classic 'money-magnet nose.'",
      mid: "Your nose is in perfect proportion with your face — a great sense of balance between earning and spending. Steady, sustainable wealth luck.",
      lo: "Your nose is sleek and refined. It signals great taste and a tidy mind — you're motivated by meaning and quality more than money, and you grow your worth through expertise.",
    },
    noseLen: {
      hi: "Your nose bridge is long and graceful — a sign of pride, responsibility and a strong Middle Zone. You're the one people trust to get it done.",
      mid: "Your nose length anchors your Middle Zone nicely, pointing to stable, steady prime years.",
      lo: "Your nose is short and cute, which signals friendliness and quick reflexes. You adapt to change faster than anyone.",
    },
  },
  mouth: {
    name: "Mouth & Lips", organ: "The Gatekeeper · Food & Fortune", emoji: "👄",
    intro: "Your mouth is 'The Gatekeeper' — the door for words and food. It holds your luck with good food and abundance, your charm and credibility, and your fortune around age 60.",
    outro: "The mouth changes more with expression than any other feature, so face readers say 'one smile can change a life.' Ten seconds of smiling in the mirror every day is said to stack up your Gatekeeper's blessings.",
    mouthWidth: {
      hi: "You have a wide, generous mouth! As 'The Gatekeeper,' a big mouth means big-hearted confidence and words that carry weight — natural leader energy. The old saying goes: 'A big mouth eats well' — so good food and good fortune follow you.",
      mid: "Your mouth is in harmony with your face — your words match your actions. You say exactly what needs to be said, and people trust you for it.",
      lo: "Your mouth is petite and neat. You choose your words carefully, so every word lands with weight. You're a great secret-keeper — people trust you deeply.",
    },
    mouthCorner: {
      hi: "Your mouth corners naturally turn up! This is the face reader's favorite — the 'crescent moon mouth.' The saying 'fortune comes to a smiling face' was written for you: it's a magnet for people and lucky breaks.",
      mid: "Your mouth corners sit level and neat, giving a calm, reliable impression.",
      lo: "Your mouth corners rest in a calm, thoughtful line, giving you depth and presence. And the moment you smile, your whole face transforms — your secret weapon.",
    },
    lipThick: {
      hi: "Your lips are full, a sign of warmth and generous affection. You love big, so your love and family life glow.",
      mid: "Your lips are balanced — a great mix of heart and head.",
      lo: "Your lips are neat and defined, pointing to a clear, logical communicator. Persuasion and planning are your strengths.",
    },
  },
  lower: {
    name: "Chin & Jaw", organ: "Team Palace · Legacy Zone", emoji: "🗿",
    intro: "From under the nose to the tip of the chin is the 'Earth' zone — the foundation of your life. It holds your later-life luck, vitality, family and the people who support you. The groove above your lip is the 'river of life,' and your chin is the 'ground' you stand on.",
    outro: "The Legacy Zone becomes more important with every year. Unclench your jaw, keep good posture and hold your chin up — the classics say it builds a solid foundation for the decades ahead.",
    philtrum: {
      hi: "The groove above your lip is long and clearly defined. The classics read this as a sign of vitality, longevity and a peaceful, happy later life.",
      mid: "Your lip groove is nicely balanced, pointing to a healthy rhythm in daily life.",
      lo: "Your lip groove is on the shorter side — a young heart and quick moves. You're the type who looks younger than your age for a long, long time.",
    },
    chinLen: {
      hi: "Your chin is long and strong. The chin is the 'ground' of the Legacy Zone — a sign of grit, endurance and a comfortable later life.",
      mid: "Your chin finishes your face with a stable, balanced line.",
      lo: "Your chin is neat and refined, giving you a stylish, modern look. You stay young at heart and on-trend for life.",
    },
    jawWidth: {
      hi: "Your jawline is strong and broad. Your Team Palace is well developed — people want to follow you, and you have real power to lead a group.",
      mid: "Your jawline is balanced — the perfect mix of soft and strong.",
      lo: "Your jawline is sleek and sculpted, signaling sensitivity and style. Strong solo-creator, freelancer and artist energy.",
    },
  },
};

// Ears (The Listener) — hard to see in a front photo, so the user can pick (optional)
export const EAR_TYPES = {
  auto: { label: "Auto (estimate from my face)", score: 0 },
  big: { label: "Large & full", score: 1.2,
    text: "Large, full ears mean a strong 'Listener.' The ears show the blessings you were born with — big, sturdy ears are linked to a lucky childhood and a long, healthy life." },
  lobe: { label: "Fleshy earlobes", score: 1.5,
    text: "Full, fleshy earlobes are the famous 'fortune ears' — think of classic Buddha statues. Face readers rank them the #1 sign of lasting wealth and good karma all the way into later life." },
  high: { label: "Set high (above the brows)", score: 1.0,
    text: "When the top of the ear sits higher than the eyebrows, it's read as a sign of brilliance and early success. Great luck with studies and exams." },
  small: { label: "Small & neat", score: 0.4,
    text: "Small, neat ears signal a detail-oriented, decisive person with a strong sense of self — you don't get swayed by other people's opinions." },
  out: { label: "Visible from the front", score: 0.6,
    text: "Ears you can clearly see from the front point to an independent, pioneering spirit — you often succeed on paths nobody else dared to take." },
};

// ---------------------------------------------------------------------
// The 10 lucks — which measurements feed each one (weights)
// ---------------------------------------------------------------------
export const FORTUNES = [
  { id: "wealth", name: "Money Luck", short: "Money", emoji: "💰", color: "#f2b705",
    weights: { noseWidth: 1.4, noseLen: 0.6, mouthWidth: 0.7, lower: 0.6, chinLen: 0.4, ear: 1.0 },
    classic: "Ma Yi Shen Xiang calls the nose the Wealth Palace, and the two nostril wings the 'twin pillars' of the treasury. A straight nose with sturdy wings means money comes in — and stays.",
    tip: "Keep your wallet clean (no receipt clutter!) and keep your nose tip shine-free. In face reading, a clear, gentle glow on the nose tip is a sign money is on its way.",
  },
  { id: "love", name: "Love Luck", short: "Love", emoji: "💘", color: "#ff5c8a",
    weights: { eyeOpen: 1.0, eyeTilt: -0.4, lipThick: 1.0, mouthCorner: 1.0, smile: 1.2, eyeGap: 0.3 },
    classic: "Liu Zhuang Xiang Fa reads romance from the soft area under the eyes and the glow at the outer eye corners — the Romance Palace. Someone whose eyes and mouth smile together is said to have 'clear peach-blossom luck,' the classic sign of attraction.",
    tip: "Keep the outer corners of your eyes (your Romance Palace) bright with a good eye cream. In photos, lifting your mouth corners just a couple of millimeters changes everything.",
  },
  { id: "marriage", name: "Marriage & Partnership", short: "Marriage", emoji: "💍", color: "#e86fa8",
    weights: { mouthCorner: 1.0, lipThick: 0.8, glabella: 0.7, smile: 0.8, symmetry: 0.6, chinLen: 0.6, jawWidth: 0.5, philtrum: 0.5 },
    classic: "Ma Yi Shen Xiang reads partnership at the outer corners of the eyes — the Romance Palace. When this area is full and glowing, the match is harmonious; upturned mouth corners and a rounded chin mean a home that stays happy for decades. Shen Xiang Quan Bian adds that an open space between the brows means fewer arguments.",
    tip: "Keep the outer corners of your eyes (your Romance Palace) moisturized, and make time to look each other in the eye and laugh. There's an old saying that happy couples start to look alike — a shared smile is the best luck ritual there is.",
  },
  { id: "career", name: "Career & Exams", short: "Career", emoji: "🎓", color: "#4a8fe7",
    weights: { upper: 1.3, browLen: 0.8, browEye: 0.6, eyeTilt: 0.5, symmetry: 0.6, glabella: 0.4 },
    classic: "Shen Xiang Quan Bian calls the center of the forehead the Career Palace. A bright, open forehead with neat brows means 'your name rises early.'",
    tip: "On interview or exam day, sweep your hair back a little to show your forehead (Career Palace). In face reading, an uncovered forehead means you're not blocking your own opportunities.",
  },
  { id: "study", name: "Study & Smarts", short: "Study", emoji: "📚", color: "#5b8def",
    weights: { upper: 1.3, eyeOpen: 0.6, browLen: 0.6, eyeTilt: 0.5, glabella: 0.5, browEye: 0.4, symmetry: 0.4, ear: 0.6 },
    classic: "The old face-reading texts even had a special name for the 'Halls of Learning' on the face. A broad, bright forehead means quick understanding, clear eyes mean a sharp mind, and neat brows mean staying power. Shen Xiang Quan Bian says ears set higher than the brows bring early fame through learning.",
    tip: "When you study, sweep your hair back and show your forehead — in face reading, an open forehead 'opens the door to wisdom.' And clear eyes mean a clear head: a good night's sleep beats an all-nighter every time.",
  },
  { id: "health", name: "Health & Vitality", short: "Health", emoji: "🌿", color: "#3fb97a",
    weights: { symmetry: 1.2, glabella: 0.6, noseLen: 0.5, philtrum: 0.9, balance: 1.2 },
    classic: "Ma Yi Shen Xiang reads health at the bridge of the nose (the Health Palace) and says a long, clear groove above the lip points to long life. When the Three Zones are balanced, life runs smoothly.",
    tip: "If you tend to frown, consciously relax the space between your brows. A smooth brow is said to keep your energy flowing. And sleep — the best luck ritual there is.",
  },
  { id: "business", name: "Boss Energy", short: "Business", emoji: "🚀", color: "#ff7a3d",
    weights: { jawWidth: 1.2, noseWidth: 0.8, browThick: 0.8, browTilt: 0.5, mouthWidth: 0.7, noseLen: 0.4 },
    classic: "Liu Zhuang Xiang Fa says when the cheekbones and nose support each other, it's 'the face that holds power' — and a full Team Palace at the sides of the chin means many followers and big ventures.",
    tip: "Before an important meeting, define your brow line. Brows are the symbol of willpower, so crisp brows read as decisive and in control.",
  },
  { id: "honor", name: "Fame & Recognition", short: "Fame", emoji: "👑", color: "#a77bd9",
    weights: { upper: 1.0, noseLen: 0.8, browLen: 0.6, glabella: 0.6, eyeTilt: 0.5, symmetry: 0.4 },
    classic: "Shen Xiang Quan Bian says when forehead, nose and chin line up in balance, 'the Three Zones are upright' — the face of someone whose name will be known. An open Destiny Palace means powerful helpers lift you up.",
    tip: "Keep the space between your brows (Destiny Palace) clean and groomed. Standing tall changes your 'qi' instantly — posture is the easiest fame hack there is.",
  },
  { id: "children", name: "Family Luck", short: "Family", emoji: "🏡", color: "#ff9fb5",
    weights: { philtrum: 1.3, lipThick: 0.7, chinLen: 0.6, lower: 0.6, eyeOpen: 0.4 },
    classic: "Ma Yi Shen Xiang calls the soft area under the eyes the Children Palace and says a deep lip groove and full lower face mean a thriving family. A round, full chin is the sign of a happy home.",
    tip: "Brighten under-eye shadows with a little concealer to light up your Family Palace. Laughing together with the people you love is said to make it glow even more.",
  },
  { id: "people", name: "Social Luck", short: "Social", emoji: "🤝", color: "#20b2c9",
    weights: { mouthCorner: 1.1, smile: 1.0, eyeGap: 0.6, glabella: 0.6, browLen: 0.7, jawWidth: 0.4 },
    classic: "Shen Xiang Quan Bian calls the brows the Friends Palace — the luck of companions and colleagues — and says an upturned 'crescent moon mouth' is the mouth that calls people in.",
    tip: "Try the 'eyebrow flash': lift your brows slightly as you smile hello. It's the fastest way to say 'great to see you' without a word.",
  },
];

// Fortune lines per measurement (hi: measurement is high, lo: low)
export const FORTUNE_LINES = {
  wealth: {
    noseWidth: { hi: "Your full nostril wings give you a rare talent for holding on to money. Real wealth isn't about earning big — it's about not leaking it, and you've got that covered.", lo: "Your sleek nose belongs to someone who grows money by moving it, not hoarding it. Sharp instincts and good information are how you catch opportunities." },
    noseLen: { hi: "Your long nose bridge shows wealth that builds steadily, especially from your 40s onward.", lo: "Your compact nose signals 'perfect timing' money luck — you grab opportunities the moment they appear." },
    mouthWidth: { hi: "Your generous mouth brings double luck: good food and good money flow in together.", lo: "Your neat mouth shows a smart, mindful spender with real money-management skills." },
    lower: { hi: "Your strong lower face means your vault fills up more and more over time — the classic 'late-game comeback' wealth luck.", lo: "Your refined lower face means money follows your hustle — the more you move while you're young, the more it flows." },
    chinLen: { hi: "Your strong chin is great at protecting what you've built for the long haul.", lo: "Your refined chin points to making money by reading trends before everyone else." },
    ear: { hi: "Add your ear shape, and it's a clear sign your 'blessings bowl' is a big one.", lo: "" },
  },
  love: {
    eyeOpen: { hi: "Your big, clear eyes show your feelings honestly — they make people think, 'This person is for real.'", lo: "Your deep almond eyes have a mysterious pull — the more people get to know you, the harder they fall. Total slow-burn energy." },
    eyeTilt: { hi: "Your lifted eye corners give you a confident, captivating 'cat-eye' charm that turns heads at first glance.", lo: "Your soft eye corners give you that warm 'puppy-eye' charm. In love, making someone feel this comfortable is the ultimate weapon." },
    lipThick: { hi: "Full lips are a sign of a generous, affectionate heart — you give love freely and get plenty back.", lo: "Defined lips mean every word you say in love counts. You don't love lightly — when you commit, it's deep and lasting." },
    mouthCorner: { hi: "Your upturned mouth corners make you look like you're smiling even at rest — and the classics say love finds faces like that.", lo: "Your calm mouth gives a serious first impression, but the moment you smile, the charm explodes. Smile often!" },
    smile: { hi: "Your smile in this photo is radiant! Liu Zhuang Xiang Fa says a face where the eyes and mouth smile together has the best romance luck of all.", lo: "" },
    eyeGap: { hi: "Your generously spaced eyes make you a relaxed partner who gives the other person room to breathe.", lo: "Your closer-set eyes signal a devoted, one-and-only kind of love." },
  },
  marriage: {
    mouthCorner: { hi: "Your upturned 'crescent moon mouth' means a home that's always full of laughter — you bring light to your partner's day.", lo: "Your calm mouth shows quiet, steady love — you show it more in actions than words. A few more 'I love you's and your partnership glows even warmer." },
    lipThick: { hi: "Your full lips show a warm, caring partner who makes the people they live with genuinely happy.", lo: "Your defined lips mark a partner who keeps their promises — loyal, steady and in it for the long run." },
    glabella: { hi: "The open space between your brows shows a big heart that doesn't hold grudges — the classics say people like you argue less with their partner.", lo: "Your neat brow space shows a partner who notices the little things. Talk things through right away instead of letting them build, and your bond only gets stronger." },
    smile: { hi: "Your bright smile is like a lamp in the home — it lights up everyone around you.", lo: "" },
    symmetry: { hi: "Your beautifully balanced face signals emotional steadiness — the foundation of a calm, comfortable partnership.", lo: "" },
    chinLen: { hi: "Your strong chin points to a partnership that lasts into old age and grows deeper every year.", lo: "Your refined chin shows a love of new experiences — you keep the spark alive for a long, long time." },
    jawWidth: { hi: "Your strong jawline marks the dependable heart of the home — the person your partner leans on.", lo: "Your sleek jawline points to a best-friends kind of partnership: playful, affectionate and easygoing." },
    philtrum: { hi: "Your defined lip groove shows deep family roots — the sign of a warm, happy household.", lo: "" },
  },
  study: {
    upper: { hi: "Your broad, bright forehead is the classic 'quick-study forehead' — you pick things up the first time you hear them.", lo: "Your compact forehead means you learn best by doing. The more practice problems you tackle, the faster you level up." },
    eyeOpen: { hi: "Your big, clear eyes show natural curiosity — the eyes of a student who digs until they understand.", lo: "Your deep almond eyes show calm, long-haul focus. You shine in deep, serious study." },
    browLen: { hi: "Your long brows attract great teachers, mentors and study buddies.", lo: "Your neat brows mark a self-starter who plans the work and works the plan." },
    eyeTilt: { hi: "Your lifted eye corners show focus that sharpens as exam day gets closer.", lo: "Your gentle eyes show patient, step-by-step learning — great for long courses and big goals." },
    glabella: { hi: "Your open Destiny Palace means understanding flows easily — even tough problems feel manageable.", lo: "Your neat brow space signals precise, careful thinking — fewer silly mistakes." },
    browEye: { hi: "The generous space between your brows and eyes means a calm mind — you stay cool in the exam room.", lo: "The close space between your brows and eyes shows intense focus — you're great at last-minute cramming." },
    symmetry: { hi: "Your balanced face is read as an orderly mind — strong at logic, math and structured subjects.", lo: "" },
    ear: { hi: "Your strong ear energy makes you a great listener — you get a lot out of classes and lectures.", lo: "" },
  },
  career: {
    upper: { hi: "Your open forehead (Career Palace) makes you shine whenever you're being evaluated. In exams and interviews you show more than you prepared.", lo: "Your compact forehead comes with real-world skills. You shine in the field, in practice and in action — not just on paper." },
    browLen: { hi: "Your long brows attract mentors and seniors who want to help — referrals and connections open great doors for you.", lo: "Your neat brows show someone who proves themselves through pure skill. Let your portfolio do the talking." },
    browEye: { hi: "The generous space between your brows and eyes gives you a relaxed, open look — interviewers think, 'I want to work with this person.'", lo: "The close space between your brows and eyes signals intense focus. You deliver results fast under pressure." },
    eyeTilt: { hi: "Your sharp, lifted eye shape reads as 'this person gets things done.'", lo: "Your gentle eyes build trust — you come across as a great teammate." },
    symmetry: { hi: "Your beautifully balanced face gives off stability and trust from the very first impression.", lo: "" },
    glabella: { hi: "Your open Destiny Palace means paths open without roadblocks.", lo: "The neat space between your brows points to careful, thorough judgment." },
  },
  health: {
    symmetry: { hi: "Your face is beautifully balanced left to right — read as a sign of steady, well-flowing energy.", lo: "" },
    glabella: { hi: "Your open brow space shows someone who lets stress go instead of holding on to it.", lo: "When you're overthinking, tension can settle in your neck and shoulders — make stretching a daily habit." },
    noseLen: { hi: "Your long, smooth nose bridge means a strong Health Palace.", lo: "Your compact nose comes with quick recovery. Rest well and you bounce right back." },
    philtrum: { hi: "Your long, defined lip groove is close to what the classics call 'the longevity sign.'", lo: "You tend to spend your energy in big bursts — regular meals are your secret luck key." },
    balance: { hi: "Your Three Zones — forehead, nose, chin — are beautifully even. The classics treasure this: 'balanced zones, a smooth life.'", lo: "One of your Three Zones stands out, giving your face real character. Lean into that strength and keep a steady daily rhythm." },
  },
  business: {
    jawWidth: { hi: "Your strong jawline shows a well-developed Team Palace — classic CEO face with loyal staff and partners.", lo: "Your sleek jawline thrives in light, fast business models — solo founder, creator, freelancer." },
    noseWidth: { hi: "Your sturdy nose keeps business cash from leaking out — great cash-flow instincts.", lo: "Your refined nose suits businesses built on ideas and brand rather than big capital." },
    browThick: { hi: "Your strong brows show serious drive and guts. When others hesitate, you move first.", lo: "Your fine brows read customers' feelings and details — perfect for service, design and lifestyle brands." },
    browTilt: { hi: "Your lifted 'sword brows' mean you don't back down when it counts.", lo: "Your soft brows put people at ease — a secret weapon at the negotiating table." },
    mouthWidth: { hi: "Your generous mouth gives your words power — great for sales, pitching and fundraising.", lo: "Your neat mouth is the mark of a founder who keeps their word." },
    noseLen: { hi: "Your long nose bridge shows the stamina to carry long-term projects to the finish line.", lo: "" },
  },
  honor: {
    upper: { hi: "Your open forehead lights up your Career Palace — your name gets known early in any organization.", lo: "Your compact forehead means recognition earned through skill — and it lasts." },
    noseLen: { hi: "Your straight, graceful nose shows pride and dignity — the classics call it 'the nose that makes a name.'", lo: "Your friendly nose attracts popularity and broad likability." },
    browLen: { hi: "Your long brows help your reputation travel far.", lo: "" },
    glabella: { hi: "Your open Destiny Palace means powerful helpers lift your name higher.", lo: "" },
    eyeTilt: { hi: "Your lifted eye corners show ambition and purpose — you keep climbing.", lo: "" },
    symmetry: { hi: "Your balanced face reads as fair and trustworthy — real leader energy.", lo: "" },
  },
  children: {
    philtrum: { hi: "Your long, defined lip groove points to a thriving, healthy family and deep bonds with kids.", lo: "Your short lip groove means a forever-young heart — the kind of parent, aunt or uncle who's also a best friend." },
    lipThick: { hi: "Your full lips show a warm heart that holds the whole family close.", lo: "Your defined lips suggest someone who raises kids with clear, loving structure." },
    chinLen: { hi: "Your strong chin is read as a sign of a close, caring family in later life.", lo: "Your refined chin points to the stylish, fun one in the family that everyone looks up to." },
    lower: { hi: "Your full lower face points to a happy home that's always full of laughter.", lo: "" },
    eyeOpen: { hi: "Your bright, clear eyes add sparkle to your Family Palace.", lo: "" },
  },
  people: {
    mouthCorner: { hi: "Your upturned 'crescent moon mouth' draws people in even when you're not trying.", lo: "Your calm mouth earns trust — you're the friend people keep for life." },
    smile: { hi: "Your bright smile is a people magnet. Just looking at your photo puts people in a good mood.", lo: "" },
    eyeGap: { hi: "Your generously spaced eyes show an open, accepting heart.", lo: "Your closer-set eyes mean you look after each friend deeply — loyal to the core." },
    glabella: { hi: "Your open brow space shows a big heart that doesn't hold grudges.", lo: "Your neat brow space comes with thoughtful, considerate care for others." },
    browLen: { hi: "Long brows mean a full Friends Palace — good friends by your side for life.", lo: "Neat brows mean a small, tight, ride-or-die inner circle." },
    jawWidth: { hi: "Your strong jawline brings 'leader luck' — lots of people look up to you.", lo: "" },
  },
};

// Glow-up tips (makeup & grooming) — matched to the feature you might want to enhance
export const MAKEUP_TIPS = {
  noseWidth: { lo: "Dab a little highlighter on the tip of your nose — it adds glow to your Wealth Palace and 'opens the vault door.'", hi: "A thin line of highlighter down the center of your nose bridge balances your features and adds an elegant, polished look." },
  noseLen: { lo: "A soft touch of contour at the top of your nose bridge makes it look longer and strengthens your 'prime years' pillar.", hi: "A little shading under the nose tip softens a long bridge and adds a friendly, approachable vibe." },
  mouthCorner: { lo: "Use lip liner to extend the outer corners up by 1–2 mm. It's the easiest way to create the lucky 'crescent moon mouth'!", hi: "Your upturned corners are already your best feature — just add a clear gloss for a fresh glow." },
  lipThick: { lo: "Add a brighter shade just to the center of your lips and blend outward — instantly fuller, warmer, more charming.", hi: "A 'your-lips-but-better' shade with softly blurred edges makes full lips look even more chic." },
  browLen: { lo: "Extend your brow tails just past the outer corner of your eyes. It widens your Friends Palace — hello, more good people!", hi: "Long brows only need their tails tidied. A little brow gel to brush hairs up makes them look crisp." },
  browThick: { lo: "Fill in sparse areas with fine, hair-like pencil strokes to project willpower and drive.", hi: "Tidy just the underside of strong brows and brush them up with clear gel — power becomes polish." },
  browTilt: { lo: "Lift the arch of your brows slightly for a more decisive, confident look.", hi: "Draw your brow tails a touch flatter to soften a strong look and boost approachability." },
  eyeOpen: { lo: "Curl your lashes at the root and add a little brown shadow to your outer lower lash line — your Inspector opens right up.", hi: "Big eyes only need a thin liner. A touch of shimmer just under the eye boosts your Family and Love palaces." },
  eyeTilt: { lo: "Flick your liner slightly upward at the outer corner for a sharp, clever look.", hi: "Keep your liner wing straight and add a little lower-lash shadow for a softer look." },
  glabella: { lo: "Tidy the inner start of your brows by 1–2 mm to open up your Destiny Palace. The classics say an open brow space keeps luck flowing.", hi: "Leave your open brow space as is — a touch of nose contour adds focus and definition." },
  upper: { lo: "Try a side part or a style that shows a bit of forehead to brighten your Career Palace.", hi: "Soft, wispy bangs or light hairline contour frames a spacious forehead beautifully." },
  jawWidth: { lo: "A little contour under the jawline adds definition and a confident edge.", hi: "Contour just at the jaw angles below the ears to make a strong jawline look sleek and sculpted." },
  smile: { lo: "In photos, smile with your eyes first instead of saying 'cheese.' The classics say real luck comes when your eyes smile.", hi: "Your bright smile is the ultimate glow-up! Add a little coral blush high on your cheeks for extra radiance." },
  philtrum: { lo: "Define your Cupid's bow with liner to make your lip groove look crisp and clear.", hi: "Slightly overline your upper lip to balance a long lip groove." },
  symmetry: { lo: "Try switching your hair part, or draw the lower brow slightly higher to balance both sides.", hi: "A balanced face looks best with natural, no-makeup makeup." },
};

export const METRIC_LABELS = {
  eyeSize: "Eye width", eyeOpen: "Eye openness", eyeTilt: "Eye-corner lift", eyeGap: "Eye spacing",
  browLen: "Brow length", browThick: "Brow fullness", browTilt: "Brow arch", browEye: "Brow-to-eye space",
  glabella: "Destiny Palace (brow gap)", noseWidth: "Nose fullness", noseLen: "Nose bridge length", mouthWidth: "Mouth width",
  mouthCorner: "Mouth-corner lift", lipThick: "Lip fullness", philtrum: "Lip groove length", chinLen: "Chin length",
  jawWidth: "Jawline width", faceRatio: "Face length", upper: "Upper zone (forehead)", middle: "Middle zone (brows–nose)",
  lower: "Lower zone (nose–chin)", symmetry: "Symmetry", smile: "Smile score",
};

// Short, friendly feature names used inside sentences
export const FEATURE_NAMES = {
  eyeOpen: "eyes", eyeTilt: "eye shape", eyeGap: "eye spacing", browLen: "brows", browThick: "brows",
  browTilt: "brow arch", browEye: "brow-to-eye space", glabella: "Destiny Palace", noseWidth: "nose",
  noseLen: "nose bridge", mouthWidth: "mouth", mouthCorner: "smile line", lipThick: "lips",
  philtrum: "lip groove", chinLen: "chin", jawWidth: "jawline", upper: "forehead", lower: "lower face",
  symmetry: "symmetry", smile: "smile",
};

// Opening hook lines — the first thing shown on the result
export const HOOKS = {
  wealth: ["Okay, that's not just a nose. That's a vault. 💰", "Your wallet recognized this face before you did!", "Money-magnet energy detected. 💸"],
  love: ["Those eyes… someone's heart is racing right now. 💘", "Let's be honest — you get a lot of attention, don't you?", "Certified heart-stealer face. 💞"],
  marriage: ["This face says 'happily ever after.' 💍", "Partner luck is written all over this face!", "Soulmate-magnet energy detected. 💞"],
  study: ["Big-brain energy, right on your forehead. 📚", "The kind of face every teacher loved having in class!", "Honor-roll vibes, no notes. 🧠"],
  career: ["The forehead interviewers dream about. 🎓", "This face was made for the corner office!", "'You're hired' energy, loud and clear. 💼"],
  health: ["Balance like this? Haven't seen it in a while. 🌿", "Main-character energy with a full health bar!", "Your face says 'built to last.' 💪"],
  business: ["That jawline is calling you 'Boss.' 🚀", "This face belongs on a founder's bio page!", "CEO energy. No notes. 👔"],
  honor: ["This face is going to be famous. 👑", "Everywhere you go, you're 'that person' people remember!", "Name in lights — the face agrees. ✨"],
  children: ["This face fills a home with laughter. 🏡", "Your Family Palace is absolutely glowing!", "Warmest-heart-in-the-room energy. 💗"],
  people: ["A face people are magnetically drawn to. 🤝", "Lucky helpers are lining up for this one!", "Everybody's favorite person — and the face shows it. 🌟"],
};

// ---------------------------------------------------------------------
// Gender & age personalization
// Ma Yi Shen Xiang's "Flowing Years" (流年運氣): as you age, your luck travels down the face.
//   15–30 forehead → 31–40 brows & eyes → 41–50 nose & cheekbones → 51–60 lip groove & mouth → 61+ chin
// ---------------------------------------------------------------------
export const GENDERS = { "": "Prefer not to say", f: "Female", m: "Male" };
const GENDER_NOUN = { f: "woman", m: "man" };
export const genderNoun = (g) => GENDER_NOUN[g] || "";

export const AGE_GROUPS = {
  "": { label: "Prefer not to say" },
  "20": { label: "Under 30", phrase: "under 30", stage: "early", career: "Exams & First Job", children: "Family Luck",
    place: "your forehead (Upper Zone)", keys: ["upper"], years: "ages 15–30",
    hi: "And your forehead — exactly where your luck is sitting right now — is broad and bright. This is the season of 'first steps' (studies, exams, your first real job), and mentors are lining up to help you.",
    lo: "Your forehead is compact, which means your luck opens up when you learn by doing rather than sitting at a desk. Internships, side gigs and travel are your luck boosters right now.",
    mid: "Your forehead is nicely balanced, so steady effort turns straight into results in this chapter of life." },
  "30": { label: "30s", phrase: "in your 30s", stage: "mid", career: "Career & Promotion", children: "Family Luck",
    place: "your brows and eyes", keys: ["browLen", "eyeOpen"], years: "ages 31–40",
    hi: "And your brows and eyes — where your luck lives right now — are wonderfully expressive. Your judgment of people and your network open up together, making this a great time to meet key colleagues, partners and co-founders.",
    lo: "Your brows and eyes are calm and composed, so you grow through deep trust rather than a huge network. Go deep in one field and by your late 30s you'll be the expert everyone calls.",
    mid: "Your brows and eyes are well balanced — perfect for juggling work and home life gracefully in this chapter." },
  "40": { label: "40s", phrase: "in your 40s", stage: "mid", career: "Career & Promotion", children: "Family Luck",
    place: "your nose and cheekbones", keys: ["noseLen", "noseWidth"], years: "ages 41–50",
    hi: "And your nose — the Wealth Palace, where your luck is right now — is strong! Face readers call the 40s 'the decade of the nose,' when money and status move the most. Your timing is perfect: this is your moment to go for it.",
    lo: "Your nose is sleek and refined, so your luck grows by strengthening what you already have rather than over-expanding. Tidy up spending and sharpen your expertise — the late 40s will reward you big.",
    mid: "Your nose anchors the center of your face well, pointing to steady flow in money and work during this chapter." },
  "50": { label: "50s", phrase: "in your 50s", stage: "late", career: "Purpose & Second Act", children: "Family & Legacy",
    place: "your lip groove and mouth", keys: ["philtrum", "mouthCorner"], years: "ages 51–60",
    hi: "And your lip groove and mouth — where your luck is right now — look fantastic. A defined groove and lifted mouth corners bring health, good food and the gift of bringing people together with a single word.",
    lo: "Your mouth rests in a calm line, giving your words real weight. Face readers say smiling more often lights up the 50s dramatically — so let that smile out!",
    mid: "Your lip groove and mouth are nicely balanced, pointing to a comfortable rhythm of life and a peaceful home." },
  "60": { label: "60+", phrase: "60 or better", stage: "late", career: "Purpose & Second Act", children: "Grandkids & Legacy",
    place: "your chin", keys: ["chinLen", "jawWidth"], years: "age 61 and beyond",
    hi: "And your chin — where your luck lives now — is full and strong. The chin is the 'ground' of later life, so this is the face of someone who enjoys the love of family and the respect of younger generations.",
    lo: "Your chin is neat and refined — you keep a young spirit for life. The more you keep learning and exploring new hobbies, the wider your luck becomes.",
    mid: "Your chin supports your face with a steady line, pointing to a healthy, peaceful chapter ahead." },
};

// One extra line per luck, by life stage (early: under 30, mid: 30s–40s, late: 50+)
export const AGE_LINES = {
  wealth: { early: "Right now it's less about big money and more about building your nest egg and smart money habits.", mid: "This is the time to grow what you've saved and build a solid base — home, investments, assets.", late: "Now is the time to protect what you've built and enjoy a comfortable, worry-free future." },
  love: { early: "New connections are flowing your way — say yes to more invitations.", mid: "Trust with the person beside you is your love luck now. Small gestures go a long way.", late: "Your bond with your partner and old friends shines brightest now. Take more walks together." },
  marriage: { early: "Your luck for meeting a lifelong partner is wide open. No need to rush — the right person is on the way.", mid: "This is the season of building a home together. Protect your one-on-one time, even when life is busy.", late: "Years of shared history are your greatest treasure now. Walking and laughing together is the best medicine." },
  career: { early: "Your luck is concentrated in 'being evaluated' moments — exams, interviews and your first job.", mid: "At big crossroads — promotions, job changes, going solo — your face's energy is on your side.", late: "Luck is open for sharing your experience, mentoring, and finding a meaningful second act." },
  study: { early: "Your luck is focused on building skills — tests, certifications, degrees. The effort you put in now pays off for life.", mid: "A great time to learn a new field or earn a professional credential — and to guide your kids' learning too.", late: "Your lifelong-learning luck is bright. Pick up a new hobby or class and stay young in mind and heart." },
  health: { early: "The sleep and exercise habits you build now are your health savings account for life.", mid: "The busier you are, the more you should look after your neck, shoulders and digestion. Don't skip check-ups.", late: "Daily walks and light strength training are your best luck boosters. Laughter is medicine." },
  business: { early: "'Start small, learn fast' is your winning business style right now.", mid: "People and capital are coming together — great timing for growth and partnerships.", late: "Steady ventures built on trust and experience suit you better than risky expansion." },
  honor: { early: "Chances to make a name for yourself come early — don't pass up the small ones.", mid: "Your name is rising in your field and community. Don't shy away from leadership roles.", late: "You're entering the season of the respected elder. Sharing your wisdom raises your name even higher." },
  children: { early: "Your future family luck is bright — great connections lead to a happy family.", mid: "Laughing together with your kids (or the kids in your life) makes your Family Palace glow.", late: "This is the face of someone who enjoys their family's success and the joy of grandkids." },
  people: { early: "You're meeting friends and mentors who'll be with you for life.", mid: "People you meet through work turn into your lucky helpers. Say hello first.", late: "Long-time friends are your strongest support now. Share the laughs at every get-together." },
};

// Grooming tips for men (same shape as MAKEUP_TIPS)
export const GROOMING_TIPS = {
  noseWidth: { lo: "Keep the skin around your nose clear of oil and flakes. A clean, clear nose tip is said to brighten your money luck.", hi: "Simple skincare around the nose makes a strong nose look even more distinguished." },
  noseLen: { lo: "Try a shorter fringe or a slightly lifted style to emphasize the vertical lines of your face — your nose looks longer and your 'prime years' pillar stands tall.", hi: "A little volume at the sides of your hair softens a long face and nose bridge." },
  mouthCorner: { lo: "Use a lip balm and practice a slight lift at the corners of your mouth. The lucky 'crescent moon mouth' can be built with expression!", hi: "Your upturned mouth corners are your best asset — just keep your lips from getting chapped." },
  lipThick: { lo: "A clear lip balm adds healthy shine and a warmer, friendlier impression.", hi: "Just keep your lips smooth and hydrated — full lips look healthy and trustworthy." },
  browLen: { lo: "Don't trim your brow tails — let them grow out. Brows longer than your eyes are said to bring more friend and family luck.", hi: "Long brows only need a few stray hairs tidied up." },
  browThick: { lo: "A brow serum or a light touch of brow pencil to fill gaps projects willpower and drive.", hi: "Tidy just the stray hairs under strong brows — rugged becomes refined." },
  browTilt: { lo: "Tidy the hairs under your brow arch to define it — instantly more decisive.", hi: "Trim a little above the brow tails to soften a strong look and boost approachability." },
  eyeOpen: { lo: "Get enough sleep and use a cold compress to reduce puffiness. Clear eyes 'open up' your Inspector.", hi: "Big eyes look full of energy once you take care of dark circles." },
  eyeTilt: { lo: "If you wear glasses, try frames that lift slightly at the outer edges for a sharp, confident look.", hi: "Rounder frames or a relaxed expression soften a sharp look into a warm one." },
  glabella: { lo: "Tidy the hair between your brows and try to break the frowning habit. An open Destiny Palace keeps luck flowing.", hi: "Leave your open brow space as is — just avoid frown lines." },
  upper: { lo: "Push your hair up or keep it short to show your forehead (Career Palace) — especially for interviews and big days.", hi: "A slightly lowered fringe softens a broad forehead and balances your features." },
  jawWidth: { lo: "A clean, close shave that shows your jawline adds a strong, confident edge.", hi: "Short sides with volume on top balance a strong jawline perfectly." },
  smile: { lo: "In photos, smile with your eyes first. The classics say real luck comes when your eyes smile.", hi: "Your bright smile is your best luck charm — good dental care makes it shine even more." },
  philtrum: { lo: "A clean shave above the lip makes your lip groove look crisp and healthy.", hi: "A defined lip groove shines with nothing more than a clean shave." },
  symmetry: { lo: "Try switching your hair part, or tidy the lower brow slightly to balance both sides.", hi: "A balanced face looks best with a clean haircut and a fresh shave." },
};
