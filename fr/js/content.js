// =====================================================================
//  content.js — Base de lectures MyFaceFate (édition française)
//  Inspirée des trois grands classiques de la lecture du visage chinoise (Mian Xiang 面相) :
//   1) Ma Yi Shen Xiang (麻衣神相) — dynastie Song. Le texte fondateur des Cinq Officiers,
//      des Trois Zones et des Douze Palais.
//   2) Liu Zhuang Xiang Fa (柳莊相法) — dynastie Ming, par Yuan Gong et son fils Yuan Zhongche.
//      Célèbre pour sa lecture du « qi » : éclat, expression et esprit.
//   3) Shen Xiang Quan Bian (神相全編) — encyclopédie Ming qui classe les visages selon les
//      Cinq Éléments (Bois, Feu, Terre, Métal, Eau).
//  Tout ceci est une réinterprétation moderne et positive, pas une citation littérale.
//  Règles de ton : toujours bienveillant, jamais de moquerie sur l'apparence, jamais de
//  référence à l'origine ethnique. Chaque trait est décrit comme une force. Divertissement uniquement.
// =====================================================================

export const BOOKS = [
  {
    id: "mayi",
    name: "Ma Yi Shen Xiang",
    hanja: "麻衣神相",
    era: "Dynastie Song · vers le Xe siècle",
    color: "#ff6f91",
    desc: "La légende raconte qu'un ermite connu seulement sous le nom de « Maître à la robe de chanvre » (Ma Yi) transmit ses secrets au sage taoïste Chen Tuan dans une grotte de montagne. C'est devenu la colonne vertébrale de la lecture du visage : les Cinq Officiers, les Trois Zones et les Douze Palais. Chaque fois que tu entends « le nez est ton coffre-fort », l'idée vient d'ici.",
    key: ["Cinq Officiers", "Trois Zones", "Douze Palais"],
  },
  {
    id: "liuzhuang",
    name: "Liu Zhuang Xiang Fa",
    hanja: "柳莊相法",
    era: "Dynastie Ming · vers le XVe siècle",
    color: "#2fc4b2",
    desc: "Écrit par Yuan Gong — le lecteur de visages personnel de l'empereur — et son fils. Au lieu de s'en tenir aux traits fixes, il lit le visage vivant : l'éclat, l'expression, la posture et l'étincelle dans les yeux. Son grand message est optimiste : ton visage change avec tes habitudes, donc ta chance peut changer aussi.",
    key: ["Qi et éclat", "L'esprit des yeux", "Lectures concrètes"],
  },
  {
    id: "shenxiang",
    name: "Shen Xiang Quan Bian",
    hanja: "神相全編",
    era: "Dynastie Ming · vers le XVIe siècle",
    color: "#f2b443",
    desc: "L'« Encyclopédie complète de la lecture du visage ». Elle a rassemblé le meilleur de tous les textes précédents et classé les visages selon les Cinq Éléments — Bois, Feu, Terre, Métal et Eau — avec des dizaines de types d'yeux, de nez, de sourcils et de lèvres. Pendant des siècles, ce fut le manuel de référence des lecteurs de visages dans toute l'Asie de l'Est.",
    key: ["Visages des Cinq Éléments", "Types de traits", "La vue d'ensemble"],
  },
];

// Les Cinq Officiers (五官)
export const FIVE_ORGANS = {
  ear: { name: "Oreilles", title: "L'Écoutant · 採聽官", role: "Bénédictions de naissance, chance dans l'enfance et longue vie en bonne santé" },
  brow: { name: "Sourcils", title: "Le Gardien · 保壽官", role: "Émotions, amitiés, frères et sœurs, et ton cercle de soutien" },
  eye: { name: "Yeux", title: "L'Inspecteur · 監察官", role: "Fenêtres de l'âme : sagesse, intuition et discernement" },
  nose: { name: "Nez", title: "Le Juge · 審辨官", role: "Ton coffre-fort : énergie, confiance et flux d'argent" },
  mouth: { name: "Bouche", title: "Le Portier · 出納官", role: "Paroles et bonne chère : charme, confiance et générosité" },
};

// Les Douze Palais (十二宮) — carte du visage (x, y sur une grille SVG de 0 à 100)
export const PALACES = [
  { id: "destiny", name: "Destin", hanja: "命宮", place: "Entre les sourcils", x: 50, y: 36, meaning: "Le centre de commande de ton destin. Un espace lisse et dégagé ici signifie un esprit ouvert : les choses semblent couler dans ton sens." },
  { id: "wealth", name: "Richesse", hanja: "財帛宮", place: "Le nez (pointe et ailes)", x: 50, y: 57, meaning: "Ton coffre-fort. On dit qu'une pointe arrondie et des ailes pleines empêchent l'argent qui entre de s'échapper." },
  { id: "siblings", name: "Amis", hanja: "兄弟宮", place: "Les sourcils", x: 30, y: 33, meaning: "Frères et sœurs, amis et collègues. Des sourcils nets et fluides signifient beaucoup de monde dans ton camp." },
  { id: "property", name: "Foyer", hanja: "田宅宮", place: "Entre le sourcil et l'œil", x: 66, y: 36.5, meaning: "Maison, biens et stabilité familiale. Un espace généreux ici révèle une nature détendue et un grand cœur." },
  { id: "children", name: "Famille", hanja: "子女宮", place: "Sous les yeux", x: 34, y: 47, below: true, meaning: "Enfants, espièglerie et vitalité. Une zone douce et lumineuse sous les yeux est associée à une chaleureuse chance familiale et à un charme naturel." },
  { id: "helpers", name: "Équipe", hanja: "奴僕宮", place: "Les côtés du menton", x: 30, y: 84, meaning: "Ton équipe, tes clients et tes soutiens. Une zone solide autour du menton signifie que les gens aiment te suivre." },
  { id: "romance", name: "Amour", hanja: "夫妻宮", place: "Coin externe des yeux", x: 80, y: 44, below: true, meaning: "Amour et couple. Une peau lisse et lumineuse ici annonce une vie amoureuse heureuse et harmonieuse." },
  { id: "health", name: "Santé", hanja: "疾厄宮", place: "Arête du nez", x: 50, y: 44, meaning: "Énergie et résistance. On dit qu'une arête nasale lisse et continue signifie moins de petits soucis de santé." },
  { id: "travel", name: "Voyages", hanja: "遷移宮", place: "Tempes (bords du front)", x: 20, y: 22, meaning: "Voyages, déménagements et chance à l'étranger. Des tempes pleines signifient que les occasions te trouvent loin de chez toi." },
  { id: "career", name: "Carrière", hanja: "官祿宮", place: "Centre du front", x: 50, y: 20, meaning: "Carrière, promotions et réputation. Un centre du front clair et dégagé est le signe classique de « celui ou celle que le patron remarque »." },
  { id: "fortune", name: "Bénédictions", hanja: "福德宮", place: "Au-dessus de la queue du sourcil", x: 78, y: 25, meaning: "Bonne fortune innée et paix intérieure. Une plénitude ici signifie des bénédictions pour toute la vie." },
  { id: "parents", name: "Parents", hanja: "父母宮", place: "Coins supérieurs du front", x: 38, y: 13, meaning: "Parents, mentors et aînés. Un haut du front lumineux signifie le soutien de ceux qui sont au-dessus de toi." },
];

// Formes de visage des Cinq Éléments — d'après le Shen Xiang Quan Bian
export const FACE_SHAPES = {
  wood: { name: "Visage Bois", alias: "Le Visionnaire", emoji: "🌳", color: "#4caf7a",
    text: "Ton visage long et élégant est ce que les classiques appellent un visage Bois. Comme un arbre qui pousse vers le ciel, tu es porté par de grands idéaux et l'amour d'apprendre et de grandir. Tu brilles dans tout ce qui aide quelque chose à pousser — idées, équipes, élèves, projets — et tu deviens plus impressionnant d'année en année. Un vrai « talent tardif », dans le meilleur sens du terme." },
  fire: { name: "Visage Feu", alias: "L'Étincelle", emoji: "🔥", color: "#ef5b5b",
    text: "Un front et des pommettes larges qui s'affinent avec grâce vers le menton : c'est un visage Feu. Comme une flamme, ton esprit va vite et tes sens sont aiguisés, alors les idées et l'expression de soi te viennent naturellement. Art, contenu, marketing, tout ce qui demande d'avoir un coup d'avance : c'est là que les visages Feu illuminent la pièce." },
  earth: { name: "Visage Terre", alias: "Le Roc", emoji: "⛰️", color: "#c7923e",
    text: "Un visage plein et ancré, au contour solide et stable, est un visage Terre. Tu dégages une confiance profonde et calme qui attire naturellement les gens — et les ressources — vers toi. Quand tu commences quelque chose, tu vas au bout ; c'est pourquoi les classiques associent les visages Terre au leadership, à la finance et aux constructions durables." },
  metal: { name: "Visage Métal", alias: "Le Leader", emoji: "⚔️", color: "#8a94a6",
    text: "Une mâchoire définie et structurée fait de ce visage un visage Métal. Comme l'acier poli, tu as des principes clairs et un jugement rapide et décidé : tu prends vie quand tu es aux commandes. Sport, droit, direction, tout terrain aux règles claires et aux vrais enjeux : c'est là que les visages Métal gagnent leur couronne." },
  water: { name: "Visage Eau", alias: "Le Charmeur", emoji: "💧", color: "#4a8fe7",
    text: "Des contours doux et arrondis font de ce visage un visage Eau. Comme l'eau, tu t'adaptes à chaque situation avec chaleur et souplesse : c'est ton super-pouvoir. Les gens se sentent tout de suite à l'aise avec toi, alors amis, fans et coups de chance suivent. Vente, animation, médias, tout ce qui se fait au contact des gens est le territoire des visages Eau." },
  balance: { name: "Visage Équilibré", alias: "Le Polyvalent", emoji: "🥚", color: "#a77bd9",
    text: "Ton visage ovale a des proportions merveilleusement harmonieuses : en termes de Cinq Éléments, aucun élément ne domine. Les classiques placent l'équilibre au-dessus de tout, et c'est le visage de quelqu'un qu'on peut plonger dans n'importe quelle situation et qui s'épanouit. Adaptable, complet et discrètement impressionnant." },
};

// ---------------------------------------------------------------------
// Lectures par trait — choisies selon le niveau mesuré (hi / mid / lo).
// Chaque phrase est positive : « lo » n'est jamais mauvais, juste une autre force.
// ---------------------------------------------------------------------
export const PART_READINGS = {
  forehead: {
    name: "Front", organ: "Palais de la Carrière · Zone de la jeunesse", emoji: "🌅",
    intro: "Les lecteurs de visages regardent toujours le front en premier. C'est la zone du « Ciel » : elle contient l'ampleur de ta pensée, ta chance avec les mentors et ta fortune entre 15 et 30 ans environ.",
    outro: "Les palais des Parents, de la Carrière, des Bénédictions et des Voyages vivent tous ici, d'où son surnom de « toit de ta chance ». Conseil des classiques : les grands jours, montre un peu ton front au lieu de le cacher sous une frange ; on dit que cela ouvre la porte aux opportunités.",
    upper: {
      hi: "Tu as un front merveilleusement ouvert et spacieux ! Dans les classiques, c'est la Zone supérieure, siège de la chance précoce et de la sagesse. Un tel front appartient à un esprit vif que les mentors remarquent tôt. Ton Palais de la Carrière rayonne : examens, entretiens, tout ce qui implique d'être évalué est ta scène.",
      mid: "Ton front est parfaitement proportionné, ni trop ni trop peu. Une Zone supérieure équilibrée signifie un bon départ dans la vie et un bel équilibre entre réflexion et action. Tu es du genre « intelligent mais pratique » : ni perdu dans les rêves, ni coincé dans la routine.",
      lo: "Ton front est compact et net. Les lecteurs de visages y voient une personne concrète : tu apprends en faisant plutôt qu'en réfléchissant trop. La chance fleurit souvent après 30 ans, alors la vie a tendance à s'améliorer avec le temps. Les meilleurs chapitres sont encore à venir.",
    },
  },
  brow: {
    name: "Sourcils", organ: "Le Gardien · Palais des Amis", emoji: "〰️",
    intro: "Tes sourcils sont « le Gardien » : ils révèlent tes émotions, ton énergie et les personnes à tes côtés — frères et sœurs, amis et alliés. Ils gouvernent aussi ta chance vers 31 à 34 ans.",
    outro: "Le saviez-vous ? Les sourcils sont le seul trait qu'on peut vraiment remodeler, c'est pourquoi les classiques les appellent le moyen le plus rapide de changer sa chance. Garde-les soignés et l'espace entre eux dégagé, et ta chance avec les autres prend un coup de pouce visible.",
    browLen: {
      hi: "Tes sourcils s'étirent plus loin que tes yeux. Les classiques disent que des sourcils qui dépassent l'œil signifient des amis fidèles et des frères et sœurs serviables, et ça se voit : tu as souvent un grand cercle bienveillant et un talent pour mettre les gens en relation.",
      mid: "La longueur de tes sourcils s'accorde parfaitement à tes yeux. Les relations, c'est naturel chez toi : proche sans être collant, indépendant sans être distant.",
      lo: "Tes sourcils sont courts et nets. Les personnes qui ont ce trait sont des pionniers indépendants : tu préfères tracer ton propre chemin plutôt qu'attendre de l'aide, et tu prends des décisions rapides et franches.",
    },
    browThick: {
      hi: "Tes sourcils sont fournis et forts. C'est le signe d'une énergie puissante et d'une vraie détermination : quand tu t'engages, tu vas jusqu'au bout.",
      mid: "Tes sourcils ont la densité idéale : doux, mais bien définis.",
      lo: "Tes sourcils sont fins et délicats. Ils révèlent une âme sensible et artiste qui perçoit facilement l'humeur des autres.",
    },
    browTilt: {
      hi: "La queue de tes sourcils remonte : le classique « sourcil en épée ». C'est le signe d'un esprit de compétition et de décision ; tu brilles quand les enjeux sont élevés.",
      mid: "Tes sourcils sont droits et stables, et dégagent une énergie calme et fiable.",
      lo: "La queue de tes sourcils descend doucement et te donne un air gentil et accessible. Tu as le visage auquel tout le monde a envie de parler.",
    },
  },
  eye: {
    name: "Yeux", organ: "L'Inspecteur · Fenêtre de l'âme", emoji: "👁️",
    intro: "Les anciens lecteurs de visages disaient : « Si le visage vaut mille pièces d'or, les yeux en valent neuf cents. » Rien ne compte davantage.",
    outro: "En réalité, les classiques accordaient encore plus d'importance à l'esprit de tes yeux — leur clarté et leur étincelle — qu'à leur forme. Bien dormir et avoir les yeux reposés est le moyen le plus simple de booster ton Inspecteur.",
    eyeOpen: {
      hi: "Tes yeux sont grands, lumineux et bien ouverts ! Dans les classiques, les yeux sont « l'Inspecteur », là où ton esprit se montre. Des yeux comme les tiens appartiennent à quelqu'un d'honnête, curieux et expressif : le personnage principal qui illumine chaque pièce.",
      mid: "Tes yeux sont joliment équilibrés en taille et en ouverture. Ici, le cœur et la tête travaillent ensemble : ton jugement est fin et les gens te font confiance d'instinct.",
      lo: "Tu as des yeux en amande, élégants et allongés : ce que les classiques appellent des « yeux de phénix ». Ils signalent la profondeur, la patience et un sens de l'observation très aiguisé. Tu ne dévoiles pas tout d'un coup, ce qui te donne un mystère intrigant et magnétique.",
    },
    eyeTilt: {
      hi: "Le coin externe de tes yeux remonte légèrement : un regard vif et intelligent. Quand tu te fixes un objectif, ta concentration est imparable.",
      mid: "Le coin de tes yeux est bien horizontal, signe d'un point de vue juste et équilibré.",
      lo: "Le coin de tes yeux descend doucement et te donne un regard chaleureux et bienveillant. Les inconnus se confient à toi en quelques minutes.",
    },
    eyeGap: {
      hi: "Tes yeux sont bien espacés : signe d'un cœur ouvert et d'une nature facile à vivre et optimiste. Les petits soucis ne te déstabilisent pas.",
      mid: "L'écartement de tes yeux est bien équilibré et combine concentration et ouverture d'esprit.",
      lo: "Tes yeux sont plus rapprochés, signe d'une concentration laser et d'un œil pour le détail. Une énergie d'expert, d'artisan, de spécialiste.",
    },
  },
  nose: {
    name: "Nez", organ: "Le Juge · Palais de la Richesse", emoji: "👃",
    intro: "Ton nez se trouve au centre même de ton visage. C'est « le Juge » parmi les Cinq Officiers et le Palais de la Richesse parmi les Douze : la clé de tes années fortes (environ 41 à 50 ans), de ta confiance et de ton énergie.",
    outro: "En lecture du visage, l'éclat du nez compte autant que sa forme. On dit qu'une pointe nette et doucement lumineuse annonce l'arrivée de l'argent ; prendre soin de ta peau ici est donc, en gros, un rituel de richesse.",
    noseWidth: {
      hi: "Ton nez a des ailes pleines et généreuses ! Le nez est le Palais de la Richesse — ton coffre-fort — et les ailes en sont les portes. Des portes solides signifient que l'argent qui entre a tendance à rester. Le classique « nez aimant à argent ».",
      mid: "Ton nez est parfaitement proportionné à ton visage : un grand sens de l'équilibre entre gagner et dépenser. Une chance financière stable et durable.",
      lo: "Ton nez est fin et raffiné. C'est le signe d'un goût sûr et d'un esprit ordonné : le sens et la qualité te motivent plus que l'argent, et tu fais grandir ta valeur par ton expertise.",
    },
    noseLen: {
      hi: "L'arête de ton nez est longue et gracieuse : signe de fierté, de sens des responsabilités et d'une Zone médiane solide. C'est à toi qu'on fait confiance pour que les choses soient faites.",
      mid: "La longueur de ton nez ancre bien ta Zone médiane et annonce des années fortes stables et régulières.",
      lo: "Ton nez est court et mignon, signe de sympathie et de réflexes rapides. Tu t'adaptes au changement plus vite que n'importe qui.",
    },
  },
  mouth: {
    name: "Bouche et lèvres", organ: "Le Portier · Bonne chère et fortune", emoji: "👄",
    intro: "Ta bouche est « le Portier » : la porte des paroles et de la nourriture. Elle détient ta chance côté bonne chère et abondance, ton charme et ta crédibilité, et ta fortune vers 60 ans.",
    outro: "La bouche change avec l'expression plus que tout autre trait, c'est pourquoi les lecteurs de visages disent qu'« un sourire peut changer une vie ». Dix secondes de sourire devant le miroir chaque jour accumuleraient les bénédictions de ton Portier.",
    mouthWidth: {
      hi: "Tu as une bouche large et généreuse ! En tant que « Portier », une grande bouche signifie une confiance généreuse et des paroles qui ont du poids : une énergie de leader né. Le vieux dicton dit qu'« une grande bouche mange bien » : bonne chère et bonne fortune te suivent.",
      mid: "Ta bouche est en harmonie avec ton visage : tes paroles correspondent à tes actes. Tu dis exactement ce qu'il faut dire, et les gens te font confiance pour cela.",
      lo: "Ta bouche est petite et nette. Tu choisis tes mots avec soin, alors chacun porte. Tu sais garder un secret : les gens te font profondément confiance.",
    },
    mouthCorner: {
      hi: "Les coins de ta bouche remontent naturellement ! C'est la préférée des lecteurs de visages : la « bouche en croissant de lune ». Le dicton « la fortune sourit aux visages souriants » a été écrit pour toi : elle attire les gens et la chance.",
      mid: "Les coins de ta bouche sont droits et nets, ce qui donne une impression calme et fiable.",
      lo: "Les coins de ta bouche reposent en une ligne calme et pensive qui te donne profondeur et présence. Et dès que tu souris, tout ton visage se transforme : c'est ton arme secrète.",
    },
    lipThick: {
      hi: "Tes lèvres sont pulpeuses, signe de chaleur et d'affection généreuse. Tu aimes en grand, alors ta vie amoureuse et familiale rayonne.",
      mid: "Tes lèvres sont équilibrées : un beau mélange de cœur et de raison.",
      lo: "Tes lèvres sont nettes et dessinées, signe d'une communication claire et logique. Convaincre et planifier sont tes points forts.",
    },
  },
  lower: {
    name: "Menton et mâchoire", organ: "Palais de l'Équipe · Zone de l'héritage", emoji: "🗿",
    intro: "Du dessous du nez à la pointe du menton s'étend la zone de la « Terre » : la fondation de ta vie. Elle détient ta chance de la maturité, ta vitalité, ta famille et ceux qui te soutiennent. Le sillon au-dessus de la lèvre est la « rivière de vie », et ton menton est le « sol » sur lequel tu te tiens.",
    outro: "La Zone de l'héritage prend de l'importance chaque année. Desserre la mâchoire, garde une bonne posture et le menton haut : les classiques disent que cela bâtit une base solide pour les décennies à venir.",
    philtrum: {
      hi: "Le sillon au-dessus de ta lèvre est long et bien marqué. Les classiques y lisent un signe de vitalité, de longévité et d'une maturité paisible et heureuse.",
      mid: "Ton sillon labial est bien équilibré, signe d'un rythme de vie sain.",
      lo: "Ton sillon labial est plutôt court : un cœur jeune et des gestes vifs. Tu fais partie de ceux qui paraissent plus jeunes que leur âge très, très longtemps.",
    },
    chinLen: {
      hi: "Ton menton est long et fort. Le menton est le « sol » de la Zone de l'héritage : signe de ténacité, d'endurance et d'une maturité confortable.",
      mid: "Ton menton termine ton visage par une ligne stable et équilibrée.",
      lo: "Ton menton est fin et raffiné, ce qui te donne un air stylé et moderne. Tu restes jeune d'esprit et dans l'air du temps toute ta vie.",
    },
    jawWidth: {
      hi: "Ta mâchoire est forte et large. Ton Palais de l'Équipe est très développé : les gens veulent te suivre, et tu as un vrai pouvoir pour mener un groupe.",
      mid: "Ta mâchoire est équilibrée : le mélange parfait de douceur et de force.",
      lo: "Ta mâchoire est fine et sculptée, signe de sensibilité et de style. Une forte énergie de créateur indépendant, de freelance et d'artiste.",
    },
  },
};

// Oreilles (l'Écoutant) — difficiles à voir sur une photo de face, tu peux donc choisir (facultatif)
export const EAR_TYPES = {
  auto: { label: "Auto (estimer d'après mon visage)", score: 0 },
  big: { label: "Grandes et pleines", score: 1.2,
    text: "Des oreilles grandes et pleines signifient un « Écoutant » puissant. Les oreilles montrent les bénédictions avec lesquelles tu es né : des oreilles grandes et solides sont associées à une enfance chanceuse et à une longue vie en bonne santé." },
  lobe: { label: "Lobes charnus", score: 1.5,
    text: "Des lobes pleins et charnus sont les fameuses « oreilles de la fortune » : pense aux statues classiques du Bouddha. Les lecteurs de visages en font le signe numéro un d'une richesse durable et d'un bon karma jusqu'à un âge avancé." },
  high: { label: "Placées haut (au-dessus des sourcils)", score: 1.0,
    text: "Quand le haut de l'oreille se trouve plus haut que les sourcils, on y lit un signe de brillance et de réussite précoce. Une grande chance dans les études et aux examens." },
  small: { label: "Petites et nettes", score: 0.4,
    text: "Des oreilles petites et nettes signalent une personne attentive aux détails, décidée et sûre d'elle : tu ne te laisses pas influencer par l'avis des autres." },
  out: { label: "Visibles de face", score: 0.6,
    text: "Des oreilles bien visibles de face révèlent un esprit indépendant et pionnier : tu réussis souvent sur des chemins que personne d'autre n'osait emprunter." },
};

// ---------------------------------------------------------------------
// Les 10 chances — quelles mesures nourrissent chacune (pondérations)
// ---------------------------------------------------------------------
export const FORTUNES = [
  { id: "wealth", name: "Chance financière", short: "Argent", emoji: "💰", color: "#f2b705",
    weights: { noseWidth: 1.4, noseLen: 0.6, mouthWidth: 0.7, lower: 0.6, chinLen: 0.4, ear: 1.0 },
    classic: "Le Ma Yi Shen Xiang appelle le nez le Palais de la Richesse, et les deux ailes du nez les « piliers jumeaux » du trésor. Un nez droit aux ailes solides signifie que l'argent entre… et reste.",
    tip: "Garde ton portefeuille bien rangé (pas de pile de tickets !) et la pointe de ton nez sans brillance. En lecture du visage, un éclat net et doux sur la pointe du nez annonce que l'argent arrive.",
  },
  { id: "love", name: "Chance en amour", short: "Amour", emoji: "💘", color: "#ff5c8a",
    weights: { eyeOpen: 1.0, eyeTilt: -0.4, lipThick: 1.0, mouthCorner: 1.0, smile: 1.2, eyeGap: 0.3 },
    classic: "Le Liu Zhuang Xiang Fa lit l'amour dans la zone douce sous les yeux et dans l'éclat du coin externe des yeux : le Palais de l'Amour. De quelqu'un dont les yeux et la bouche sourient ensemble, on dit qu'il a une « chance de fleur de pêcher » limpide, le signe classique de l'attirance.",
    tip: "Garde le coin externe de tes yeux (ton Palais de l'Amour) lumineux avec un bon soin contour des yeux. En photo, relever les coins de la bouche de quelques millimètres change tout.",
  },
  { id: "marriage", name: "Couple et mariage", short: "Couple", emoji: "💍", color: "#e86fa8",
    weights: { mouthCorner: 1.0, lipThick: 0.8, glabella: 0.7, smile: 0.8, symmetry: 0.6, chinLen: 0.6, jawWidth: 0.5, philtrum: 0.5 },
    classic: "Le Ma Yi Shen Xiang lit le couple au coin externe des yeux : le Palais de l'Amour. Quand cette zone est pleine et lumineuse, l'union est harmonieuse ; des coins de bouche relevés et un menton arrondi annoncent un foyer heureux pendant des décennies. Le Shen Xiang Quan Bian ajoute qu'un espace dégagé entre les sourcils signifie moins de disputes.",
    tip: "Hydrate le coin externe de tes yeux (ton Palais de l'Amour) et prenez le temps de vous regarder dans les yeux et de rire. Un vieux dicton dit que les couples heureux finissent par se ressembler : un sourire partagé est le meilleur rituel porte-bonheur qui soit.",
  },
  { id: "career", name: "Carrière et examens", short: "Carrière", emoji: "🎓", color: "#4a8fe7",
    weights: { upper: 1.3, browLen: 0.8, browEye: 0.6, eyeTilt: 0.5, symmetry: 0.6, glabella: 0.4 },
    classic: "Le Shen Xiang Quan Bian appelle le centre du front le Palais de la Carrière. Un front lumineux et dégagé avec des sourcils nets signifie que « ton nom s'élève tôt ».",
    tip: "Le jour d'un entretien ou d'un examen, ramène un peu tes cheveux en arrière pour montrer ton front (Palais de la Carrière). En lecture du visage, un front découvert signifie que tu ne bloques pas tes propres opportunités.",
  },
  { id: "study", name: "Études et intelligence", short: "Études", emoji: "📚", color: "#5b8def",
    weights: { upper: 1.3, eyeOpen: 0.6, browLen: 0.6, eyeTilt: 0.5, glabella: 0.5, browEye: 0.4, symmetry: 0.4, ear: 0.6 },
    classic: "Les anciens textes avaient même un nom spécial pour les « Salles du savoir » du visage. Un front large et lumineux signifie une compréhension rapide, des yeux clairs un esprit vif, et des sourcils nets de la persévérance. Le Shen Xiang Quan Bian dit que des oreilles placées plus haut que les sourcils apportent une renommée précoce grâce aux études.",
    tip: "Quand tu étudies, attache tes cheveux et dégage ton front : en lecture du visage, un front dégagé « ouvre la porte de la sagesse ». Et des yeux clairs, c'est une tête claire : une bonne nuit de sommeil bat toujours une nuit blanche.",
  },
  { id: "health", name: "Santé et vitalité", short: "Santé", emoji: "🌿", color: "#3fb97a",
    weights: { symmetry: 1.2, glabella: 0.6, noseLen: 0.5, philtrum: 0.9, balance: 1.2 },
    classic: "Le Ma Yi Shen Xiang lit la santé sur l'arête du nez (le Palais de la Santé) et dit qu'un sillon long et net au-dessus de la lèvre annonce une longue vie. Quand les Trois Zones sont équilibrées, la vie suit son cours sans heurts.",
    tip: "Si tu as tendance à froncer les sourcils, détends consciemment l'espace entre eux. On dit qu'un front lisse laisse circuler l'énergie. Et le sommeil : le meilleur rituel porte-bonheur qui soit.",
  },
  { id: "business", name: "Âme de chef", short: "Affaires", emoji: "🚀", color: "#ff7a3d",
    weights: { jawWidth: 1.2, noseWidth: 0.8, browThick: 0.8, browTilt: 0.5, mouthWidth: 0.7, noseLen: 0.4 },
    classic: "Le Liu Zhuang Xiang Fa dit que lorsque les pommettes et le nez se soutiennent, c'est « le visage qui détient le pouvoir » ; et un Palais de l'Équipe plein sur les côtés du menton signifie de nombreux partisans et de grandes entreprises.",
    tip: "Avant une réunion importante, dessine nettement la ligne de tes sourcils. Les sourcils symbolisent la volonté : des sourcils nets donnent une impression de décision et de maîtrise.",
  },
  { id: "honor", name: "Renommée et reconnaissance", short: "Renommée", emoji: "👑", color: "#a77bd9",
    weights: { upper: 1.0, noseLen: 0.8, browLen: 0.6, glabella: 0.6, eyeTilt: 0.5, symmetry: 0.4 },
    classic: "Le Shen Xiang Quan Bian dit que lorsque le front, le nez et le menton s'alignent en équilibre, « les Trois Zones sont droites » : le visage de quelqu'un dont le nom sera connu. Un Palais du Destin dégagé signifie que des soutiens puissants t'élèvent.",
    tip: "Garde l'espace entre tes sourcils (Palais du Destin) net et soigné. Se tenir droit change ton « qi » instantanément : la posture est l'astuce de célébrité la plus simple qui existe.",
  },
  { id: "children", name: "Chance familiale", short: "Famille", emoji: "🏡", color: "#ff9fb5",
    weights: { philtrum: 1.3, lipThick: 0.7, chinLen: 0.6, lower: 0.6, eyeOpen: 0.4 },
    classic: "Le Ma Yi Shen Xiang appelle la zone douce sous les yeux le Palais des Enfants, et dit qu'un sillon labial profond et un bas du visage plein signifient une famille florissante. Un menton rond et plein est le signe d'un foyer heureux.",
    tip: "Illumine les cernes avec un peu d'anticernes pour faire briller ton Palais de la Famille. On dit que rire avec ceux que tu aimes le fait briller encore plus.",
  },
  { id: "people", name: "Chance sociale", short: "Social", emoji: "🤝", color: "#20b2c9",
    weights: { mouthCorner: 1.1, smile: 1.0, eyeGap: 0.6, glabella: 0.6, browLen: 0.7, jawWidth: 0.4 },
    classic: "Le Shen Xiang Quan Bian appelle les sourcils le Palais des Amis — la chance avec les compagnons et les collègues — et dit qu'une « bouche en croissant de lune » aux coins relevés est la bouche qui attire les gens.",
    tip: "Essaie le « flash des sourcils » : lève-les légèrement en souriant pour dire bonjour. C'est la façon la plus rapide de dire « ravi de te voir » sans un mot.",
  },
];

// Phrases de chance par mesure (hi : mesure élevée, lo : mesure basse)
export const FORTUNE_LINES = {
  wealth: {
    noseWidth: { hi: "Tes ailes du nez pleines te donnent un rare talent pour garder l'argent. La vraie richesse, ce n'est pas gagner beaucoup, c'est ne pas laisser fuir, et ça, tu sais faire.", lo: "Ton nez fin est celui de quelqu'un qui fait fructifier l'argent en le faisant circuler, pas en l'entassant. Un flair aiguisé et de bonnes infos, voilà comment tu attrapes les occasions." },
    noseLen: { hi: "La longue arête de ton nez montre une richesse qui se construit régulièrement, surtout à partir de 40 ans.", lo: "Ton nez compact révèle une chance financière du « bon moment » : tu saisis les occasions dès qu'elles apparaissent." },
    mouthWidth: { hi: "Ta bouche généreuse apporte une double chance : bonne chère et bon argent arrivent ensemble.", lo: "Ta bouche nette montre une personne qui dépense avec intelligence et sait vraiment gérer son argent." },
    lower: { hi: "Le bas de ton visage solide signifie que ton coffre se remplit de plus en plus avec le temps : la classique chance financière de « remontée finale ».", lo: "Le bas de ton visage raffiné signifie que l'argent suit tes efforts : plus tu bouges jeune, plus il coule." },
    chinLen: { hi: "Ton menton fort sait très bien protéger sur le long terme ce que tu as bâti.", lo: "Ton menton raffiné annonce de l'argent gagné en repérant les tendances avant tout le monde." },
    ear: { hi: "Ajoute la forme de tes oreilles, et c'est un signe clair que ton « bol de bénédictions » est grand.", lo: "" },
  },
  love: {
    eyeOpen: { hi: "Tes grands yeux clairs montrent tes sentiments avec honnêteté : ils font penser « cette personne est sincère ».", lo: "Tes yeux en amande profonds ont une attraction mystérieuse : plus on te connaît, plus on craque. Une énergie de feu qui couve." },
    eyeTilt: { hi: "Le coin relevé de tes yeux te donne un charme assuré et captivant de « yeux de chat » qui fait tourner les têtes au premier regard.", lo: "Le coin adouci de tes yeux te donne ce charme chaleureux de « yeux de chiot ». En amour, mettre quelqu'un aussi à l'aise est l'arme absolue." },
    lipThick: { hi: "Des lèvres pulpeuses sont le signe d'un cœur généreux et affectueux : tu donnes l'amour librement et tu en reçois beaucoup.", lo: "Des lèvres dessinées signifient que chaque mot que tu dis en amour compte. Tu n'aimes pas à la légère : quand tu t'engages, c'est profond et durable." },
    mouthCorner: { hi: "Les coins relevés de ta bouche te donnent l'air de sourire même au repos, et les classiques disent que l'amour trouve ce genre de visage.", lo: "Ta bouche calme donne une première impression sérieuse, mais dès que tu souris, le charme explose. Souris souvent !" },
    smile: { hi: "Ton sourire sur cette photo est radieux ! Le Liu Zhuang Xiang Fa dit qu'un visage dont les yeux et la bouche sourient ensemble a la meilleure chance en amour qui soit.", lo: "" },
    eyeGap: { hi: "Tes yeux bien espacés font de toi un partenaire détendu qui laisse à l'autre de l'espace pour respirer.", lo: "Tes yeux plus rapprochés révèlent un amour dévoué, du genre « toi et personne d'autre »." },
  },
  marriage: {
    mouthCorner: { hi: "Ta « bouche en croissant de lune » annonce un foyer toujours plein de rires : tu illumines la journée de ton partenaire.", lo: "Ta bouche calme montre un amour tranquille et constant : tu le montres plus par des actes que par des mots. Quelques « je t'aime » de plus et votre couple rayonnera encore plus." },
    lipThick: { hi: "Tes lèvres pulpeuses montrent un partenaire chaleureux et attentionné qui rend vraiment heureux ceux qui vivent avec lui.", lo: "Tes lèvres dessinées marquent un partenaire qui tient ses promesses : fidèle, stable et engagé sur le long terme." },
    glabella: { hi: "L'espace dégagé entre tes sourcils montre un grand cœur sans rancune : les classiques disent que les gens comme toi se disputent moins avec leur partenaire.", lo: "L'espace net entre tes sourcils montre un partenaire attentif aux petites choses. Parlez des choses tout de suite au lieu de les laisser s'accumuler, et votre lien ne fera que se renforcer." },
    smile: { hi: "Ton sourire lumineux est comme une lampe dans la maison : il éclaire tout le monde autour de toi.", lo: "" },
    symmetry: { hi: "Ton visage merveilleusement équilibré signale une stabilité émotionnelle : la base d'un couple calme et confortable.", lo: "" },
    chinLen: { hi: "Ton menton fort annonce un couple qui dure jusqu'au grand âge et s'approfondit chaque année.", lo: "Ton menton raffiné montre un amour des expériences nouvelles : tu gardes la flamme vivante très, très longtemps." },
    jawWidth: { hi: "Ta mâchoire forte désigne le cœur solide du foyer : la personne sur qui ton partenaire s'appuie.", lo: "Ta mâchoire fine annonce un couple de meilleurs amis : joueur, affectueux et décontracté." },
    philtrum: { hi: "Ton sillon labial bien marqué montre de profondes racines familiales : le signe d'un foyer chaleureux et heureux.", lo: "" },
  },
  study: {
    upper: { hi: "Ton front large et lumineux est le classique « front qui apprend vite » : tu comprends dès la première fois.", lo: "Ton front compact signifie que tu apprends mieux en pratiquant. Plus tu fais d'exercices, plus tu progresses vite." },
    eyeOpen: { hi: "Tes grands yeux clairs montrent une curiosité naturelle : les yeux d'un élève qui creuse jusqu'à comprendre.", lo: "Tes yeux en amande profonds montrent une concentration calme et endurante. Tu brilles dans les études approfondies et sérieuses." },
    browLen: { hi: "Tes longs sourcils attirent de grands professeurs, des mentors et de bons camarades d'étude.", lo: "Tes sourcils nets marquent une personne autonome qui planifie le travail et s'y tient." },
    eyeTilt: { hi: "Le coin relevé de tes yeux montre une concentration qui s'aiguise à l'approche du jour de l'examen.", lo: "Tes yeux doux montrent un apprentissage patient, étape par étape : idéal pour les longues formations et les grands objectifs." },
    glabella: { hi: "Ton Palais du Destin dégagé signifie que la compréhension coule facilement : même les problèmes difficiles semblent abordables.", lo: "L'espace net entre tes sourcils signale une pensée précise et soigneuse : moins d'étourderies." },
    browEye: { hi: "L'espace généreux entre tes sourcils et tes yeux signifie un esprit calme : tu gardes ton sang-froid en salle d'examen.", lo: "L'espace réduit entre tes sourcils et tes yeux montre une concentration intense : tu excelles dans les révisions de dernière minute." },
    symmetry: { hi: "Ton visage équilibré se lit comme un esprit ordonné : fort en logique, en maths et dans les matières structurées.", lo: "" },
    ear: { hi: "La forte énergie de tes oreilles fait de toi une excellente oreille : tu tires beaucoup des cours et des conférences.", lo: "" },
  },
  career: {
    upper: { hi: "Ton front dégagé (Palais de la Carrière) te fait briller dès que tu es évalué. Aux examens et en entretien, tu montres plus que ce que tu avais préparé.", lo: "Ton front compact va de pair avec des compétences concrètes. Tu brilles sur le terrain, dans la pratique et l'action, pas seulement sur le papier." },
    browLen: { hi: "Tes longs sourcils attirent des mentors et des aînés qui veulent t'aider : les recommandations et les contacts t'ouvrent de belles portes.", lo: "Tes sourcils nets montrent quelqu'un qui fait ses preuves par pur talent. Laisse ton travail parler pour toi." },
    browEye: { hi: "L'espace généreux entre tes sourcils et tes yeux te donne un air détendu et ouvert : les recruteurs se disent « j'ai envie de travailler avec cette personne ».", lo: "L'espace réduit entre tes sourcils et tes yeux signale une concentration intense. Tu livres des résultats vite, même sous pression." },
    eyeTilt: { hi: "La forme vive et relevée de tes yeux dit « cette personne fait avancer les choses ».", lo: "Tes yeux doux inspirent confiance : tu donnes l'image d'un excellent coéquipier." },
    symmetry: { hi: "Ton visage merveilleusement équilibré dégage stabilité et confiance dès la première impression.", lo: "" },
    glabella: { hi: "Ton Palais du Destin dégagé signifie des chemins qui s'ouvrent sans obstacles.", lo: "L'espace net entre tes sourcils annonce un jugement soigneux et minutieux." },
  },
  health: {
    symmetry: { hi: "Ton visage est merveilleusement équilibré de gauche à droite : on y lit une énergie stable et qui circule bien.", lo: "" },
    glabella: { hi: "L'espace dégagé entre tes sourcils montre quelqu'un qui laisse partir le stress au lieu de s'y accrocher.", lo: "Quand tu cogites trop, la tension peut s'installer dans la nuque et les épaules : fais des étirements une habitude quotidienne." },
    noseLen: { hi: "L'arête longue et lisse de ton nez signifie un Palais de la Santé solide.", lo: "Ton nez compact s'accompagne d'une récupération rapide. Repose-toi bien et tu rebondis aussitôt." },
    philtrum: { hi: "Ton sillon labial long et bien marqué se rapproche de ce que les classiques appellent « le signe de longévité ».", lo: "Tu as tendance à dépenser ton énergie par grandes vagues : des repas réguliers sont ta clé secrète de chance." },
    balance: { hi: "Tes Trois Zones — front, nez, menton — sont merveilleusement égales. Les classiques chérissent cela : « zones équilibrées, vie paisible ».", lo: "L'une de tes Trois Zones ressort et donne beaucoup de caractère à ton visage. Appuie-toi sur cette force et garde un rythme quotidien régulier." },
  },
  business: {
    jawWidth: { hi: "Ta mâchoire forte montre un Palais de l'Équipe très développé : le visage classique de PDG, avec des équipes et des partenaires fidèles.", lo: "Ta mâchoire fine s'épanouit dans des modèles légers et rapides : entrepreneur solo, créateur, freelance." },
    noseWidth: { hi: "Ton nez solide empêche la trésorerie de fuir : un excellent instinct pour le cash-flow.", lo: "Ton nez raffiné convient aux entreprises fondées sur les idées et la marque plutôt que sur de gros capitaux." },
    browThick: { hi: "Tes sourcils forts montrent une vraie détermination et du cran. Quand les autres hésitent, tu bouges en premier.", lo: "Tes sourcils fins lisent les émotions et les détails des clients : parfait pour les services, le design et les marques lifestyle." },
    browTilt: { hi: "Tes « sourcils en épée » relevés signifient que tu ne recules pas quand ça compte.", lo: "Tes sourcils doux mettent les gens à l'aise : une arme secrète à la table des négociations." },
    mouthWidth: { hi: "Ta bouche généreuse donne de la force à tes paroles : idéal pour la vente, les pitchs et les levées de fonds.", lo: "Ta bouche nette est la marque d'un fondateur qui tient parole." },
    noseLen: { hi: "La longue arête de ton nez montre l'endurance nécessaire pour mener des projets de long terme jusqu'au bout.", lo: "" },
  },
  honor: {
    upper: { hi: "Ton front dégagé illumine ton Palais de la Carrière : ton nom se fait connaître tôt dans n'importe quelle organisation.", lo: "Ton front compact signifie une reconnaissance gagnée par le talent, et qui dure." },
    noseLen: { hi: "Ton nez droit et gracieux montre fierté et dignité : les classiques l'appellent « le nez qui fait un nom ».", lo: "Ton nez sympathique attire la popularité et une large sympathie." },
    browLen: { hi: "Tes longs sourcils aident ta réputation à voyager loin.", lo: "" },
    glabella: { hi: "Ton Palais du Destin dégagé signifie que des soutiens puissants élèvent encore ton nom.", lo: "" },
    eyeTilt: { hi: "Le coin relevé de tes yeux montre ambition et sens du but : tu continues de grimper.", lo: "" },
    symmetry: { hi: "Ton visage équilibré inspire justice et confiance : une vraie énergie de leader.", lo: "" },
  },
  children: {
    philtrum: { hi: "Ton sillon labial long et marqué annonce une famille florissante et en bonne santé, et des liens profonds avec les enfants.", lo: "Ton sillon labial court signifie un cœur éternellement jeune : le genre de parent, de tante ou d'oncle qui est aussi un meilleur ami." },
    lipThick: { hi: "Tes lèvres pulpeuses montrent un cœur chaleureux qui garde toute la famille unie.", lo: "Tes lèvres dessinées suggèrent quelqu'un qui élève les enfants avec un cadre clair et aimant." },
    chinLen: { hi: "Ton menton fort se lit comme le signe d'une famille soudée et attentionnée à l'âge mûr.", lo: "Ton menton raffiné désigne la personne stylée et drôle de la famille que tout le monde admire." },
    lower: { hi: "Le bas de ton visage plein annonce un foyer heureux toujours rempli de rires.", lo: "" },
    eyeOpen: { hi: "Tes yeux lumineux et clairs ajoutent de l'éclat à ton Palais de la Famille.", lo: "" },
  },
  people: {
    mouthCorner: { hi: "Ta « bouche en croissant de lune » attire les gens même quand tu n'essaies pas.", lo: "Ta bouche calme inspire confiance : tu es l'ami qu'on garde toute la vie." },
    smile: { hi: "Ton sourire lumineux est un aimant à gens. Rien qu'en regardant ta photo, on se sent de bonne humeur.", lo: "" },
    eyeGap: { hi: "Tes yeux bien espacés montrent un cœur ouvert et accueillant.", lo: "Tes yeux plus rapprochés signifient que tu prends profondément soin de chaque ami : fidèle jusqu'au bout." },
    glabella: { hi: "L'espace dégagé entre tes sourcils montre un grand cœur sans rancune.", lo: "L'espace net entre tes sourcils va de pair avec une attention délicate et prévenante envers les autres." },
    browLen: { hi: "De longs sourcils signifient un Palais des Amis bien rempli : de bons amis à tes côtés pour la vie.", lo: "Des sourcils nets signifient un petit cercle soudé et fidèle quoi qu'il arrive." },
    jawWidth: { hi: "Ta mâchoire forte apporte une « chance de leader » : beaucoup de gens t'admirent.", lo: "" },
  },
};

// Conseils beauté (maquillage et soin) — selon le trait que tu veux sublimer
export const MAKEUP_TIPS = {
  noseWidth: { lo: "Dépose un peu d'enlumineur sur la pointe du nez : il donne de l'éclat à ton Palais de la Richesse et « ouvre la porte du coffre ».", hi: "Un fin trait d'enlumineur au centre de l'arête du nez équilibre tes traits et apporte une touche élégante et soignée." },
  noseLen: { lo: "Une touche légère de contouring en haut de l'arête du nez l'allonge visuellement et renforce ton pilier des « années fortes ».", hi: "Un peu d'ombre sous la pointe du nez adoucit une longue arête et apporte une touche accessible." },
  mouthCorner: { lo: "Avec un crayon à lèvres, prolonge les coins extérieurs de 1 à 2 mm vers le haut. C'est le moyen le plus simple de créer la bouche porte-bonheur « en croissant de lune » !", hi: "Tes coins de bouche relevés sont déjà ton plus bel atout : ajoute juste un gloss transparent pour un éclat frais." },
  lipThick: { lo: "Applique une teinte plus claire seulement au centre des lèvres et estompe vers l'extérieur : aussitôt plus pulpeuses, plus chaleureuses, plus charmantes.", hi: "Une teinte « tes lèvres en mieux » aux contours légèrement flous rend les lèvres pulpeuses encore plus chics." },
  browLen: { lo: "Prolonge la queue de tes sourcils juste au-delà du coin externe de l'œil. Cela agrandit ton Palais des Amis : bonjour les belles rencontres !", hi: "De longs sourcils n'ont besoin que d'une queue bien nette. Un peu de gel pour brosser les poils vers le haut les rend impeccables." },
  browThick: { lo: "Comble les zones clairsemées par de fins traits imitant le poil pour projeter volonté et détermination.", hi: "Discipline juste le dessous des sourcils forts et brosse-les vers le haut avec un gel transparent : la puissance devient élégance." },
  browTilt: { lo: "Rehausse légèrement l'arc de tes sourcils pour un air plus décidé et assuré.", hi: "Dessine la queue de tes sourcils un peu plus à plat pour adoucir un regard intense et gagner en accessibilité." },
  eyeOpen: { lo: "Recourbe tes cils à la racine et ajoute un peu d'ombre brune au ras des cils inférieurs, côté externe : ton Inspecteur s'ouvre aussitôt.", hi: "De grands yeux n'ont besoin que d'un trait d'eye-liner fin. Une touche nacrée juste sous l'œil booste tes palais de la Famille et de l'Amour." },
  eyeTilt: { lo: "Étire légèrement ton eye-liner vers le haut au coin externe pour un regard vif et intelligent.", hi: "Garde la queue de l'eye-liner droite et ajoute un peu d'ombre sous les cils inférieurs pour un regard plus doux." },
  glabella: { lo: "Épile la tête des sourcils de 1 à 2 mm pour dégager ton Palais du Destin. Les classiques disent qu'un espace dégagé entre les sourcils laisse circuler la chance.", hi: "Laisse ton espace entre les sourcils tel quel : une touche de contouring sur le nez apporte relief et définition." },
  upper: { lo: "Essaie une raie sur le côté ou une coiffure qui laisse voir un peu le front pour illuminer ton Palais de la Carrière.", hi: "Une frange légère et aérienne ou un léger contouring à la racine des cheveux encadre joliment un front large." },
  jawWidth: { lo: "Un peu de contouring sous la mâchoire ajoute de la définition et une touche d'assurance.", hi: "Applique le contouring seulement sur les angles de la mâchoire, sous les oreilles, pour qu'une mâchoire forte paraisse fine et sculptée." },
  smile: { lo: "En photo, souris d'abord avec les yeux au lieu de dire « ouistiti ». Les classiques disent que la vraie chance arrive quand tes yeux sourient.", hi: "Ton sourire lumineux est le meilleur des embellissements ! Ajoute un peu de blush corail en haut des pommettes pour encore plus d'éclat." },
  philtrum: { lo: "Dessine l'arc de Cupidon au crayon pour que ton sillon labial paraisse net et précis.", hi: "Redessine légèrement ta lèvre supérieure au-delà du contour pour équilibrer un long sillon labial." },
  symmetry: { lo: "Essaie de changer ta raie de côté, ou dessine un peu plus haut le sourcil le plus bas pour équilibrer les deux côtés.", hi: "Un visage équilibré est sublimé par un maquillage naturel, effet « nude »." },
};

export const METRIC_LABELS = {
  eyeSize: "Largeur des yeux", eyeOpen: "Ouverture des yeux", eyeTilt: "Coin des yeux relevé", eyeGap: "Écartement des yeux",
  browLen: "Longueur des sourcils", browThick: "Densité des sourcils", browTilt: "Arc des sourcils", browEye: "Espace sourcil–œil",
  glabella: "Palais du Destin (entre-sourcils)", noseWidth: "Plénitude du nez", noseLen: "Longueur de l'arête du nez", mouthWidth: "Largeur de la bouche",
  mouthCorner: "Coins de bouche relevés", lipThick: "Épaisseur des lèvres", philtrum: "Longueur du sillon labial", chinLen: "Longueur du menton",
  jawWidth: "Largeur de la mâchoire", faceRatio: "Longueur du visage", upper: "Zone supérieure (front)", middle: "Zone médiane (sourcils–nez)",
  lower: "Zone inférieure (nez–menton)", symmetry: "Symétrie", smile: "Score de sourire",
};

// Noms courts des traits (avec possessif) pour les phrases
export const FEATURE_NAMES = {
  eyeOpen: "tes yeux", eyeTilt: "la forme de tes yeux", eyeGap: "l'écartement de tes yeux", browLen: "tes sourcils", browThick: "tes sourcils",
  browTilt: "l'arc de tes sourcils", browEye: "l'espace entre sourcils et yeux", glabella: "ton Palais du Destin", noseWidth: "ton nez",
  noseLen: "l'arête de ton nez", mouthWidth: "ta bouche", mouthCorner: "la ligne de ton sourire", lipThick: "tes lèvres",
  philtrum: "ton sillon labial", chinLen: "ton menton", jawWidth: "ta mâchoire", upper: "ton front", lower: "le bas de ton visage",
  symmetry: "ta symétrie", smile: "ton sourire",
};

// Phrases d'accroche — la première chose affichée dans le résultat
export const HOOKS = {
  wealth: ["Bon, ce n'est pas juste un nez. C'est un coffre-fort. 💰", "Ton portefeuille a reconnu ce visage avant toi !", "Énergie d'aimant à argent détectée. 💸"],
  love: ["Ces yeux… quelqu'un a le cœur qui s'emballe en ce moment. 💘", "Soyons honnêtes : on te remarque beaucoup, non ?", "Visage de voleur de cœurs certifié. 💞"],
  marriage: ["Ce visage dit « ils vécurent heureux ». 💍", "La chance en couple est écrite partout sur ce visage !", "Énergie d'aimant à âme sœur détectée. 💞"],
  study: ["Une énergie de tête bien faite, juste sur ton front. 📚", "Le genre de visage que tous les profs adoraient avoir en classe !", "Une vibe de tableau d'honneur, rien à redire. 🧠"],
  career: ["Le front dont rêvent les recruteurs. 🎓", "Ce visage est fait pour le bureau d'angle !", "Énergie « vous êtes embauché », haut et fort. 💼"],
  health: ["Un équilibre pareil ? Ça faisait longtemps. 🌿", "Énergie de héros avec la barre de vie pleine !", "Ton visage dit « fait pour durer ». 💪"],
  business: ["Cette mâchoire t'appelle « patron ». 🚀", "Ce visage a sa place sur une page de fondateur !", "Énergie de PDG. Rien à ajouter. 👔"],
  honor: ["Ce visage va devenir célèbre. 👑", "Partout où tu vas, tu es « cette personne » dont on se souvient !", "Ton nom en lettres lumineuses : le visage est d'accord. ✨"],
  children: ["Ce visage remplit une maison de rires. 🏡", "Ton Palais de la Famille rayonne !", "L'énergie du cœur le plus chaleureux de la pièce. 💗"],
  people: ["Un visage vers lequel on est attiré comme par un aimant. 🤝", "Les coups de pouce de la chance font la queue pour ce visage !", "La personne préférée de tout le monde, et ça se voit. 🌟"],
};

// ---------------------------------------------------------------------
// Personnalisation par genre et âge
// Les « Années qui s'écoulent » (流年運氣) du Ma Yi Shen Xiang : avec l'âge, la chance descend le long du visage.
//   15–30 front → 31–40 sourcils et yeux → 41–50 nez et pommettes → 51–60 sillon labial et bouche → 61+ menton
// ---------------------------------------------------------------------
export const GENDERS = { "": "Je préfère ne pas le dire", f: "Femme", m: "Homme" };
const GENDER_NOUN = { f: "femme", m: "homme" };
export const genderNoun = (g) => GENDER_NOUN[g] || "";

export const AGE_GROUPS = {
  "": { label: "Je préfère ne pas le dire" },
  "20": { label: "Moins de 30 ans", phrase: "de moins de 30 ans", stage: "early", career: "Examens et premier emploi", children: "Chance familiale",
    place: "ton front (Zone supérieure)", keys: ["upper"], years: "de 15 à 30 ans",
    hi: "Et ton front — exactement là où se trouve ta chance en ce moment — est large et lumineux. C'est la saison des « premiers pas » (études, examens, ton premier vrai emploi), et les mentors font la queue pour t'aider.",
    lo: "Ton front est compact : ta chance s'ouvre quand tu apprends en faisant plutôt que derrière un bureau. Stages, projets perso et voyages sont tes accélérateurs de chance du moment.",
    mid: "Ton front est bien équilibré : dans ce chapitre de ta vie, un effort régulier se transforme directement en résultats." },
  "30": { label: "30–39 ans", phrase: "de 30 à 39 ans", stage: "mid", career: "Carrière et promotion", children: "Chance familiale",
    place: "tes sourcils et tes yeux", keys: ["browLen", "eyeOpen"], years: "de 31 à 40 ans",
    hi: "Et tes sourcils et tes yeux — là où vit ta chance en ce moment — sont merveilleusement expressifs. Ton jugement sur les gens et ton réseau s'ouvrent en même temps : un excellent moment pour rencontrer des collègues, partenaires et cofondateurs clés.",
    lo: "Tes sourcils et tes yeux sont calmes et posés : tu grandis par la confiance profonde plutôt que par un immense réseau. Approfondis un domaine et, à la fin de ta trentaine, tu seras l'expert qu'on appelle.",
    mid: "Tes sourcils et tes yeux sont bien équilibrés : parfait pour jongler avec grâce entre travail et vie de famille dans ce chapitre." },
  "40": { label: "40–49 ans", phrase: "de 40 à 49 ans", stage: "mid", career: "Carrière et promotion", children: "Chance familiale",
    place: "ton nez et tes pommettes", keys: ["noseLen", "noseWidth"], years: "de 41 à 50 ans",
    hi: "Et ton nez — le Palais de la Richesse, là où se trouve ta chance en ce moment — est fort ! Les lecteurs de visages appellent la quarantaine « la décennie du nez », celle où l'argent et le statut bougent le plus. Ton timing est parfait : c'est le moment de foncer.",
    lo: "Ton nez est fin et raffiné : ta chance grandit en consolidant ce que tu as déjà plutôt qu'en t'étendant trop. Range tes dépenses et affûte ton expertise : la fin de ta quarantaine te récompensera largement.",
    mid: "Ton nez ancre bien le centre de ton visage, ce qui annonce un flux régulier d'argent et de travail dans ce chapitre." },
  "50": { label: "50–59 ans", phrase: "de 50 à 59 ans", stage: "late", career: "Sens et second souffle", children: "Famille et héritage",
    place: "ton sillon labial et ta bouche", keys: ["philtrum", "mouthCorner"], years: "de 51 à 60 ans",
    hi: "Et ton sillon labial et ta bouche — là où se trouve ta chance en ce moment — sont superbes. Un sillon bien marqué et des coins de bouche relevés apportent santé, bonne chère et le don de rassembler les gens d'un seul mot.",
    lo: "Ta bouche repose en une ligne calme qui donne du poids à tes paroles. Les lecteurs de visages disent que sourire plus souvent illumine considérablement la cinquantaine : alors laisse sortir ce sourire !",
    mid: "Ton sillon labial et ta bouche sont bien équilibrés, ce qui annonce un rythme de vie confortable et un foyer paisible." },
  "60": { label: "60 ans et plus", phrase: "de 60 ans et plus", stage: "late", career: "Sens et second souffle", children: "Petits-enfants et héritage",
    place: "ton menton", keys: ["chinLen", "jawWidth"], years: "à partir de 61 ans",
    hi: "Et ton menton — là où vit ta chance désormais — est plein et fort. Le menton est le « sol » de la maturité : c'est le visage de quelqu'un qui profite de l'amour de sa famille et du respect des jeunes générations.",
    lo: "Ton menton est fin et raffiné : tu gardes un esprit jeune toute ta vie. Plus tu continues d'apprendre et d'explorer de nouveaux loisirs, plus ta chance s'élargit.",
    mid: "Ton menton soutient ton visage d'une ligne solide, ce qui annonce un chapitre sain et paisible." },
};

// Une phrase en plus par chance, selon l'étape de la vie (early : moins de 30 ans, mid : 30–49 ans, late : 50 ans et plus)
export const AGE_LINES = {
  wealth: { early: "Pour l'instant, il s'agit moins de gros argent que de constituer ton épargne et de bonnes habitudes financières.", mid: "C'est le moment de faire fructifier ton épargne et de bâtir une base solide : logement, placements, patrimoine.", late: "C'est le moment de protéger ce que tu as bâti et de profiter d'un avenir confortable et serein." },
  love: { early: "De nouvelles rencontres arrivent vers toi : dis oui à plus d'invitations.", mid: "Ta chance en amour, aujourd'hui, c'est la confiance avec la personne à tes côtés. Les petites attentions vont loin.", late: "Ton lien avec ton partenaire et tes vieux amis brille plus que jamais. Promenez-vous davantage ensemble." },
  marriage: { early: "Ta chance de rencontrer un partenaire pour la vie est grande ouverte. Pas besoin de te presser : la bonne personne est en chemin.", mid: "C'est la saison de construire un foyer à deux. Protégez vos moments en tête-à-tête, même quand la vie est chargée.", late: "Les années d'histoire partagée sont désormais votre plus grand trésor. Marcher et rire ensemble est le meilleur remède." },
  career: { early: "Ta chance se concentre sur les moments où tu es « évalué » : examens, entretiens et premier emploi.", mid: "Aux grands carrefours — promotions, changements de poste, se lancer à son compte — l'énergie de ton visage est de ton côté.", late: "La chance est ouverte pour transmettre ton expérience, être mentor et trouver un second souffle qui a du sens." },
  study: { early: "Ta chance se concentre sur l'acquisition de compétences : examens, certifications, diplômes. L'effort que tu fais maintenant paiera toute ta vie.", mid: "Un excellent moment pour apprendre un nouveau domaine ou décrocher une qualification professionnelle, et pour guider les études de tes enfants.", late: "Ta chance d'apprendre toute la vie est lumineuse. Commence un nouveau loisir ou un nouveau cours et garde l'esprit et le cœur jeunes." },
  health: { early: "Les habitudes de sommeil et de sport que tu prends maintenant sont ton compte épargne santé pour la vie.", mid: "Plus tu es occupé, plus tu dois prendre soin de ta nuque, de tes épaules et de ta digestion. Ne saute pas les bilans de santé.", late: "Des marches quotidiennes et un peu de renforcement léger sont tes meilleurs accélérateurs de chance. Le rire est un remède." },
  business: { early: "« Commencer petit, apprendre vite » est ton style gagnant en affaires en ce moment.", mid: "Les gens et les capitaux se rassemblent : un excellent moment pour croître et s'associer.", late: "Les projets stables fondés sur la confiance et l'expérience te conviennent mieux que les expansions risquées." },
  honor: { early: "Les occasions de te faire un nom arrivent tôt : ne laisse pas passer les petites.", mid: "Ton nom monte dans ton domaine et ta communauté. Ne fuis pas les rôles de leader.", late: "Tu entres dans la saison de l'aîné respecté. Partager ta sagesse élève encore ton nom." },
  children: { early: "Ta future chance familiale est lumineuse : de belles rencontres mènent à une famille heureuse.", mid: "Rire avec tes enfants (ou les enfants de ta vie) fait briller ton Palais de la Famille.", late: "C'est le visage de quelqu'un qui savoure la réussite de sa famille et la joie des petits-enfants." },
  people: { early: "Tu rencontres des amis et des mentors qui t'accompagneront toute ta vie.", mid: "Les personnes rencontrées au travail deviennent tes porte-bonheur. Dis bonjour en premier.", late: "Les amis de longue date sont désormais ton plus grand soutien. Partage les rires à chaque retrouvaille." },
};

// Conseils de soin pour les hommes (même structure que MAKEUP_TIPS)
export const GROOMING_TIPS = {
  noseWidth: { lo: "Garde la peau autour du nez nette, sans excès de sébum ni peaux sèches. On dit qu'une pointe de nez propre et claire illumine ta chance financière.", hi: "Un soin simple autour du nez rend un nez fort encore plus distingué." },
  noseLen: { lo: "Essaie une frange plus courte ou une coiffure un peu relevée pour souligner les lignes verticales du visage : ton nez paraît plus long et ton pilier des « années fortes » se tient droit.", hi: "Un peu de volume sur les côtés adoucit un visage et une arête du nez longs." },
  mouthCorner: { lo: "Utilise un baume à lèvres et entraîne-toi à relever légèrement les coins de la bouche. La bouche porte-bonheur « en croissant de lune » se construit avec l'expression !", hi: "Tes coins de bouche relevés sont ton meilleur atout : évite juste les lèvres gercées." },
  lipThick: { lo: "Un baume à lèvres transparent apporte un éclat sain et une impression plus chaleureuse et sympathique.", hi: "Garde simplement tes lèvres lisses et hydratées : des lèvres pleines inspirent santé et confiance." },
  browLen: { lo: "Ne coupe pas la queue de tes sourcils : laisse-la pousser. On dit que des sourcils plus longs que les yeux apportent plus de chance avec les amis et la famille.", hi: "De longs sourcils n'ont besoin que de quelques poils rebelles retirés." },
  browThick: { lo: "Un sérum pour sourcils ou une légère touche de crayon pour combler les trous projette volonté et détermination.", hi: "Retire seulement les poils rebelles sous les sourcils forts : le côté brut devient raffiné." },
  browTilt: { lo: "Discipline les poils sous l'arc du sourcil pour le dessiner : aussitôt plus décidé.", hi: "Raccourcis un peu au-dessus de la queue des sourcils pour adoucir un regard intense et gagner en accessibilité." },
  eyeOpen: { lo: "Dors suffisamment et utilise une compresse froide pour dégonfler. Des yeux clairs « ouvrent » ton Inspecteur.", hi: "De grands yeux paraissent pleins d'énergie dès que tu prends soin de tes cernes." },
  eyeTilt: { lo: "Si tu portes des lunettes, essaie des montures légèrement relevées sur les côtés pour un regard vif et assuré.", hi: "Des montures plus rondes ou une expression détendue transforment un regard perçant en regard chaleureux." },
  glabella: { lo: "Retire les poils entre les sourcils et essaie de perdre l'habitude de froncer. Un Palais du Destin dégagé laisse circuler la chance.", hi: "Laisse ton espace entre les sourcils tel quel : évite juste les rides du lion." },
  upper: { lo: "Coiffe tes cheveux vers le haut ou porte-les courts pour montrer ton front (Palais de la Carrière), surtout pour les entretiens et les grands jours.", hi: "Une frange un peu plus basse adoucit un front large et équilibre tes traits." },
  jawWidth: { lo: "Un rasage net qui dégage la mâchoire ajoute une touche forte et assurée.", hi: "Des côtés courts avec du volume sur le dessus équilibrent parfaitement une mâchoire forte." },
  smile: { lo: "En photo, souris d'abord avec les yeux. Les classiques disent que la vraie chance arrive quand tes yeux sourient.", hi: "Ton sourire lumineux est ton meilleur porte-bonheur : une bonne hygiène dentaire le fait briller encore plus." },
  philtrum: { lo: "Un rasage net au-dessus de la lèvre rend ton sillon labial bien dessiné et sain.", hi: "Un sillon labial bien marqué brille avec un simple rasage net." },
  symmetry: { lo: "Essaie de changer ta raie de côté, ou discipline un peu le sourcil le plus bas pour équilibrer les deux côtés.", hi: "Un visage équilibré est sublimé par une coupe nette et un rasage frais." },
};
