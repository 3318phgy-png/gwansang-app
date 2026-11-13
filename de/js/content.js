// =====================================================================
//  content.js — MyFaceFate-Deutungsdatenbank (deutsche Ausgabe)
//  Inspiriert von den drei großen Klassikern der chinesischen Gesichtslesekunst (Mian Xiang 面相):
//   1) Ma Yi Shen Xiang (麻衣神相) — Song-Dynastie. Der Grundtext der Fünf Beamten,
//      der Drei Zonen und der Zwölf Paläste.
//   2) Liu Zhuang Xiang Fa (柳莊相法) — Ming-Dynastie, von Yuan Gong und seinem Sohn Yuan Zhongche.
//      Berühmt für das Lesen des „Qi“: Ausstrahlung, Ausdruck und Geist.
//   3) Shen Xiang Quan Bian (神相全編) — Ming-Enzyklopädie, die Gesichter nach den
//      Fünf Elementen ordnet (Holz, Feuer, Erde, Metall, Wasser).
//  Alles ist eine moderne, positive Neuinterpretation, keine wörtlichen Zitate.
//  Tonregeln: immer freundlich, nie über das Aussehen lustig machen, nie Herkunft oder
//  Ethnie erwähnen. Jedes Merkmal wird als Stärke beschrieben. Nur zur Unterhaltung.
// =====================================================================

export const BOOKS = [
  {
    id: "mayi",
    name: "Ma Yi Shen Xiang",
    hanja: "麻衣神相",
    era: "Song-Dynastie · um das 10. Jahrhundert",
    color: "#ff6f91",
    desc: "Der Legende nach gab ein Einsiedler, den man nur als „Meister im Hanfgewand“ (Ma Yi) kannte, seine Geheimnisse in einer Berghöhle an den daoistischen Weisen Chen Tuan weiter. Daraus wurde das Rückgrat der Gesichtslesekunst: die Fünf Beamten, die Drei Zonen und die Zwölf Paläste. Immer wenn du hörst „die Nase ist dein Tresor“, stammt die Idee von hier.",
    key: ["Fünf Beamte", "Drei Zonen", "Zwölf Paläste"],
  },
  {
    id: "liuzhuang",
    name: "Liu Zhuang Xiang Fa",
    hanja: "柳莊相法",
    era: "Ming-Dynastie · um das 15. Jahrhundert",
    color: "#2fc4b2",
    desc: "Geschrieben von Yuan Gong — dem persönlichen Gesichtsleser des Kaisers — und seinem Sohn. Statt nur feste Merkmale zu betrachten, liest es das lebendige Gesicht: Ausstrahlung, Mimik, Haltung und den Funken in den Augen. Seine große Botschaft ist optimistisch: Dein Gesicht verändert sich mit deinen Gewohnheiten, also kann sich auch dein Glück ändern.",
    key: ["Qi und Ausstrahlung", "Der Geist der Augen", "Deutungen aus dem Leben"],
  },
  {
    id: "shenxiang",
    name: "Shen Xiang Quan Bian",
    hanja: "神相全編",
    era: "Ming-Dynastie · um das 16. Jahrhundert",
    color: "#f2b443",
    desc: "Die „Vollständige Enzyklopädie der Gesichtslesekunst“. Sie vereinte das Beste aller früheren Texte und ordnete die Gesichter nach den Fünf Elementen — Holz, Feuer, Erde, Metall und Wasser — dazu Dutzende Typen von Augen, Nasen, Brauen und Lippen. Jahrhundertelang war sie das Standardlehrbuch der Gesichtsleser in ganz Ostasien.",
    key: ["Gesichter der Fünf Elemente", "Merkmalstypen", "Das große Ganze"],
  },
];

// Die Fünf Beamten (五官)
export const FIVE_ORGANS = {
  ear: { name: "Ohren", title: "Der Zuhörer · 採聽官", role: "Angeborener Segen, Glück in der Kindheit und ein langes, gesundes Leben" },
  brow: { name: "Augenbrauen", title: "Der Wächter · 保壽官", role: "Gefühle, Freundschaften, Geschwister und dein Unterstützerkreis" },
  eye: { name: "Augen", title: "Der Inspektor · 監察官", role: "Fenster zur Seele: Weisheit, Intuition und Urteilskraft" },
  nose: { name: "Nase", title: "Der Richter · 審辨官", role: "Dein Tresor: Antrieb, Selbstvertrauen und Geldfluss" },
  mouth: { name: "Mund", title: "Der Torwächter · 出納官", role: "Worte und gutes Essen: Charme, Vertrauen und Großzügigkeit" },
};

// Die Zwölf Paläste (十二宮) — Gesichtskarte (x, y auf einem SVG-Raster von 0–100)
export const PALACES = [
  { id: "destiny", name: "Schicksal", hanja: "命宮", place: "Zwischen den Augenbrauen", x: 50, y: 36, meaning: "Die Kommandozentrale deines Schicksals. Ein glatter, offener Bereich hier bedeutet einen offenen Geist: Die Dinge scheinen sich zu deinen Gunsten zu fügen." },
  { id: "wealth", name: "Reichtum", hanja: "財帛宮", place: "Die Nase (Spitze und Flügel)", x: 50, y: 57, meaning: "Dein Tresor. Eine runde Spitze und volle Nasenflügel sollen verhindern, dass hereinkommendes Geld wieder verschwindet." },
  { id: "siblings", name: "Freunde", hanja: "兄弟宮", place: "Die Augenbrauen", x: 30, y: 33, meaning: "Geschwister, Freunde und Kollegen. Gepflegte, fließende Brauen bedeuten viele Menschen auf deiner Seite." },
  { id: "property", name: "Zuhause", hanja: "田宅宮", place: "Zwischen Braue und Auge", x: 66, y: 36.5, meaning: "Zuhause, Besitz und familiäre Stabilität. Viel Raum hier zeigt ein entspanntes, großherziges Wesen." },
  { id: "children", name: "Familie", hanja: "子女宮", place: "Unter den Augen", x: 34, y: 47, below: true, meaning: "Kinder, Verspieltheit und Lebenskraft. Eine weiche, helle Partie unter den Augen steht für warmes Familienglück und natürlichen Charme." },
  { id: "helpers", name: "Team", hanja: "奴僕宮", place: "Seiten des Kinns", x: 30, y: 84, meaning: "Dein Team, deine Kunden und Unterstützer. Eine kräftige Kinnpartie bedeutet, dass Menschen dir gern folgen." },
  { id: "romance", name: "Liebe", hanja: "夫妻宮", place: "Äußere Augenwinkel", x: 80, y: 44, below: true, meaning: "Liebe und Partnerschaft. Glatte, strahlende Haut hier deutet auf ein glückliches, harmonisches Liebesleben hin." },
  { id: "health", name: "Gesundheit", hanja: "疾厄宮", place: "Nasenrücken", x: 50, y: 44, meaning: "Energie und Widerstandskraft. Ein glatter, durchgehender Nasenrücken soll weniger kleine Wehwehchen bedeuten." },
  { id: "travel", name: "Reisen", hanja: "遷移宮", place: "Schläfen (Stirnränder)", x: 20, y: 22, meaning: "Reisen, Umzüge und Glück im Ausland. Volle Schläfen bedeuten, dass Chancen dich fern der Heimat finden." },
  { id: "career", name: "Karriere", hanja: "官祿宮", place: "Mitte der Stirn", x: 50, y: 20, meaning: "Karriere, Beförderungen und Ansehen. Eine klare, offene Stirnmitte ist das klassische Zeichen für „fällt dem Chef auf“." },
  { id: "fortune", name: "Segen", hanja: "福德宮", place: "Über den Brauenenden", x: 78, y: 25, meaning: "Angeborenes Glück und innerer Frieden. Fülle hier bedeutet Segen, der ein Leben lang hält." },
  { id: "parents", name: "Eltern", hanja: "父母宮", place: "Obere Stirnecken", x: 38, y: 13, meaning: "Eltern, Mentoren und Ältere. Eine helle obere Stirn bedeutet Unterstützung von den Menschen über dir." },
];

// Gesichtsformen der Fünf Elemente — nach dem Shen Xiang Quan Bian
export const FACE_SHAPES = {
  wood: { name: "Holz-Gesicht", alias: "Der Visionär", emoji: "🌳", color: "#4caf7a",
    text: "Dein langes, elegantes Gesicht nennen die Klassiker ein Holz-Gesicht. Wie ein Baum, der zum Himmel wächst, treiben dich große Ideale und die Liebe zum Lernen und Wachsen an. Du glänzt überall dort, wo etwas wachsen soll — Ideen, Teams, Schüler, Projekte — und wirst mit jedem Jahr beeindruckender. Ein echter Spätzünder im allerbesten Sinne." },
  fire: { name: "Feuer-Gesicht", alias: "Der Funke", emoji: "🔥", color: "#ef5b5b",
    text: "Eine breite Stirn und Wangenknochen, die elegant zum Kinn hin schmaler werden: Das ist ein Feuer-Gesicht. Wie eine Flamme denkst du schnell und hast scharfe Sinne, deshalb fallen dir Ideen und Selbstausdruck leicht. Kunst, Content, Marketing, alles, wo man einen Schritt voraus sein muss: Dort bringen Feuer-Gesichter den Raum zum Leuchten." },
  earth: { name: "Erde-Gesicht", alias: "Der Fels", emoji: "⛰️", color: "#c7923e",
    text: "Ein volles, geerdetes Gesicht mit festem, stabilem Umriss ist ein Erde-Gesicht. Du strahlst ein tiefes, ruhiges Vertrauen aus, das Menschen — und Ressourcen — ganz natürlich zu dir zieht. Was du anfängst, bringst du zu Ende; deshalb verbinden die Klassiker Erde-Gesichter mit Führung, Finanzen und Dingen, die Bestand haben." },
  metal: { name: "Metall-Gesicht", alias: "Die Führungskraft", emoji: "⚔️", color: "#8a94a6",
    text: "Eine markante, klar strukturierte Kieferlinie macht dies zu einem Metall-Gesicht. Wie polierter Stahl hast du klare Prinzipien und ein schnelles, entschlossenes Urteil: Du blühst auf, wenn du das Sagen hast. Sport, Recht, Führung, jede Arena mit klaren Regeln und echtem Einsatz: Dort holen sich Metall-Gesichter ihre Krone." },
  water: { name: "Wasser-Gesicht", alias: "Der Charmeur", emoji: "💧", color: "#4a8fe7",
    text: "Weiche, gerundete Konturen machen dies zu einem Wasser-Gesicht. Wie Wasser fügst du dich mit Wärme und Flexibilität in jede Situation ein: Das ist deine Superkraft. Menschen fühlen sich bei dir sofort wohl, also folgen Freunde, Fans und Glücksfälle. Vertrieb, Moderation, Medien, alles mit Menschen ist Wasser-Gesicht-Terrain." },
  balance: { name: "Ausgewogenes Gesicht", alias: "Das Allround-Talent", emoji: "🥚", color: "#a77bd9",
    text: "Dein ovales Gesicht hat wunderbar ausgewogene Proportionen: Im Sinne der Fünf Elemente dominiert kein einzelnes Element. Die Klassiker schätzen Ausgewogenheit über alles, und dies ist das Gesicht eines Menschen, der in jeder Lage aufblüht. Anpassungsfähig, vielseitig und auf leise Art beeindruckend." },
};

// ---------------------------------------------------------------------
// Deutungen pro Merkmal — gewählt nach gemessener Stufe (hi / mid / lo).
// Jeder Satz ist positiv: „lo“ ist nie schlecht, nur eine andere Stärke.
// ---------------------------------------------------------------------
export const PART_READINGS = {
  forehead: {
    name: "Stirn", organ: "Palast der Karriere · Zone der Jugend", emoji: "🌅",
    intro: "Gesichtsleser schauen immer zuerst auf die Stirn. Sie ist die Zone des „Himmels“: Sie zeigt, wie groß du denkst, dein Glück mit Mentoren und dein Schicksal etwa zwischen 15 und 30 Jahren.",
    outro: "Die Paläste der Eltern, der Karriere, des Segens und des Reisens liegen alle hier oben, deshalb heißt die Stirn „das Dach deines Glücks“. Tipp der Klassiker: Zeig an wichtigen Tagen ein bisschen Stirn, statt sie unter dem Pony zu verstecken; das soll die Tür zu Chancen öffnen.",
    upper: {
      hi: "Du hast eine wunderbar offene, weite Stirn! In den Klassikern ist das die obere Zone, Sitz des frühen Glücks und der Weisheit. Eine solche Stirn gehört zu einem schnellen Denker, den Mentoren früh entdecken. Dein Palast der Karriere strahlt, also sind Prüfungen, Vorstellungsgespräche und alles, wobei du bewertet wirst, deine Bühne.",
      mid: "Deine Stirn ist perfekt proportioniert: nicht zu viel, nicht zu wenig. Eine ausgewogene obere Zone bedeutet einen guten Start ins Leben und eine tolle Balance zwischen Denken und Handeln. Du bist der Typ „klug, aber praktisch“: weder in Träumen verloren noch in Routine gefangen.",
      lo: "Deine Stirn ist kompakt und klar. Gesichtsleser sehen darin den Macher: Du lernst durch Tun statt durch Grübeln. Das Glück blüht oft ab 30 auf, also wird das Leben mit der Zeit immer besser. Die schönsten Kapitel kommen noch.",
    },
  },
  brow: {
    name: "Augenbrauen", organ: "Der Wächter · Palast der Freunde", emoji: "〰️",
    intro: "Deine Brauen sind „der Wächter“: Sie zeigen deine Gefühle, deine Energie und die Menschen an deiner Seite — Geschwister, Freunde und Verbündete. Außerdem bestimmen sie dein Glück etwa zwischen 31 und 34 Jahren.",
    outro: "Fun Fact: Brauen sind das einzige Merkmal, das du wirklich umformen kannst, deshalb nennen die Klassiker sie den schnellsten Weg, dein Glück zu ändern. Halte sie gepflegt und den Raum dazwischen frei, und dein Glück mit Menschen bekommt einen sichtbaren Schub.",
    browLen: {
      hi: "Deine Brauen reichen weiter als deine Augen. Die Klassiker sagen, Brauen, die über das Auge hinausgehen, bedeuten treue Freunde und hilfsbereite Geschwister, und das merkt man: Du hast meist einen großen, unterstützenden Kreis und ein Talent, Menschen zusammenzubringen.",
      mid: "Die Länge deiner Brauen passt perfekt zu deinen Augen. Beziehungen liegen dir: nah, ohne zu klammern, unabhängig, ohne distanziert zu sein.",
      lo: "Deine Brauen sind kurz und ordentlich. Menschen mit diesem Merkmal sind unabhängige Pioniere: Du gehst lieber deinen eigenen Weg, als auf Hilfe zu warten, und triffst Entscheidungen schnell und klar.",
    },
    browThick: {
      hi: "Deine Brauen sind voll und kräftig. Das zeigt starke Energie und echten Antrieb: Wenn du dich für etwas entscheidest, ziehst du es durch.",
      mid: "Deine Brauen haben genau die richtige Dichte: weich, aber mit Kontur.",
      lo: "Deine Brauen sind fein und zart. Das deutet auf eine sensible, künstlerische Seele, die die Stimmung anderer mühelos erspürt.",
    },
    browTilt: {
      hi: "Deine Brauenenden steigen an: die klassische „Schwertbraue“. Sie steht für Ehrgeiz und Entschlossenheit; du glänzt, wenn viel auf dem Spiel steht.",
      mid: "Deine Brauen liegen gerade und ruhig und strahlen eine gelassene, verlässliche Energie aus.",
      lo: "Deine Brauenenden sinken sanft ab und geben dir einen freundlichen, nahbaren Ausdruck. Du hast das Gesicht, mit dem jeder sofort reden will.",
    },
  },
  eye: {
    name: "Augen", organ: "Der Inspektor · Fenster zur Seele", emoji: "👁️",
    intro: "Alte Gesichtsleser sagten: „Ist das Gesicht tausend Goldmünzen wert, sind die Augen neunhundert wert.“ Nichts ist wichtiger.",
    outro: "Die Klassiker schätzten den Geist deiner Augen — ihre Klarheit und ihr Funkeln — sogar mehr als ihre Form. Guter Schlaf und ausgeruhte Augen sind der einfachste Weg, deinen Inspektor zu stärken.",
    eyeOpen: {
      hi: "Deine Augen sind groß, strahlend und weit geöffnet! In den Klassikern sind die Augen „der Inspektor“, wo sich dein Geist zeigt. Solche Augen gehören zu einem ehrlichen, neugierigen, ausdrucksstarken Menschen: der Hauptfigur, die jeden Raum zum Leuchten bringt.",
      mid: "Deine Augen sind in Größe und Öffnung wunderbar ausgewogen. Herz und Kopf arbeiten hier zusammen: Dein Urteil ist scharf, und Menschen vertrauen dir instinktiv.",
      lo: "Du hast elegante, lange Mandelaugen: das, was die Klassiker „Phönixaugen“ nennen. Sie stehen für Tiefe, Geduld und messerscharfe Beobachtungsgabe. Du zeigst nicht alles auf einmal, und das verleiht dir ein faszinierendes, magnetisches Geheimnis.",
    },
    eyeTilt: {
      hi: "Deine äußeren Augenwinkel heben sich leicht: ein wacher, kluger Blick. Wenn du dir ein Ziel setzt, ist dein Fokus nicht zu stoppen.",
      mid: "Deine Augenwinkel liegen waagerecht, ein Zeichen für eine faire, ausgewogene Sichtweise.",
      lo: "Deine Augenwinkel sinken sanft nach unten und geben dir einen warmen, gütigen Blick. Fremde öffnen sich dir innerhalb von Minuten.",
    },
    eyeGap: {
      hi: "Deine Augen stehen großzügig auseinander: ein Zeichen für ein offenes Herz und ein gelassenes, optimistisches Wesen. Kleinigkeiten bringen dich nicht aus der Ruhe.",
      mid: "Dein Augenabstand ist gut ausgewogen und verbindet Konzentration mit Offenheit.",
      lo: "Deine Augen stehen enger zusammen, ein Zeichen für Laser-Fokus und einen Blick fürs Detail. Experten-, Handwerker- und Spezialisten-Energie.",
    },
  },
  nose: {
    name: "Nase", organ: "Der Richter · Palast des Reichtums", emoji: "👃",
    intro: "Deine Nase steht genau in der Mitte deines Gesichts. Sie ist „der Richter“ unter den Fünf Beamten und der Palast des Reichtums unter den Zwölf: der Schlüssel zu deinen besten Jahren (etwa 41 bis 50), deinem Selbstvertrauen und deinem Antrieb.",
    outro: "In der Gesichtslesekunst zählt der Glanz der Nase genauso viel wie ihre Form. Eine klare, sanft schimmernde Nasenspitze soll ankündigen, dass Geld unterwegs ist; ein bisschen Hautpflege hier ist also quasi ein Reichtumsritual.",
    noseWidth: {
      hi: "Deine Nase hat volle, großzügige Flügel! Die Nase ist der Palast des Reichtums — dein Tresor — und die Nasenflügel sind seine Türen. Stabile Türen bedeuten, dass hereinkommendes Geld eher bleibt. Die klassische „Geldmagnet-Nase“.",
      mid: "Deine Nase steht in perfektem Verhältnis zu deinem Gesicht: ein tolles Gespür für die Balance zwischen Verdienen und Ausgeben. Stabiles, nachhaltiges Geldglück.",
      lo: "Deine Nase ist schmal und fein. Sie zeigt guten Geschmack und einen klaren Kopf: Sinn und Qualität motivieren dich mehr als Geld, und du steigerst deinen Wert durch Fachwissen.",
    },
    noseLen: {
      hi: "Dein Nasenrücken ist lang und anmutig: ein Zeichen für Stolz, Verantwortung und eine starke mittlere Zone. Dir vertraut man, wenn etwas erledigt werden muss.",
      mid: "Die Länge deiner Nase verankert deine mittlere Zone gut und deutet auf stabile, beständige beste Jahre.",
      lo: "Deine Nase ist kurz und niedlich, ein Zeichen für Freundlichkeit und schnelle Reflexe. Du passt dich schneller an Veränderungen an als jeder andere.",
    },
  },
  mouth: {
    name: "Mund und Lippen", organ: "Der Torwächter · Essen und Glück", emoji: "👄",
    intro: "Dein Mund ist „der Torwächter“: die Tür für Worte und Essen. Er hält dein Glück mit gutem Essen und Fülle, deinen Charme und deine Glaubwürdigkeit und dein Schicksal um die 60.",
    outro: "Der Mund verändert sich mit dem Ausdruck mehr als jedes andere Merkmal, deshalb sagen Gesichtsleser: „Ein Lächeln kann ein Leben verändern.“ Zehn Sekunden Lächeln vor dem Spiegel jeden Tag sollen den Segen deines Torwächters vermehren.",
    mouthWidth: {
      hi: "Du hast einen breiten, großzügigen Mund! Als „Torwächter“ bedeutet ein großer Mund großherziges Selbstvertrauen und Worte mit Gewicht: geborene Führungsenergie. Ein altes Sprichwort sagt: „Ein großer Mund isst gut“, also folgen dir gutes Essen und gutes Glück.",
      mid: "Dein Mund ist im Einklang mit deinem Gesicht: Deine Worte passen zu deinen Taten. Du sagst genau das, was gesagt werden muss, und Menschen vertrauen dir dafür.",
      lo: "Dein Mund ist klein und fein. Du wählst deine Worte sorgfältig, deshalb hat jedes Gewicht. Du kannst Geheimnisse bewahren: Menschen vertrauen dir zutiefst.",
    },
    mouthCorner: {
      hi: "Deine Mundwinkel zeigen von Natur aus nach oben! Das ist der Liebling der Gesichtsleser: der „Mondsichel-Mund“. Das Sprichwort „Das Glück kommt zum lächelnden Gesicht“ wurde für dich geschrieben: Er zieht Menschen und Glücksfälle an.",
      mid: "Deine Mundwinkel liegen gerade und klar und vermitteln einen ruhigen, verlässlichen Eindruck.",
      lo: "Deine Mundwinkel ruhen in einer gelassenen, nachdenklichen Linie, die dir Tiefe und Präsenz gibt. Und sobald du lächelst, verwandelt sich dein ganzes Gesicht: deine Geheimwaffe.",
    },
    lipThick: {
      hi: "Deine Lippen sind voll, ein Zeichen für Wärme und großzügige Zuneigung. Du liebst mit ganzem Herzen, deshalb strahlen Liebe und Familie.",
      mid: "Deine Lippen sind ausgewogen: eine tolle Mischung aus Herz und Verstand.",
      lo: "Deine Lippen sind klar konturiert, ein Hinweis auf jemanden, der klar und logisch kommuniziert. Überzeugen und Planen sind deine Stärken.",
    },
  },
  lower: {
    name: "Kinn und Kiefer", organ: "Palast des Teams · Zone des Vermächtnisses", emoji: "🗿",
    intro: "Von unter der Nase bis zur Kinnspitze reicht die Zone der „Erde“: das Fundament deines Lebens. Sie hält dein Glück in späteren Jahren, deine Lebenskraft, deine Familie und die Menschen, die dich unterstützen. Die Rinne über der Lippe ist der „Fluss des Lebens“, und dein Kinn ist der „Boden“, auf dem du stehst.",
    outro: "Die Zone des Vermächtnisses wird mit jedem Jahr wichtiger. Lockere den Kiefer, achte auf deine Haltung und trag das Kinn hoch: Die Klassiker sagen, so baust du ein stabiles Fundament für die kommenden Jahrzehnte.",
    philtrum: {
      hi: "Die Rinne über deiner Lippe ist lang und deutlich. Die Klassiker lesen darin ein Zeichen für Lebenskraft, ein langes Leben und ein friedliches, glückliches Alter.",
      mid: "Deine Oberlippenrinne ist gut ausgewogen und deutet auf einen gesunden Lebensrhythmus.",
      lo: "Deine Oberlippenrinne ist eher kurz: ein junges Herz und flinke Bewegungen. Du gehörst zu denen, die sehr, sehr lange jünger aussehen, als sie sind.",
    },
    chinLen: {
      hi: "Dein Kinn ist lang und kräftig. Das Kinn ist der „Boden“ der Zone des Vermächtnisses: ein Zeichen für Biss, Ausdauer und ein angenehmes Alter.",
      mid: "Dein Kinn schließt dein Gesicht mit einer stabilen, ausgewogenen Linie ab.",
      lo: "Dein Kinn ist fein und elegant und gibt dir einen stilvollen, modernen Look. Du bleibst ein Leben lang jung im Herzen und am Puls der Zeit.",
    },
    jawWidth: {
      hi: "Deine Kieferlinie ist kräftig und breit. Dein Palast des Teams ist stark ausgeprägt: Menschen wollen dir folgen, und du hast echte Kraft, eine Gruppe zu führen.",
      mid: "Deine Kieferlinie ist ausgewogen: die perfekte Mischung aus weich und stark.",
      lo: "Deine Kieferlinie ist schlank und modelliert, ein Zeichen für Feingefühl und Stil. Viel Energie für Solo-Kreative, Freelancer und Künstler.",
    },
  },
};

// Ohren (der Zuhörer) — auf einem Frontalfoto schwer zu sehen, deshalb kannst du wählen (optional)
export const EAR_TYPES = {
  auto: { label: "Automatisch (aus meinem Gesicht schätzen)", score: 0 },
  big: { label: "Groß und voll", score: 1.2,
    text: "Große, volle Ohren bedeuten einen starken „Zuhörer“. Die Ohren zeigen den Segen, mit dem du geboren wurdest: Große, kräftige Ohren stehen für eine glückliche Kindheit und ein langes, gesundes Leben." },
  lobe: { label: "Fleischige Ohrläppchen", score: 1.5,
    text: "Volle, fleischige Ohrläppchen sind die berühmten „Glücksohren“: Denk an klassische Buddha-Statuen. Gesichtsleser halten sie für das Zeichen Nummer eins für dauerhaften Wohlstand und gutes Karma bis ins hohe Alter." },
  high: { label: "Hoch sitzend (über den Brauen)", score: 1.0,
    text: "Sitzt der obere Ohrrand höher als die Augenbrauen, gilt das als Zeichen für Brillanz und frühen Erfolg. Großes Glück beim Lernen und in Prüfungen." },
  small: { label: "Klein und fein", score: 0.4,
    text: "Kleine, feine Ohren zeigen einen detailverliebten, entschlossenen Menschen mit starkem Selbstbild: Du lässt dich nicht von der Meinung anderer beeinflussen." },
  out: { label: "Von vorn sichtbar", score: 0.6,
    text: "Ohren, die man von vorn deutlich sieht, stehen für einen unabhängigen Pioniergeist: Du hast oft auf Wegen Erfolg, die sich sonst niemand getraut hat." },
};

// ---------------------------------------------------------------------
// Die 10 Glücksbereiche — welche Messwerte jeden speisen (Gewichte)
// ---------------------------------------------------------------------
export const FORTUNES = [
  { id: "wealth", name: "Geldglück", short: "Geld", emoji: "💰", color: "#f2b705",
    weights: { noseWidth: 1.4, noseLen: 0.6, mouthWidth: 0.7, lower: 0.6, chinLen: 0.4, ear: 1.0 },
    classic: "Das Ma Yi Shen Xiang nennt die Nase den Palast des Reichtums und die beiden Nasenflügel die „Zwillingssäulen“ der Schatzkammer. Eine gerade Nase mit kräftigen Flügeln bedeutet: Das Geld kommt herein — und bleibt.",
    tip: "Halte deinen Geldbeutel ordentlich (kein Kassenzettel-Chaos!) und deine Nasenspitze glanzfrei. In der Gesichtslesekunst kündigt ein klarer, sanfter Schimmer auf der Nasenspitze an, dass Geld unterwegs ist.",
  },
  { id: "love", name: "Liebesglück", short: "Liebe", emoji: "💘", color: "#ff5c8a",
    weights: { eyeOpen: 1.0, eyeTilt: -0.4, lipThick: 1.0, mouthCorner: 1.0, smile: 1.2, eyeGap: 0.3 },
    classic: "Das Liu Zhuang Xiang Fa liest die Liebe an der weichen Partie unter den Augen und am Glanz der äußeren Augenwinkel: dem Palast der Liebe. Wer mit Augen und Mund zugleich lächelt, hat angeblich „klares Pfirsichblütenglück“, das klassische Zeichen von Anziehung.",
    tip: "Halte deine äußeren Augenwinkel (deinen Palast der Liebe) mit einer guten Augencreme strahlend. Auf Fotos verändert es alles, die Mundwinkel nur ein paar Millimeter anzuheben.",
  },
  { id: "marriage", name: "Ehe und Partnerschaft", short: "Partnerschaft", emoji: "💍", color: "#e86fa8",
    weights: { mouthCorner: 1.0, lipThick: 0.8, glabella: 0.7, smile: 0.8, symmetry: 0.6, chinLen: 0.6, jawWidth: 0.5, philtrum: 0.5 },
    classic: "Das Ma Yi Shen Xiang liest die Partnerschaft an den äußeren Augenwinkeln: dem Palast der Liebe. Ist diese Partie voll und strahlend, ist die Verbindung harmonisch; nach oben zeigende Mundwinkel und ein rundes Kinn bedeuten ein Zuhause, das jahrzehntelang glücklich bleibt. Das Shen Xiang Quan Bian ergänzt, dass ein offener Raum zwischen den Brauen weniger Streit bedeutet.",
    tip: "Pflege deine äußeren Augenwinkel (deinen Palast der Liebe) mit Feuchtigkeit und nehmt euch Zeit, euch in die Augen zu sehen und zu lachen. Ein altes Sprichwort sagt, glückliche Paare werden sich mit der Zeit ähnlich: Ein gemeinsames Lächeln ist das beste Glücksritual überhaupt.",
  },
  { id: "career", name: "Karriere und Prüfungen", short: "Karriere", emoji: "🎓", color: "#4a8fe7",
    weights: { upper: 1.3, browLen: 0.8, browEye: 0.6, eyeTilt: 0.5, symmetry: 0.6, glabella: 0.4 },
    classic: "Das Shen Xiang Quan Bian nennt die Stirnmitte den Palast der Karriere. Eine helle, offene Stirn mit gepflegten Brauen bedeutet: „Dein Name steigt früh auf.“",
    tip: "Streich am Tag des Vorstellungsgesprächs oder der Prüfung dein Haar ein wenig zurück, damit deine Stirn (der Palast der Karriere) zu sehen ist. In der Gesichtslesekunst heißt eine freie Stirn, dass du dir deine Chancen nicht selbst verbaust.",
  },
  { id: "study", name: "Lernen und Klugheit", short: "Lernen", emoji: "📚", color: "#5b8def",
    weights: { upper: 1.3, eyeOpen: 0.6, browLen: 0.6, eyeTilt: 0.5, glabella: 0.5, browEye: 0.4, symmetry: 0.4, ear: 0.6 },
    classic: "Die alten Texte hatten sogar einen eigenen Namen für die „Hallen des Lernens“ im Gesicht. Eine breite, helle Stirn bedeutet schnelles Verstehen, klare Augen einen wachen Geist und gepflegte Brauen Ausdauer. Das Shen Xiang Quan Bian sagt, Ohren, die höher sitzen als die Brauen, bringen frühen Ruhm durch Lernen.",
    tip: "Binde beim Lernen dein Haar zurück und zeig deine Stirn: In der Gesichtslesekunst „öffnet eine freie Stirn die Tür zur Weisheit“. Und klare Augen bedeuten einen klaren Kopf: Eine gute Nacht Schlaf schlägt jede durchgemachte Nacht.",
  },
  { id: "health", name: "Gesundheit und Vitalität", short: "Gesundheit", emoji: "🌿", color: "#3fb97a",
    weights: { symmetry: 1.2, glabella: 0.6, noseLen: 0.5, philtrum: 0.9, balance: 1.2 },
    classic: "Das Ma Yi Shen Xiang liest die Gesundheit am Nasenrücken (dem Palast der Gesundheit) und sagt, eine lange, klare Rinne über der Lippe deute auf ein langes Leben. Sind die Drei Zonen ausgewogen, läuft das Leben rund.",
    tip: "Wenn du oft die Stirn runzelst, entspann bewusst den Raum zwischen deinen Brauen. Eine glatte Stirn soll die Energie fließen lassen. Und Schlaf: das beste Glücksritual, das es gibt.",
  },
  { id: "business", name: "Chef-Energie", short: "Business", emoji: "🚀", color: "#ff7a3d",
    weights: { jawWidth: 1.2, noseWidth: 0.8, browThick: 0.8, browTilt: 0.5, mouthWidth: 0.7, noseLen: 0.4 },
    classic: "Das Liu Zhuang Xiang Fa sagt: Wenn Wangenknochen und Nase einander stützen, ist das „das Gesicht, das die Macht hält“; und ein voller Palast des Teams an den Kinnseiten bedeutet viele Anhänger und große Unternehmungen.",
    tip: "Betone vor einem wichtigen Meeting deine Brauenlinie. Brauen stehen für Willenskraft, deshalb wirken klare Brauen entschlossen und souverän.",
  },
  { id: "honor", name: "Ruhm und Anerkennung", short: "Ruhm", emoji: "👑", color: "#a77bd9",
    weights: { upper: 1.0, noseLen: 0.8, browLen: 0.6, glabella: 0.6, eyeTilt: 0.5, symmetry: 0.4 },
    classic: "Das Shen Xiang Quan Bian sagt: Wenn Stirn, Nase und Kinn ausgewogen übereinanderstehen, „stehen die Drei Zonen aufrecht“: das Gesicht eines Menschen, dessen Name bekannt wird. Ein offener Palast des Schicksals bedeutet, dass mächtige Förderer dich nach oben bringen.",
    tip: "Halte den Raum zwischen deinen Brauen (den Palast des Schicksals) sauber und gepflegt. Aufrecht zu stehen verändert dein „Qi“ sofort: Haltung ist der einfachste Ruhm-Trick überhaupt.",
  },
  { id: "children", name: "Familienglück", short: "Familie", emoji: "🏡", color: "#ff9fb5",
    weights: { philtrum: 1.3, lipThick: 0.7, chinLen: 0.6, lower: 0.6, eyeOpen: 0.4 },
    classic: "Das Ma Yi Shen Xiang nennt die weiche Partie unter den Augen den Palast der Kinder und sagt, eine tiefe Oberlippenrinne und ein volles Untergesicht bedeuten eine blühende Familie. Ein rundes, volles Kinn ist das Zeichen eines glücklichen Zuhauses.",
    tip: "Hell Augenschatten mit etwas Concealer auf, um deinen Palast der Familie zum Leuchten zu bringen. Gemeinsam mit den Menschen zu lachen, die du liebst, soll ihn noch mehr strahlen lassen.",
  },
  { id: "people", name: "Soziales Glück", short: "Soziales", emoji: "🤝", color: "#20b2c9",
    weights: { mouthCorner: 1.1, smile: 1.0, eyeGap: 0.6, glabella: 0.6, browLen: 0.7, jawWidth: 0.4 },
    classic: "Das Shen Xiang Quan Bian nennt die Brauen den Palast der Freunde — das Glück mit Gefährten und Kollegen — und sagt, ein nach oben zeigender „Mondsichel-Mund“ sei der Mund, der Menschen anzieht.",
    tip: "Probier den „Brauen-Flash“: Heb beim lächelnden Hallo kurz die Brauen. Das ist der schnellste Weg, ohne ein Wort „schön, dich zu sehen“ zu sagen.",
  },
];

// Glückssätze pro Messwert (hi: Messwert hoch, lo: niedrig)
export const FORTUNE_LINES = {
  wealth: {
    noseWidth: { hi: "Deine vollen Nasenflügel geben dir ein seltenes Talent, Geld festzuhalten. Echter Reichtum heißt nicht, viel zu verdienen, sondern nichts zu verlieren, und das hast du im Griff.", lo: "Deine schmale Nase gehört zu jemandem, der Geld vermehrt, indem er es bewegt, nicht hortet. Ein feiner Riecher und gute Informationen sind dein Weg zu Chancen." },
    noseLen: { hi: "Dein langer Nasenrücken zeigt Wohlstand, der sich stetig aufbaut, besonders ab 40.", lo: "Deine kompakte Nase steht für Geldglück mit „perfektem Timing“: Du greifst zu, sobald sich eine Chance zeigt." },
    mouthWidth: { hi: "Dein großzügiger Mund bringt doppeltes Glück: Gutes Essen und gutes Geld kommen zusammen.", lo: "Dein feiner Mund zeigt jemanden, der klug und bewusst ausgibt und wirklich mit Geld umgehen kann." },
    lower: { hi: "Dein kräftiges Untergesicht bedeutet, dass sich dein Tresor mit der Zeit immer mehr füllt: das klassische Geldglück mit „Comeback zum Schluss“.", lo: "Dein feines Untergesicht bedeutet, dass das Geld deinem Einsatz folgt: Je mehr du in jungen Jahren in Bewegung bist, desto mehr fließt es." },
    chinLen: { hi: "Dein kräftiges Kinn kann sehr gut langfristig schützen, was du aufgebaut hast.", lo: "Dein feines Kinn deutet darauf hin, dass du Geld verdienst, indem du Trends vor allen anderen erkennst." },
    ear: { hi: "Nimm deine Ohrform dazu, und es ist ein klares Zeichen, dass deine „Segensschale“ groß ist.", lo: "" },
  },
  love: {
    eyeOpen: { hi: "Deine großen, klaren Augen zeigen deine Gefühle ehrlich: Sie lassen andere denken „dieser Mensch meint es ernst“.", lo: "Deine tiefen Mandelaugen haben eine geheimnisvolle Anziehung: Je besser man dich kennt, desto mehr verliebt man sich. Echte Slow-Burn-Energie." },
    eyeTilt: { hi: "Deine gehobenen Augenwinkel geben dir einen selbstbewussten, fesselnden „Katzenaugen“-Charme, nach dem man sich auf den ersten Blick umdreht.", lo: "Deine weichen Augenwinkel geben dir diesen warmen „Hundeblick“-Charme. In der Liebe ist es die ultimative Waffe, jemandem so ein Wohlgefühl zu geben." },
    lipThick: { hi: "Volle Lippen sind das Zeichen eines großzügigen, liebevollen Herzens: Du schenkst Liebe freizügig und bekommst viel zurück.", lo: "Konturierte Lippen bedeuten, dass jedes Wort, das du in der Liebe sagst, zählt. Du liebst nicht leichtfertig: Wenn du dich bindest, dann tief und dauerhaft." },
    mouthCorner: { hi: "Deine nach oben zeigenden Mundwinkel lassen dich selbst in Ruhe lächelnd wirken, und die Klassiker sagen, die Liebe findet solche Gesichter.", lo: "Dein ruhiger Mund macht einen ernsten ersten Eindruck, aber sobald du lächelst, explodiert der Charme. Lächle oft!" },
    smile: { hi: "Dein Lächeln auf diesem Foto strahlt! Das Liu Zhuang Xiang Fa sagt, ein Gesicht, bei dem Augen und Mund zusammen lächeln, hat das allerbeste Liebesglück.", lo: "" },
    eyeGap: { hi: "Deine weit stehenden Augen machen dich zu einem entspannten Partner, der dem anderen Raum zum Atmen lässt.", lo: "Deine enger stehenden Augen zeigen eine hingebungsvolle Liebe nach dem Motto „nur du“." },
  },
  marriage: {
    mouthCorner: { hi: "Dein „Mondsichel-Mund“ bedeutet ein Zuhause, das immer voller Lachen ist: Du bringst Licht in den Tag deines Partners.", lo: "Dein ruhiger Mund zeigt eine stille, beständige Liebe: Du zeigst sie eher mit Taten als mit Worten. Ein paar „Ich liebe dich“ mehr, und eure Partnerschaft strahlt noch wärmer." },
    lipThick: { hi: "Deine vollen Lippen zeigen einen warmen, fürsorglichen Partner, der die Menschen, mit denen er lebt, wirklich glücklich macht.", lo: "Deine konturierten Lippen kennzeichnen einen Partner, der seine Versprechen hält: treu, beständig und auf lange Sicht dabei." },
    glabella: { hi: "Der offene Raum zwischen deinen Brauen zeigt ein großes Herz, das nicht nachtragend ist: Die Klassiker sagen, Menschen wie du streiten seltener mit ihrem Partner.", lo: "Der schmale Raum zwischen deinen Brauen zeigt einen Partner, der die kleinen Dinge bemerkt. Sprecht Dinge gleich an, statt sie sich anstauen zu lassen, und eure Bindung wird immer stärker." },
    smile: { hi: "Dein strahlendes Lächeln ist wie eine Lampe im Haus: Es erhellt alle um dich herum.", lo: "" },
    symmetry: { hi: "Dein wunderbar ausgewogenes Gesicht zeigt emotionale Stabilität: das Fundament einer ruhigen, angenehmen Partnerschaft.", lo: "" },
    chinLen: { hi: "Dein kräftiges Kinn deutet auf eine Partnerschaft, die bis ins Alter hält und jedes Jahr tiefer wird.", lo: "Dein feines Kinn zeigt Freude an neuen Erlebnissen: Du hältst den Funken sehr, sehr lange am Leben." },
    jawWidth: { hi: "Deine kräftige Kieferlinie kennzeichnet das verlässliche Herz des Zuhauses: den Menschen, an den sich dein Partner lehnt.", lo: "Deine schlanke Kieferlinie deutet auf eine Partnerschaft wie unter besten Freunden: verspielt, liebevoll und unkompliziert." },
    philtrum: { hi: "Deine deutliche Oberlippenrinne zeigt tiefe familiäre Wurzeln: das Zeichen eines warmen, glücklichen Zuhauses.", lo: "" },
  },
  study: {
    upper: { hi: "Deine breite, helle Stirn ist die klassische „Schnelllerner-Stirn“: Du verstehst Dinge beim ersten Mal.", lo: "Deine kompakte Stirn bedeutet, dass du am besten durch Tun lernst. Je mehr Übungsaufgaben du löst, desto schneller kommst du voran." },
    eyeOpen: { hi: "Deine großen, klaren Augen zeigen natürliche Neugier: die Augen eines Schülers, der gräbt, bis er versteht.", lo: "Deine tiefen Mandelaugen zeigen ruhige, ausdauernde Konzentration. Du glänzt beim tiefen, ernsthaften Lernen." },
    browLen: { hi: "Deine langen Brauen ziehen tolle Lehrer, Mentoren und Lernpartner an.", lo: "Deine gepflegten Brauen kennzeichnen jemanden, der selbst plant und den Plan auch umsetzt." },
    eyeTilt: { hi: "Deine gehobenen Augenwinkel zeigen einen Fokus, der schärfer wird, je näher die Prüfung rückt.", lo: "Deine sanften Augen zeigen geduldiges Lernen Schritt für Schritt: ideal für lange Kurse und große Ziele." },
    glabella: { hi: "Dein offener Palast des Schicksals bedeutet, dass das Verstehen leicht fließt: Selbst schwierige Aufgaben wirken machbar.", lo: "Der schmale Raum zwischen deinen Brauen steht für präzises, sorgfältiges Denken: weniger Flüchtigkeitsfehler." },
    browEye: { hi: "Der großzügige Abstand zwischen Brauen und Augen bedeutet einen ruhigen Geist: Du bleibst im Prüfungsraum gelassen.", lo: "Der geringe Abstand zwischen Brauen und Augen zeigt intensive Konzentration: Du bist super im Last-Minute-Lernen." },
    symmetry: { hi: "Dein ausgewogenes Gesicht gilt als Zeichen eines geordneten Geistes: stark in Logik, Mathe und strukturierten Fächern.", lo: "" },
    ear: { hi: "Deine starke Ohren-Energie macht dich zu einem tollen Zuhörer: Du nimmst aus Unterricht und Vorträgen viel mit.", lo: "" },
  },
  career: {
    upper: { hi: "Deine offene Stirn (der Palast der Karriere) lässt dich glänzen, wann immer du bewertet wirst. In Prüfungen und Vorstellungsgesprächen zeigst du mehr, als du vorbereitet hast.", lo: "Deine kompakte Stirn kommt mit echten Praxisfähigkeiten. Du glänzt im Einsatz, in der Praxis und im Handeln, nicht nur auf dem Papier." },
    browLen: { hi: "Deine langen Brauen ziehen Mentoren und Erfahrene an, die helfen wollen: Empfehlungen und Kontakte öffnen dir tolle Türen.", lo: "Deine gepflegten Brauen zeigen jemanden, der sich durch reines Können beweist. Lass deine Arbeit für dich sprechen." },
    browEye: { hi: "Der großzügige Abstand zwischen Brauen und Augen gibt dir einen entspannten, offenen Ausdruck: Wer dich interviewt, denkt „mit diesem Menschen will ich arbeiten“.", lo: "Der geringe Abstand zwischen Brauen und Augen steht für intensive Konzentration. Du lieferst unter Druck schnell Ergebnisse." },
    eyeTilt: { hi: "Deine wache, gehobene Augenform sagt: „Dieser Mensch bringt Dinge voran.“", lo: "Deine sanften Augen schaffen Vertrauen: Du wirkst wie ein großartiger Teamplayer." },
    symmetry: { hi: "Dein wunderbar ausgewogenes Gesicht strahlt vom ersten Eindruck an Stabilität und Vertrauen aus.", lo: "" },
    glabella: { hi: "Dein offener Palast des Schicksals bedeutet Wege, die sich ohne Hindernisse öffnen.", lo: "Der schmale Raum zwischen deinen Brauen deutet auf sorgfältiges, gründliches Urteilen." },
  },
  health: {
    symmetry: { hi: "Dein Gesicht ist von links nach rechts wunderbar ausgewogen: ein Zeichen für stabile, gut fließende Energie.", lo: "" },
    glabella: { hi: "Der offene Raum zwischen deinen Brauen zeigt jemanden, der Stress loslässt, statt ihn festzuhalten.", lo: "Wenn du zu viel grübelst, kann sich Anspannung in Nacken und Schultern festsetzen: Mach Dehnen zur täglichen Gewohnheit." },
    noseLen: { hi: "Dein langer, glatter Nasenrücken bedeutet einen starken Palast der Gesundheit.", lo: "Deine kompakte Nase bringt schnelle Erholung mit sich. Ruh dich gut aus, und du bist sofort wieder fit." },
    philtrum: { hi: "Deine lange, deutliche Oberlippenrinne kommt dem nahe, was die Klassiker „das Zeichen der Langlebigkeit“ nennen.", lo: "Du verbrauchst deine Energie gern in großen Schüben: Regelmäßige Mahlzeiten sind dein geheimer Glücksschlüssel." },
    balance: { hi: "Deine Drei Zonen — Stirn, Nase, Kinn — sind wunderbar gleichmäßig. Die Klassiker schätzen das sehr: „ausgewogene Zonen, ein ruhiges Leben“.", lo: "Eine deiner Drei Zonen sticht hervor und gibt deinem Gesicht echten Charakter. Setz auf diese Stärke und halte einen stabilen Tagesrhythmus." },
  },
  business: {
    jawWidth: { hi: "Deine kräftige Kieferlinie zeigt einen stark ausgeprägten Palast des Teams: das klassische Chef-Gesicht mit treuen Mitarbeitern und Partnern.", lo: "Deine schlanke Kieferlinie blüht in leichten, schnellen Geschäftsmodellen auf: Solo-Gründer, Creator, Freelancer." },
    noseWidth: { hi: "Deine kräftige Nase verhindert, dass Firmengeld versickert: ein tolles Gespür für den Cashflow.", lo: "Deine feine Nase passt zu Unternehmen, die auf Ideen und Marke statt auf großem Kapital beruhen." },
    browThick: { hi: "Deine kräftigen Brauen zeigen echten Antrieb und Mut. Wenn andere zögern, legst du los.", lo: "Deine feinen Brauen lesen Gefühle und Details der Kunden: perfekt für Service, Design und Lifestyle-Marken." },
    browTilt: { hi: "Deine gehobenen „Schwertbrauen“ bedeuten, dass du nicht einknickst, wenn es darauf ankommt.", lo: "Deine weichen Brauen lassen Menschen entspannen: eine Geheimwaffe am Verhandlungstisch." },
    mouthWidth: { hi: "Dein großzügiger Mund gibt deinen Worten Kraft: ideal für Vertrieb, Pitches und Finanzierungsrunden.", lo: "Dein feiner Mund ist das Zeichen eines Gründers, der Wort hält." },
    noseLen: { hi: "Dein langer Nasenrücken zeigt die Ausdauer, langfristige Projekte bis ins Ziel zu bringen.", lo: "" },
  },
  honor: {
    upper: { hi: "Deine offene Stirn erhellt deinen Palast der Karriere: In jeder Organisation wird dein Name früh bekannt.", lo: "Deine kompakte Stirn bedeutet Anerkennung, die durch Können verdient wird, und die bleibt." },
    noseLen: { hi: "Deine gerade, anmutige Nase zeigt Stolz und Würde: Die Klassiker nennen sie „die Nase, die einen Namen macht“.", lo: "Deine freundliche Nase zieht Beliebtheit und breite Sympathie an." },
    browLen: { hi: "Deine langen Brauen helfen, dass dein Ruf weit reicht.", lo: "" },
    glabella: { hi: "Dein offener Palast des Schicksals bedeutet, dass mächtige Förderer deinen Namen noch höher tragen.", lo: "" },
    eyeTilt: { hi: "Deine gehobenen Augenwinkel zeigen Ehrgeiz und Zielstrebigkeit: Du kletterst immer weiter.", lo: "" },
    symmetry: { hi: "Dein ausgewogenes Gesicht wirkt fair und vertrauenswürdig: echte Führungsenergie.", lo: "" },
  },
  children: {
    philtrum: { hi: "Deine lange, deutliche Oberlippenrinne deutet auf eine blühende, gesunde Familie und tiefe Bindungen zu Kindern.", lo: "Deine kurze Oberlippenrinne bedeutet ein ewig junges Herz: die Art Mama, Papa, Tante oder Onkel, die zugleich beste Freunde sind." },
    lipThick: { hi: "Deine vollen Lippen zeigen ein warmes Herz, das die ganze Familie zusammenhält.", lo: "Deine konturierten Lippen deuten auf jemanden, der Kinder mit klarer, liebevoller Struktur großzieht." },
    chinLen: { hi: "Dein kräftiges Kinn gilt als Zeichen einer engen, fürsorglichen Familie im späteren Leben.", lo: "Dein feines Kinn deutet auf die stilvolle, lustige Person in der Familie, zu der alle aufschauen." },
    lower: { hi: "Dein volles Untergesicht deutet auf ein glückliches Zuhause, das immer voller Lachen ist.", lo: "" },
    eyeOpen: { hi: "Deine hellen, klaren Augen verleihen deinem Palast der Familie zusätzlichen Glanz.", lo: "" },
  },
  people: {
    mouthCorner: { hi: "Dein „Mondsichel-Mund“ zieht Menschen an, selbst wenn du es gar nicht versuchst.", lo: "Dein ruhiger Mund gewinnt Vertrauen: Du bist der Freund, den man ein Leben lang behält." },
    smile: { hi: "Dein strahlendes Lächeln ist ein Menschenmagnet. Schon beim Blick auf dein Foto bekommen alle gute Laune.", lo: "" },
    eyeGap: { hi: "Deine weit stehenden Augen zeigen ein offenes, annehmendes Herz.", lo: "Deine enger stehenden Augen bedeuten, dass du dich intensiv um jeden Freund kümmerst: treu bis ins Mark." },
    glabella: { hi: "Der offene Raum zwischen deinen Brauen zeigt ein großes Herz, das nicht nachtragend ist.", lo: "Der schmale Raum zwischen deinen Brauen geht mit rücksichtsvoller, aufmerksamer Fürsorge für andere einher." },
    browLen: { hi: "Lange Brauen bedeuten einen vollen Palast der Freunde: gute Freunde an deiner Seite, ein Leben lang.", lo: "Gepflegte Brauen bedeuten einen kleinen, eng verbundenen Kreis, der durch dick und dünn geht." },
    jawWidth: { hi: "Deine kräftige Kieferlinie bringt „Führungsglück“: Viele Menschen schauen zu dir auf.", lo: "" },
  },
};

// Glow-up-Tipps (Make-up und Pflege) — passend zum Merkmal, das du betonen möchtest
export const MAKEUP_TIPS = {
  noseWidth: { lo: "Tupf ein wenig Highlighter auf die Nasenspitze: Er gibt deinem Palast des Reichtums Glanz und „öffnet die Tresortür“.", hi: "Eine feine Linie Highlighter mittig auf dem Nasenrücken gleicht deine Züge aus und wirkt elegant und gepflegt." },
  noseLen: { lo: "Ein Hauch Contouring oben am Nasenrücken lässt die Nase länger wirken und stärkt deine Säule der „besten Jahre“.", hi: "Etwas Schatten unter der Nasenspitze mildert einen langen Nasenrücken und wirkt nahbar." },
  mouthCorner: { lo: "Verlängere die äußeren Mundwinkel mit Lipliner um 1–2 mm nach oben. Das ist der einfachste Weg zum glücksbringenden „Mondsichel-Mund“!", hi: "Deine nach oben zeigenden Mundwinkel sind schon dein bestes Merkmal: Ein klarer Gloss für frischen Glanz genügt." },
  lipThick: { lo: "Trag einen helleren Ton nur in der Lippenmitte auf und verblende nach außen: sofort voller, wärmer, charmanter.", hi: "Ein „deine Lippen, nur besser“-Ton mit leicht weichgezeichneten Rändern lässt volle Lippen noch schicker wirken." },
  browLen: { lo: "Verlängere deine Brauenenden knapp über den äußeren Augenwinkel hinaus. Das erweitert deinen Palast der Freunde: Hallo, mehr gute Menschen!", hi: "Lange Brauen brauchen nur ordentliche Enden. Mit etwas Brauengel nach oben gebürstet wirken sie klar." },
  browThick: { lo: "Füll lichte Stellen mit feinen, haarähnlichen Stiftstrichen, um Willenskraft und Antrieb auszustrahlen.", hi: "Zupf bei kräftigen Brauen nur die Unterseite und bürste sie mit klarem Gel nach oben: Aus Kraft wird Eleganz." },
  browTilt: { lo: "Heb den Brauenbogen leicht an, für einen entschlosseneren, selbstbewussteren Look.", hi: "Zeichne die Brauenenden etwas flacher, um einen starken Ausdruck zu mildern und nahbarer zu wirken." },
  eyeOpen: { lo: "Bieg die Wimpern am Ansatz und gib etwas braunen Lidschatten an den äußeren unteren Wimpernkranz: Dein Inspektor öffnet sich sofort.", hi: "Große Augen brauchen nur einen feinen Lidstrich. Ein Hauch Schimmer direkt unter dem Auge stärkt deine Paläste der Familie und der Liebe." },
  eyeTilt: { lo: "Zieh den Lidstrich am äußeren Augenwinkel leicht nach oben, für einen wachen, klugen Blick.", hi: "Lass den Lidstrich gerade auslaufen und gib etwas Schatten an die unteren Wimpern, für einen weicheren Blick." },
  glabella: { lo: "Zupf den inneren Brauenanfang um 1–2 mm, um deinen Palast des Schicksals zu öffnen. Die Klassiker sagen, ein offener Raum zwischen den Brauen lässt das Glück fließen.", hi: "Lass den offenen Raum zwischen deinen Brauen, wie er ist: Ein Hauch Contouring an der Nase gibt Fokus und Kontur." },
  upper: { lo: "Probier einen Seitenscheitel oder eine Frisur, die etwas Stirn zeigt, um deinen Palast der Karriere zu erhellen.", hi: "Ein weicher, luftiger Pony oder leichtes Contouring am Haaransatz rahmt eine weite Stirn wunderschön ein." },
  jawWidth: { lo: "Etwas Contouring unter der Kieferlinie gibt Kontur und eine selbstbewusste Note.", hi: "Contoure nur die Kieferwinkel unter den Ohren, damit eine kräftige Kieferlinie schlank und modelliert wirkt." },
  smile: { lo: "Lächle auf Fotos zuerst mit den Augen, statt „Cheese“ zu sagen. Die Klassiker sagen, echtes Glück kommt, wenn deine Augen lächeln.", hi: "Dein strahlendes Lächeln ist das ultimative Glow-up! Etwas korallfarbenes Rouge hoch auf den Wangen sorgt für extra Strahlen." },
  philtrum: { lo: "Betone deinen Amorbogen mit Lipliner, damit deine Oberlippenrinne klar und deutlich wirkt.", hi: "Umrande deine Oberlippe ganz leicht über den Rand hinaus, um eine lange Oberlippenrinne auszugleichen." },
  symmetry: { lo: "Wechsle mal den Scheitel oder zeichne die tiefer liegende Braue etwas höher, um beide Seiten auszugleichen.", hi: "Ein ausgewogenes Gesicht sieht mit natürlichem No-Make-up-Make-up am besten aus." },
};

export const METRIC_LABELS = {
  eyeSize: "Augenbreite", eyeOpen: "Augenöffnung", eyeTilt: "Gehobene Augenwinkel", eyeGap: "Augenabstand",
  browLen: "Brauenlänge", browThick: "Brauendichte", browTilt: "Brauenbogen", browEye: "Abstand Braue–Auge",
  glabella: "Palast des Schicksals (Brauenzwischenraum)", noseWidth: "Fülle der Nase", noseLen: "Länge des Nasenrückens", mouthWidth: "Mundbreite",
  mouthCorner: "Gehobene Mundwinkel", lipThick: "Lippenfülle", philtrum: "Länge der Oberlippenrinne", chinLen: "Kinnlänge",
  jawWidth: "Kieferbreite", faceRatio: "Gesichtslänge", upper: "Obere Zone (Stirn)", middle: "Mittlere Zone (Brauen–Nase)",
  lower: "Untere Zone (Nase–Kinn)", symmetry: "Symmetrie", smile: "Lächel-Wert",
};

// Kurze Merkmalsnamen für Sätze (ohne Artikel, damit keine Beugung nötig ist)
export const FEATURE_NAMES = {
  eyeOpen: "Augen", eyeTilt: "Augenform", eyeGap: "Augenabstand", browLen: "Augenbrauen", browThick: "Augenbrauen",
  browTilt: "Brauenbogen", browEye: "Abstand Braue–Auge", glabella: "Palast des Schicksals", noseWidth: "Nase",
  noseLen: "Nasenrücken", mouthWidth: "Mund", mouthCorner: "Lächellinie", lipThick: "Lippen",
  philtrum: "Oberlippenrinne", chinLen: "Kinn", jawWidth: "Kieferlinie", upper: "Stirn", lower: "Untergesicht",
  symmetry: "Symmetrie", smile: "Lächeln",
};

// Aufhänger-Sätze — das Erste, was im Ergebnis erscheint
export const HOOKS = {
  wealth: ["Okay, das ist nicht nur eine Nase. Das ist ein Tresor. 💰", "Dein Geldbeutel hat dieses Gesicht vor dir erkannt!", "Geldmagnet-Energie entdeckt. 💸"],
  love: ["Diese Augen … irgendwo schlägt gerade ein Herz schneller. 💘", "Mal ehrlich: Du bekommst ziemlich viel Aufmerksamkeit, oder?", "Zertifiziertes Herzensbrecher-Gesicht. 💞"],
  marriage: ["Dieses Gesicht sagt „glücklich bis ans Ende“. 💍", "Partnerglück steht diesem Gesicht ins Gesicht geschrieben!", "Seelenverwandten-Magnet-Energie entdeckt. 💞"],
  study: ["Schlaukopf-Energie, direkt auf deiner Stirn. 📚", "Die Art Gesicht, die jeder Lehrer gern in der Klasse hatte!", "Einser-Schüler-Vibes, ohne Diskussion. 🧠"],
  career: ["Die Stirn, von der Personaler träumen. 🎓", "Dieses Gesicht ist fürs Eckbüro gemacht!", "„Sie sind eingestellt“-Energie, laut und deutlich. 💼"],
  health: ["So eine Balance? Lange nicht gesehen. 🌿", "Hauptfiguren-Energie mit voller Lebensleiste!", "Dein Gesicht sagt „gebaut für die Ewigkeit“. 💪"],
  business: ["Diese Kieferlinie nennt dich „Chef“. 🚀", "Dieses Gesicht gehört auf eine Gründer-Seite!", "CEO-Energie. Mehr gibt's nicht zu sagen. 👔"],
  honor: ["Dieses Gesicht wird berühmt. 👑", "Wo du auch hinkommst, du bist „diese Person“, an die man sich erinnert!", "Dein Name in Leuchtschrift: Das Gesicht ist einverstanden. ✨"],
  children: ["Dieses Gesicht füllt ein Zuhause mit Lachen. 🏡", "Dein Palast der Familie strahlt richtig!", "Energie des wärmsten Herzens im Raum. 💗"],
  people: ["Ein Gesicht, zu dem es Menschen magnetisch hinzieht. 🤝", "Für dieses Gesicht stehen die Glückshelfer Schlange!", "Jedermanns Lieblingsmensch, und das Gesicht zeigt es. 🌟"],
};

// ---------------------------------------------------------------------
// Personalisierung nach Geschlecht und Alter
// Die „fließenden Jahre“ (流年運氣) des Ma Yi Shen Xiang: Mit dem Alter wandert das Glück im Gesicht nach unten.
//   15–30 Stirn → 31–40 Brauen und Augen → 41–50 Nase und Wangenknochen → 51–60 Oberlippenrinne und Mund → 61+ Kinn
// ---------------------------------------------------------------------
export const GENDERS = { "": "Keine Angabe", f: "Frau", m: "Mann" };
const GENDER_NOUN = { f: "Frau", m: "Mann" };
export const genderNoun = (g) => GENDER_NOUN[g] || "";

export const AGE_GROUPS = {
  "": { label: "Keine Angabe" },
  "20": { label: "Unter 30", phrase: "unter 30", stage: "early", career: "Prüfungen und erster Job", children: "Familienglück",
    place: "deiner Stirn (obere Zone)", keys: ["upper"], years: "15–30 Jahre",
    hi: "Und deine Stirn — genau dort, wo dein Glück gerade sitzt — ist breit und hell. Das ist die Zeit der „ersten Schritte“ (Studium, Prüfungen, dein erster richtiger Job), und Mentoren stehen Schlange, um dir zu helfen.",
    lo: "Deine Stirn ist kompakt, das heißt, dein Glück öffnet sich, wenn du durch Tun lernst statt am Schreibtisch. Praktika, Nebenprojekte und Reisen sind gerade deine Glücksbooster.",
    mid: "Deine Stirn ist schön ausgewogen, also wird in diesem Lebensabschnitt beständiger Einsatz direkt zu Ergebnissen." },
  "30": { label: "30–39", phrase: "in den 30ern", stage: "mid", career: "Karriere und Beförderung", children: "Familienglück",
    place: "deiner Augenbrauen und Augen", keys: ["browLen", "eyeOpen"], years: "31–40 Jahre",
    hi: "Und deine Brauen und Augen — wo dein Glück gerade wohnt — sind wunderbar ausdrucksstark. Deine Menschenkenntnis und dein Netzwerk öffnen sich gleichzeitig: eine tolle Zeit, um wichtige Kollegen, Partner und Mitgründer kennenzulernen.",
    lo: "Deine Brauen und Augen sind ruhig und gefasst, also wächst du eher durch tiefes Vertrauen als durch ein riesiges Netzwerk. Vertiefe dich in ein Gebiet, und Ende 30 bist du die Expertin oder der Experte, die alle anrufen.",
    mid: "Deine Brauen und Augen sind gut ausgewogen: perfekt, um in diesem Abschnitt Beruf und Familie souverän unter einen Hut zu bringen." },
  "40": { label: "40–49", phrase: "in den 40ern", stage: "mid", career: "Karriere und Beförderung", children: "Familienglück",
    place: "deiner Nase und Wangenknochen", keys: ["noseLen", "noseWidth"], years: "41–50 Jahre",
    hi: "Und deine Nase — der Palast des Reichtums, wo dein Glück gerade liegt — ist kräftig! Gesichtsleser nennen die 40er „das Jahrzehnt der Nase“, in dem sich Geld und Status am stärksten bewegen. Dein Timing ist perfekt: Jetzt ist die Zeit, Gas zu geben.",
    lo: "Deine Nase ist schmal und fein, also wächst dein Glück, indem du Bestehendes stärkst, statt dich zu übernehmen. Ordne deine Ausgaben und schärfe dein Fachwissen: Die späten 40er belohnen dich reichlich.",
    mid: "Deine Nase verankert die Mitte deines Gesichts gut und deutet in diesem Abschnitt auf einen stetigen Fluss von Geld und Arbeit." },
  "50": { label: "50–59", phrase: "in den 50ern", stage: "late", career: "Sinn und zweiter Akt", children: "Familie und Vermächtnis",
    place: "deiner Oberlippenrinne und deines Mundes", keys: ["philtrum", "mouthCorner"], years: "51–60 Jahre",
    hi: "Und deine Oberlippenrinne und dein Mund — wo dein Glück gerade liegt — sehen fantastisch aus. Eine deutliche Rinne und gehobene Mundwinkel bringen Gesundheit, gutes Essen und die Gabe, Menschen mit einem einzigen Wort zusammenzubringen.",
    lo: "Dein Mund ruht in einer ruhigen Linie, die deinen Worten echtes Gewicht gibt. Gesichtsleser sagen, öfter zu lächeln lässt die 50er enorm aufleuchten: Also lass dieses Lächeln raus!",
    mid: "Deine Oberlippenrinne und dein Mund sind schön ausgewogen und deuten auf einen angenehmen Lebensrhythmus und ein friedliches Zuhause." },
  "60": { label: "60+", phrase: "ab 60", stage: "late", career: "Sinn und zweiter Akt", children: "Enkel und Vermächtnis",
    place: "deines Kinns", keys: ["chinLen", "jawWidth"], years: "ab 61 Jahren",
    hi: "Und dein Kinn — wo dein Glück jetzt wohnt — ist voll und kräftig. Das Kinn ist der „Boden“ des späteren Lebens, also ist dies das Gesicht eines Menschen, der die Liebe seiner Familie und den Respekt der jüngeren Generationen genießt.",
    lo: "Dein Kinn ist fein und elegant: Du bleibst ein Leben lang jung im Geist. Je mehr du weiterlernst und neue Hobbys entdeckst, desto weiter wird dein Glück.",
    mid: "Dein Kinn stützt dein Gesicht mit einer stabilen Linie und deutet auf einen gesunden, friedlichen Abschnitt." },
};

// Ein Zusatzsatz pro Glücksbereich je nach Lebensphase (early: unter 30, mid: 30–49, late: 50+)
export const AGE_LINES = {
  wealth: { early: "Gerade geht es weniger um das große Geld als um Rücklagen und kluge Geldgewohnheiten.", mid: "Jetzt ist die Zeit, Erspartes wachsen zu lassen und eine solide Basis aufzubauen: Zuhause, Anlagen, Vermögen.", late: "Jetzt geht es darum, Aufgebautes zu schützen und eine sorglose, angenehme Zukunft zu genießen." },
  love: { early: "Neue Begegnungen kommen auf dich zu: Sag öfter Ja zu Einladungen.", mid: "Dein Liebesglück ist jetzt das Vertrauen zu dem Menschen an deiner Seite. Kleine Gesten bewirken viel.", late: "Deine Verbindung zu deinem Partner und zu alten Freunden strahlt jetzt am hellsten. Geht öfter zusammen spazieren." },
  marriage: { early: "Dein Glück, einen Partner fürs Leben zu finden, steht weit offen. Kein Grund zur Eile: Der richtige Mensch ist unterwegs.", mid: "Das ist die Zeit, gemeinsam ein Zuhause aufzubauen. Schützt eure Zweisamkeit, auch wenn das Leben voll ist.", late: "Die Jahre gemeinsamer Geschichte sind jetzt euer größter Schatz. Zusammen spazieren und lachen ist die beste Medizin." },
  career: { early: "Dein Glück konzentriert sich auf Momente, in denen du „bewertet“ wirst: Prüfungen, Vorstellungsgespräche und dein erster Job.", mid: "An großen Weggabelungen — Beförderungen, Jobwechsel, Selbstständigkeit — ist die Energie deines Gesichts auf deiner Seite.", late: "Das Glück steht offen, deine Erfahrung weiterzugeben, Mentor zu sein und einen sinnvollen zweiten Akt zu finden." },
  study: { early: "Dein Glück liegt im Aufbau von Fähigkeiten: Prüfungen, Zertifikate, Abschlüsse. Was du jetzt investierst, zahlt sich ein Leben lang aus.", mid: "Eine tolle Zeit, ein neues Gebiet zu lernen oder einen beruflichen Abschluss zu machen, und auch, das Lernen deiner Kinder zu begleiten.", late: "Dein Glück beim lebenslangen Lernen strahlt. Fang ein neues Hobby oder einen Kurs an und bleib jung in Kopf und Herz." },
  health: { early: "Die Schlaf- und Sportgewohnheiten, die du jetzt aufbaust, sind dein Gesundheitssparkonto fürs Leben.", mid: "Je voller dein Kalender, desto mehr solltest du auf Nacken, Schultern und Verdauung achten. Lass keine Vorsorge aus.", late: "Tägliche Spaziergänge und leichtes Krafttraining sind deine besten Glücksbooster. Lachen ist Medizin." },
  business: { early: "„Klein anfangen, schnell lernen“ ist gerade dein Gewinnerstil im Business.", mid: "Menschen und Kapital kommen zusammen: ein tolles Timing für Wachstum und Partnerschaften.", late: "Stabile Projekte auf Basis von Vertrauen und Erfahrung passen besser zu dir als riskante Expansion." },
  honor: { early: "Chancen, dir einen Namen zu machen, kommen früh: Lass die kleinen nicht liegen.", mid: "Dein Name steigt in deiner Branche und deinem Umfeld. Scheu dich nicht vor Führungsrollen.", late: "Du trittst in die Zeit der respektierten Älteren ein. Deine Weisheit zu teilen, hebt deinen Namen noch höher." },
  children: { early: "Dein künftiges Familienglück ist hell: Gute Begegnungen führen zu einer glücklichen Familie.", mid: "Mit deinen Kindern (oder den Kindern in deinem Leben) zu lachen, bringt deinen Palast der Familie zum Leuchten.", late: "Dies ist das Gesicht eines Menschen, der den Erfolg seiner Familie und die Freude an Enkeln genießt." },
  people: { early: "Du triffst gerade Freunde und Mentoren, die dich ein Leben lang begleiten werden.", mid: "Menschen, die du bei der Arbeit triffst, werden zu deinen Glückshelfern. Grüß zuerst.", late: "Langjährige Freunde sind jetzt deine stärkste Stütze. Teilt bei jedem Treffen das Lachen." },
};

// Pflegetipps für Männer (gleiche Struktur wie MAKEUP_TIPS)
export const GROOMING_TIPS = {
  noseWidth: { lo: "Halte die Haut um die Nase frei von Fett und Schüppchen. Eine saubere, klare Nasenspitze soll dein Geldglück aufhellen.", hi: "Einfache Hautpflege rund um die Nase lässt eine kräftige Nase noch markanter wirken." },
  noseLen: { lo: "Probier einen kürzeren Pony oder eine etwas hochgestylte Frisur, um die vertikalen Linien deines Gesichts zu betonen: Die Nase wirkt länger, und deine Säule der „besten Jahre“ steht aufrecht.", hi: "Etwas Volumen an den Seiten mildert ein langes Gesicht und einen langen Nasenrücken." },
  mouthCorner: { lo: "Nutze Lippenbalsam und übe, die Mundwinkel leicht anzuheben. Der glücksbringende „Mondsichel-Mund“ lässt sich mit Mimik aufbauen!", hi: "Deine nach oben zeigenden Mundwinkel sind dein bester Trumpf: Pass nur auf, dass die Lippen nicht rissig werden." },
  lipThick: { lo: "Ein klarer Lippenbalsam sorgt für gesunden Glanz und einen wärmeren, freundlicheren Eindruck.", hi: "Halt deine Lippen einfach glatt und gepflegt: Volle Lippen wirken gesund und vertrauenswürdig." },
  browLen: { lo: "Schneide die Brauenenden nicht ab: Lass sie wachsen. Brauen, die länger als die Augen sind, sollen mehr Glück mit Freunden und Familie bringen.", hi: "Lange Brauen brauchen nur das Entfernen ein paar abstehender Härchen." },
  browThick: { lo: "Ein Brauenserum oder ein leichter Strich mit dem Brauenstift zum Füllen von Lücken strahlt Willenskraft und Antrieb aus.", hi: "Entferne bei kräftigen Brauen nur die abstehenden Härchen darunter: Aus rau wird kultiviert." },
  browTilt: { lo: "Zupf die Härchen unter dem Brauenbogen, um ihn zu betonen: sofort entschlossener.", hi: "Kürze ein wenig über den Brauenenden, um einen starken Ausdruck zu mildern und nahbarer zu wirken." },
  eyeOpen: { lo: "Schlaf genug und nutze kalte Kompressen gegen Schwellungen. Klare Augen „öffnen“ deinen Inspektor.", hi: "Große Augen wirken voller Energie, sobald du dich um Augenringe kümmerst." },
  eyeTilt: { lo: "Wenn du eine Brille trägst, probier Gestelle, die außen leicht ansteigen, für einen wachen, selbstbewussten Look.", hi: "Rundere Gestelle oder ein entspannter Ausdruck machen aus einem scharfen Blick einen warmen." },
  glabella: { lo: "Entferne die Härchen zwischen den Brauen und versuch, dir das Stirnrunzeln abzugewöhnen. Ein offener Palast des Schicksals lässt das Glück fließen.", hi: "Lass den offenen Raum zwischen deinen Brauen, wie er ist: Vermeide nur Zornesfalten." },
  upper: { lo: "Trag dein Haar nach oben gestylt oder kurz, um deine Stirn (den Palast der Karriere) zu zeigen, besonders bei Vorstellungsgesprächen und wichtigen Terminen.", hi: "Ein etwas tieferer Pony mildert eine breite Stirn und gleicht deine Züge aus." },
  jawWidth: { lo: "Eine saubere, gründliche Rasur, die die Kieferlinie zeigt, verleiht eine starke, selbstbewusste Note.", hi: "Kurze Seiten mit Volumen oben gleichen eine kräftige Kieferlinie perfekt aus." },
  smile: { lo: "Lächle auf Fotos zuerst mit den Augen. Die Klassiker sagen, echtes Glück kommt, wenn deine Augen lächeln.", hi: "Dein strahlendes Lächeln ist dein bester Glücksbringer: Gute Zahnpflege lässt es noch mehr strahlen." },
  philtrum: { lo: "Eine saubere Rasur über der Lippe lässt deine Oberlippenrinne klar und gesund wirken.", hi: "Eine deutliche Oberlippenrinne kommt schon mit einer sauberen Rasur zur Geltung." },
  symmetry: { lo: "Wechsle mal den Scheitel oder zupf die tiefer liegende Braue leicht, um beide Seiten auszugleichen.", hi: "Ein ausgewogenes Gesicht sieht mit einem sauberen Haarschnitt und frischer Rasur am besten aus." },
};
