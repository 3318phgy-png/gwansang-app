// =====================================================================
//  content.js — Base de datos de lecturas de MyFaceFate (edición en español)
//  Inspirada en los tres grandes clásicos de la lectura del rostro china (Mian Xiang 面相):
//   1) Ma Yi Shen Xiang (麻衣神相) — dinastía Song. El texto raíz de los Cinco Oficiales,
//      las Tres Zonas y los Doce Palacios.
//   2) Liu Zhuang Xiang Fa (柳莊相法) — dinastía Ming, de Yuan Gong y su hijo Yuan Zhongche.
//      Famoso por leer el "qi": brillo, expresión y espíritu.
//   3) Shen Xiang Quan Bian (神相全編) — enciclopedia Ming que clasificó los rostros en los
//      Cinco Elementos (Madera, Fuego, Tierra, Metal, Agua).
//  NOTA: todo es una reinterpretación moderna y positiva, no citas literales.
//  Reglas de tono: siempre amable, nunca burlarse del aspecto, nunca mencionar raza ni etnia.
//  Cada rasgo se describe como una fortaleza. Solo para entretenimiento.
// =====================================================================

export const BOOKS = [
  {
    id: "mayi",
    name: "Ma Yi Shen Xiang",
    hanja: "麻衣神相",
    era: "Dinastía Song · siglo X aprox.",
    color: "#ff6f91",
    desc: "Cuenta la leyenda que un ermitaño conocido solo como el \"Maestro de la Túnica de Cáñamo\" (Ma Yi) le transmitió sus secretos al sabio taoísta Chen Tuan en una cueva de la montaña. De ahí nació la columna vertebral de la lectura del rostro: los Cinco Oficiales, las Tres Zonas y los Doce Palacios. Cada vez que oyes \"la nariz es tu caja fuerte\", la idea empezó aquí.",
    key: ["Cinco Oficiales", "Tres Zonas", "Doce Palacios"],
  },
  {
    id: "liuzhuang",
    name: "Liu Zhuang Xiang Fa",
    hanja: "柳莊相法",
    era: "Dinastía Ming · siglo XV aprox.",
    color: "#2fc4b2",
    desc: "Escrito por Yuan Gong —el lector de rostros personal del emperador— y su hijo. En lugar de mirar solo los rasgos fijos, lee el rostro vivo: el brillo, la expresión, la postura y la chispa de los ojos. Su gran mensaje es optimista: tu rostro cambia con tus hábitos, así que tu suerte también puede cambiar.",
    key: ["Qi y brillo", "El espíritu de los ojos", "Lecturas de la vida real"],
  },
  {
    id: "shenxiang",
    name: "Shen Xiang Quan Bian",
    hanja: "神相全編",
    era: "Dinastía Ming · siglo XVI aprox.",
    color: "#f2b443",
    desc: "La \"Enciclopedia completa de la lectura del rostro\". Reunió lo mejor de todos los textos anteriores y clasificó los rostros según los Cinco Elementos —Madera, Fuego, Tierra, Metal y Agua—, además de decenas de tipos de ojos, narices, cejas y labios. Durante siglos fue el libro de texto de referencia de los lectores de rostros en todo el este de Asia.",
    key: ["Rostros de los Cinco Elementos", "Tipos de rasgos", "La visión de conjunto"],
  },
];

// Los Cinco Oficiales (五官)
export const FIVE_ORGANS = {
  ear: { name: "Orejas", title: "El Oyente · 採聽官", role: "Bendiciones de nacimiento, suerte en la infancia y una vida larga y sana" },
  brow: { name: "Cejas", title: "El Guardián · 保壽官", role: "Emociones, amistades, hermanos y tu círculo de apoyo" },
  eye: { name: "Ojos", title: "El Inspector · 監察官", role: "Ventanas del alma: sabiduría, intuición y criterio" },
  nose: { name: "Nariz", title: "El Juez · 審辨官", role: "Tu caja fuerte: empuje, confianza y flujo de dinero" },
  mouth: { name: "Boca", title: "El Guardián de la Puerta · 出納官", role: "Palabras y buena comida: encanto, confianza y generosidad" },
};

// Los Doce Palacios (十二宮) — mapa del rostro (x, y en una cuadrícula SVG de 0–100)
export const PALACES = [
  { id: "destiny", name: "Destino", hanja: "命宮", place: "Entre las cejas", x: 50, y: 36, meaning: "El centro de mando de tu destino. Un espacio liso y abierto aquí significa una mente abierta: las cosas parecen fluir a tu favor." },
  { id: "wealth", name: "Riqueza", hanja: "財帛宮", place: "La nariz (punta y aletas)", x: 50, y: 57, meaning: "Tu caja fuerte. Se dice que una punta redondeada y unas aletas llenas evitan que el dinero que entra se escape." },
  { id: "siblings", name: "Amigos", hanja: "兄弟宮", place: "Las cejas", x: 30, y: 33, meaning: "Hermanos, amigos y compañeros de trabajo. Unas cejas ordenadas y fluidas significan mucha gente de tu lado." },
  { id: "property", name: "Hogar", hanja: "田宅宮", place: "Entre la ceja y el ojo", x: 66, y: 36.5, meaning: "Hogar, propiedades y estabilidad familiar. Un espacio amplio aquí indica un carácter relajado y generoso." },
  { id: "children", name: "Familia", hanja: "子女宮", place: "Debajo de los ojos", x: 34, y: 47, below: true, meaning: "Hijos, alegría y vitalidad. Una zona suave y luminosa bajo los ojos se asocia con una cálida suerte familiar y un encanto natural." },
  { id: "helpers", name: "Equipo", hanja: "奴僕宮", place: "Los lados de la barbilla", x: 30, y: 84, meaning: "Tu equipo, tus clientes y quienes te apoyan. Una zona firme en la barbilla significa que a la gente le encanta seguirte." },
  { id: "romance", name: "Romance", hanja: "夫妻宮", place: "Rabillo exterior del ojo", x: 80, y: 44, below: true, meaning: "Amor y pareja. Una piel lisa y luminosa aquí apunta a una vida amorosa feliz y armoniosa." },
  { id: "health", name: "Salud", hanja: "疾厄宮", place: "Puente de la nariz", x: 50, y: 44, meaning: "Energía y resistencia. Se dice que un puente nasal liso y continuo significa menos achaques." },
  { id: "travel", name: "Viajes", hanja: "遷移宮", place: "Sienes (bordes de la frente)", x: 20, y: 22, meaning: "Viajes, mudanzas y suerte en el extranjero. Unas sienes llenas significan que las oportunidades te encuentran lejos de casa." },
  { id: "career", name: "Carrera", hanja: "官祿宮", place: "Centro de la frente", x: 50, y: 20, meaning: "Carrera, ascensos y reputación. Un centro de la frente despejado es la señal clásica de \"el jefe se fija en ti\"." },
  { id: "fortune", name: "Bendiciones", hanja: "福德宮", place: "Encima de la cola de la ceja", x: 78, y: 25, meaning: "Buena fortuna innata y paz interior. La plenitud aquí significa bendiciones que duran toda la vida." },
  { id: "parents", name: "Padres", hanja: "父母宮", place: "Esquinas superiores de la frente", x: 38, y: 13, meaning: "Padres, mentores y mayores. Una frente superior luminosa significa apoyo de las personas que están por encima de ti." },
];

// Formas de rostro de los Cinco Elementos — del Shen Xiang Quan Bian
export const FACE_SHAPES = {
  wood: { name: "Rostro Madera", alias: "El Visionario", emoji: "🌳", color: "#4caf7a",
    text: "Tu rostro largo y elegante es lo que los clásicos llaman un rostro Madera. Como un árbol que crece hacia el cielo, te mueven los grandes ideales y el amor por aprender y crecer. Brillas en todo lo que ayuda a que algo crezca —ideas, equipos, alumnos, proyectos— y te vuelves más impresionante con cada año que pasa. Un auténtico \"floreces tarde\", en el mejor sentido." },
  fire: { name: "Rostro Fuego", alias: "La Chispa", emoji: "🔥", color: "#ef5b5b",
    text: "Frente y pómulos anchos que se estrechan con elegancia hacia la barbilla: eso es un rostro Fuego. Como una llama, tu mente es rápida y tus sentidos agudos, así que las ideas y la expresión personal te salen solas. Arte, contenido, marketing, cualquier cosa donde ir un paso por delante importa: ahí es donde los rostros Fuego iluminan la sala." },
  earth: { name: "Rostro Tierra", alias: "La Roca", emoji: "⛰️", color: "#c7923e",
    text: "Un rostro lleno y con los pies en la tierra, de contorno sólido y estable, es un rostro Tierra. Transmites una confianza profunda y serena que atrae de forma natural a las personas —y los recursos— hacia ti. Cuando empiezas algo, lo terminas; por eso los clásicos relacionan los rostros Tierra con el liderazgo, las finanzas y construir cosas que perduran." },
  metal: { name: "Rostro Metal", alias: "El Líder", emoji: "⚔️", color: "#8a94a6",
    text: "Una mandíbula definida y estructurada hace de este un rostro Metal. Como el acero pulido, tienes principios claros y un juicio rápido y decidido: cobras vida cuando estás al mando. Deporte, derecho, liderazgo, cualquier terreno con reglas claras y algo real en juego: ahí es donde los rostros Metal se ganan la corona." },
  water: { name: "Rostro Agua", alias: "El Encantador", emoji: "💧", color: "#4a8fe7",
    text: "Los contornos suaves y redondeados hacen de este un rostro Agua. Como el agua, te adaptas a cualquier situación con calidez y flexibilidad: ese es tu superpoder. La gente se siente cómoda contigo al instante, así que amigos, fans y golpes de suerte te siguen. Ventas, presentación, medios, todo lo que sea de cara al público es territorio de los rostros Agua." },
  balance: { name: "Rostro Equilibrado", alias: "El Todoterreno", emoji: "🥚", color: "#a77bd9",
    text: "Tu rostro ovalado tiene unas proporciones maravillosamente uniformes: en términos de los Cinco Elementos, ningún elemento domina. Los clásicos valoran el equilibrio por encima de todo, y este es el rostro de alguien que puede caer en cualquier situación y prosperar. Adaptable, completo y discretamente impresionante." },
};

// ---------------------------------------------------------------------
// Lecturas por rasgo — elegidas según el nivel medido (hi / mid / lo).
// Cada frase es positiva: "lo" nunca es malo, solo otra fortaleza.
// ---------------------------------------------------------------------
export const PART_READINGS = {
  forehead: {
    name: "Frente", organ: "Palacio de la Carrera · Zona de la Juventud", emoji: "🌅",
    intro: "Los lectores de rostros siempre miran primero la frente. Es la zona del \"Cielo\": guarda el tamaño de tus ideas, tu suerte con los mentores y tu fortuna aproximadamente entre los 15 y los 30 años.",
    outro: "Los palacios de los Padres, la Carrera, las Bendiciones y los Viajes viven aquí arriba; por eso se la llama \"el techo de tu suerte\". Consejo de los clásicos: en los días importantes, enseña un poco la frente en lugar de esconderla bajo el flequillo; se dice que abre la puerta a las oportunidades.",
    upper: {
      hi: "¡Tienes una frente maravillosamente amplia y despejada! En los clásicos esta es la Zona Superior, sede de la suerte temprana y la sabiduría. Una frente así pertenece a alguien de pensamiento rápido al que los mentores descubren pronto. Tu Palacio de la Carrera brilla, así que los exámenes, las entrevistas y todo lo que implique ser evaluado es tu escenario.",
      mid: "Tu frente tiene la proporción perfecta: ni mucho ni poco. Una Zona Superior equilibrada significa un buen comienzo en la vida y un gran equilibrio entre pensar y hacer. Eres del tipo \"inteligente pero práctico\": ni perdido en sueños, ni atrapado en la rutina.",
      lo: "Tu frente es compacta y bien definida. Los lectores de rostros ven aquí a la persona práctica: aprendes haciendo, no dándole mil vueltas. La suerte suele florecer a partir de los 30, así que la vida tiende a ir a mejor con el tiempo. Los mejores capítulos aún están por llegar.",
    },
  },
  brow: {
    name: "Cejas", organ: "El Guardián · Palacio de los Amigos", emoji: "〰️",
    intro: "Tus cejas son \"El Guardián\": revelan tus emociones, tu energía y a las personas que están a tu lado —hermanos, amigos y aliados—. También rigen tu suerte alrededor de los 31 a 34 años.",
    outro: "Dato curioso: las cejas son el único rasgo que realmente puedes remodelar, por eso los clásicos las llaman la forma más rápida de cambiar tu suerte. Mantenlas cuidadas y el espacio entre ellas despejado, y tu suerte con la gente recibe un impulso visible.",
    browLen: {
      hi: "Tus cejas se extienden más allá de tus ojos. Los clásicos dicen que las cejas que superan el ojo significan amigos leales y hermanos que ayudan, y se nota: sueles tener un círculo grande y solidario, y talento para conectar a las personas.",
      mid: "El largo de tus cejas encaja a la perfección con tus ojos. Tienes un don natural para las relaciones: cercano sin agobiar, independiente sin ser distante.",
      lo: "Tus cejas son cortas y ordenadas. Las personas con este rasgo son pioneras independientes: prefieres abrir tu propio camino a esperar ayuda, y tomas decisiones rápidas y limpias.",
    },
    browThick: {
      hi: "Tus cejas son pobladas y fuertes. Eso indica una energía poderosa y verdadero empuje: cuando te comprometes con algo, lo terminas.",
      mid: "Tus cejas tienen la densidad justa: suaves, pero con definición.",
      lo: "Tus cejas son finas y delicadas. Eso apunta a un alma sensible y artística que percibe con facilidad el ánimo de los demás.",
    },
    browTilt: {
      hi: "Las colas de tus cejas se elevan: la clásica \"ceja de espada\". Indica espíritu competitivo y decisión; brillas cuando hay mucho en juego.",
      mid: "Tus cejas están rectas y estables, y transmiten una energía tranquila y fiable.",
      lo: "Las colas de tus cejas bajan suavemente y te dan un aire amable y cercano. Tienes la cara con la que todo el mundo quiere hablar.",
    },
  },
  eye: {
    name: "Ojos", organ: "El Inspector · Ventana del alma", emoji: "👁️",
    intro: "Los antiguos lectores de rostros decían: \"Si el rostro vale mil monedas de oro, los ojos valen novecientas\". Nada importa más.",
    outro: "En realidad, los clásicos valoraban el espíritu de tus ojos —su claridad y su chispa— incluso más que su forma. Dormir bien y tener los ojos descansados es la forma más fácil de potenciar a tu Inspector.",
    eyeOpen: {
      hi: "¡Tus ojos son grandes, brillantes y bien abiertos! En los clásicos, los ojos son \"El Inspector\", donde se muestra tu espíritu. Unos ojos como los tuyos pertenecen a alguien honesto, curioso y expresivo: el protagonista que ilumina cualquier sala.",
      mid: "Tus ojos están maravillosamente equilibrados en tamaño y apertura. Aquí el corazón y la cabeza trabajan juntos: tu criterio es agudo y la gente confía en ti por instinto.",
      lo: "Tienes unos ojos almendrados, elegantes y alargados: lo que los clásicos llaman \"ojos de fénix\". Indican profundidad, paciencia y una capacidad de observación finísima. No lo revelas todo de golpe, y eso te da un misterio intrigante y magnético.",
    },
    eyeTilt: {
      hi: "Las esquinas exteriores de tus ojos se elevan ligeramente: una mirada aguda e inteligente. Cuando te fijas una meta, tu concentración es imparable.",
      mid: "Las esquinas de tus ojos están niveladas, señal de un punto de vista justo y equilibrado.",
      lo: "Las esquinas de tus ojos bajan con suavidad y te dan una mirada cálida y amable. Los desconocidos se abren contigo en cuestión de minutos.",
    },
    eyeGap: {
      hi: "Tus ojos están bastante separados: señal de un corazón abierto y un carácter tranquilo y optimista. Las pequeñeces no te alteran.",
      mid: "La separación de tus ojos está bien equilibrada y combina concentración con mente abierta.",
      lo: "Tus ojos están más juntos, señal de una concentración láser y buen ojo para el detalle. Energía de experto, de artesano, de especialista.",
    },
  },
  nose: {
    name: "Nariz", organ: "El Juez · Palacio de la Riqueza", emoji: "👃",
    intro: "Tu nariz está justo en el centro de tu rostro. Es \"El Juez\" entre los Cinco Oficiales y el Palacio de la Riqueza entre los Doce: la clave de tus años de plenitud (aproximadamente de los 41 a los 50), tu confianza y tu empuje.",
    outro: "En la lectura del rostro, el brillo de la nariz importa tanto como su forma. Se dice que una punta limpia y con un brillo suave es señal de que el dinero está en camino, así que cuidar la piel aquí es, básicamente, un ritual de riqueza.",
    noseWidth: {
      hi: "¡Tu nariz tiene unas aletas llenas y generosas! La nariz es el Palacio de la Riqueza —tu caja fuerte— y las aletas son sus puertas. Puertas firmes significan que el dinero que entra tiende a quedarse. La clásica \"nariz imán de dinero\".",
      mid: "Tu nariz guarda una proporción perfecta con tu rostro: un gran sentido del equilibrio entre ganar y gastar. Suerte económica estable y sostenible.",
      lo: "Tu nariz es estilizada y refinada. Indica buen gusto y una mente ordenada: te motivan más el sentido y la calidad que el dinero, y aumentas tu valor a través de tu experiencia.",
    },
    noseLen: {
      hi: "El puente de tu nariz es largo y elegante: señal de orgullo, responsabilidad y una Zona Media fuerte. Eres la persona en quien todos confían para sacar las cosas adelante.",
      mid: "El largo de tu nariz ancla bien tu Zona Media y apunta a unos años de plenitud estables y constantes.",
      lo: "Tu nariz es corta y bonita, lo que indica simpatía y reflejos rápidos. Te adaptas al cambio más rápido que nadie.",
    },
  },
  mouth: {
    name: "Boca y labios", organ: "El Guardián de la Puerta · Comida y fortuna", emoji: "👄",
    intro: "Tu boca es \"El Guardián de la Puerta\": la entrada de las palabras y de la comida. Guarda tu suerte con la buena mesa y la abundancia, tu encanto y tu credibilidad, y tu fortuna alrededor de los 60 años.",
    outro: "La boca cambia con la expresión más que cualquier otro rasgo, por eso los lectores de rostros dicen que \"una sonrisa puede cambiar una vida\". Se dice que diez segundos de sonrisa frente al espejo cada día van sumando bendiciones a tu Guardián de la Puerta.",
    mouthWidth: {
      hi: "¡Tienes una boca amplia y generosa! Como \"Guardián de la Puerta\", una boca grande significa una confianza generosa y palabras con peso: energía de líder nato. El viejo dicho asegura que \"boca grande come bien\", así que la buena comida y la buena fortuna te siguen.",
      mid: "Tu boca está en armonía con tu rostro: tus palabras coinciden con tus actos. Dices exactamente lo que hay que decir, y la gente confía en ti por eso.",
      lo: "Tu boca es pequeña y bien definida. Eliges tus palabras con cuidado, así que cada una cuenta. Sabes guardar secretos: la gente confía en ti profundamente.",
    },
    mouthCorner: {
      hi: "¡Las comisuras de tu boca se elevan de forma natural! Es la favorita de los lectores de rostros: la \"boca de luna creciente\". El dicho \"la fortuna llega a la cara sonriente\" se escribió para ti: atrae a la gente y a la buena suerte.",
      mid: "Las comisuras de tu boca están niveladas y definidas, y dan una impresión tranquila y fiable.",
      lo: "Las comisuras de tu boca descansan en una línea serena y pensativa que te da profundidad y presencia. Y en cuanto sonríes, tu cara entera se transforma: es tu arma secreta.",
    },
    lipThick: {
      hi: "Tus labios son carnosos, señal de calidez y afecto generoso. Amas a lo grande, así que tu vida amorosa y familiar brilla.",
      mid: "Tus labios están equilibrados: una gran mezcla de corazón y cabeza.",
      lo: "Tus labios son definidos y precisos, lo que apunta a alguien que comunica con claridad y lógica. Persuadir y planificar son tus puntos fuertes.",
    },
  },
  lower: {
    name: "Barbilla y mandíbula", organ: "Palacio del Equipo · Zona del Legado", emoji: "🗿",
    intro: "Desde debajo de la nariz hasta la punta de la barbilla está la zona de la \"Tierra\": la base de tu vida. Guarda tu suerte en la madurez, tu vitalidad, tu familia y a las personas que te apoyan. El surco sobre el labio es el \"río de la vida\" y tu barbilla es el \"suelo\" que pisas.",
    outro: "La Zona del Legado gana importancia con cada año. Relaja la mandíbula, cuida tu postura y mantén la barbilla en alto: los clásicos dicen que así se construye una base sólida para las décadas que vienen.",
    philtrum: {
      hi: "El surco sobre tu labio es largo y está bien definido. Los clásicos lo leen como señal de vitalidad, longevidad y una madurez tranquila y feliz.",
      mid: "Tu surco labial está bien equilibrado y apunta a un ritmo de vida saludable.",
      lo: "Tu surco labial es más bien corto: un corazón joven y movimientos rápidos. Eres de los que aparentan menos edad durante mucho, mucho tiempo.",
    },
    chinLen: {
      hi: "Tu barbilla es larga y firme. La barbilla es el \"suelo\" de la Zona del Legado: señal de garra, resistencia y una madurez cómoda.",
      mid: "Tu barbilla cierra tu rostro con una línea estable y equilibrada.",
      lo: "Tu barbilla es delicada y refinada, y te da un aire elegante y moderno. Te mantienes joven de espíritu y a la moda toda la vida.",
    },
    jawWidth: {
      hi: "Tu mandíbula es fuerte y ancha. Tu Palacio del Equipo está muy desarrollado: la gente quiere seguirte y tienes verdadero poder para liderar un grupo.",
      mid: "Tu mandíbula está equilibrada: la mezcla perfecta de suavidad y fuerza.",
      lo: "Tu mandíbula es estilizada y esculpida, señal de sensibilidad y estilo. Mucha energía de creador independiente, freelance y artista.",
    },
  },
};

// Orejas (El Oyente) — difíciles de ver en una foto frontal, así que puedes elegir (opcional)
export const EAR_TYPES = {
  auto: { label: "Automático (estimar por mi cara)", score: 0 },
  big: { label: "Grandes y llenas", score: 1.2,
    text: "Unas orejas grandes y llenas significan un \"Oyente\" fuerte. Las orejas muestran las bendiciones con las que naciste: unas orejas grandes y firmes se asocian con una infancia afortunada y una vida larga y sana." },
  lobe: { label: "Lóbulos carnosos", score: 1.5,
    text: "Los lóbulos llenos y carnosos son las famosas \"orejas de la fortuna\": piensa en las estatuas clásicas de Buda. Los lectores de rostros las sitúan como la señal número uno de riqueza duradera y buen karma hasta la madurez." },
  high: { label: "Altas (por encima de las cejas)", score: 1.0,
    text: "Cuando la parte superior de la oreja queda más alta que las cejas, se interpreta como señal de brillantez y éxito temprano. Gran suerte en los estudios y los exámenes." },
  small: { label: "Pequeñas y definidas", score: 0.4,
    text: "Unas orejas pequeñas y definidas indican a alguien detallista, decidido y con un fuerte sentido de sí mismo: no te dejas llevar por la opinión de los demás." },
  out: { label: "Visibles de frente", score: 0.6,
    text: "Las orejas que se ven claramente de frente apuntan a un espíritu independiente y pionero: a menudo triunfas en caminos que nadie más se atrevió a recorrer." },
};

// ---------------------------------------------------------------------
// Las 10 suertes — qué medidas alimentan cada una (pesos)
// ---------------------------------------------------------------------
export const FORTUNES = [
  { id: "wealth", name: "Suerte con el dinero", short: "Dinero", emoji: "💰", color: "#f2b705",
    weights: { noseWidth: 1.4, noseLen: 0.6, mouthWidth: 0.7, lower: 0.6, chinLen: 0.4, ear: 1.0 },
    classic: "El Ma Yi Shen Xiang llama a la nariz el Palacio de la Riqueza, y a las dos aletas, los \"pilares gemelos\" del tesoro. Una nariz recta con aletas firmes significa que el dinero entra… y se queda.",
    tip: "Mantén la cartera ordenada (¡nada de montones de tiques!) y la punta de la nariz sin brillos grasos. En la lectura del rostro, un brillo limpio y suave en la punta de la nariz es señal de que el dinero viene en camino.",
  },
  { id: "love", name: "Suerte en el amor", short: "Amor", emoji: "💘", color: "#ff5c8a",
    weights: { eyeOpen: 1.0, eyeTilt: -0.4, lipThick: 1.0, mouthCorner: 1.0, smile: 1.2, eyeGap: 0.3 },
    classic: "El Liu Zhuang Xiang Fa lee el romance en la zona suave bajo los ojos y en el brillo del rabillo del ojo: el Palacio del Romance. De alguien cuyos ojos y boca sonríen a la vez se dice que tiene una \"suerte de flor de durazno\" clara, la señal clásica de atracción.",
    tip: "Mantén luminoso el rabillo de los ojos (tu Palacio del Romance) con un buen contorno de ojos. En las fotos, levantar las comisuras apenas un par de milímetros lo cambia todo.",
  },
  { id: "marriage", name: "Matrimonio y pareja", short: "Pareja", emoji: "💍", color: "#e86fa8",
    weights: { mouthCorner: 1.0, lipThick: 0.8, glabella: 0.7, smile: 0.8, symmetry: 0.6, chinLen: 0.6, jawWidth: 0.5, philtrum: 0.5 },
    classic: "El Ma Yi Shen Xiang lee la pareja en el rabillo exterior de los ojos: el Palacio del Romance. Cuando esta zona está llena y luminosa, la unión es armoniosa; unas comisuras elevadas y una barbilla redondeada significan un hogar feliz durante décadas. El Shen Xiang Quan Bian añade que un espacio abierto entre las cejas significa menos discusiones.",
    tip: "Mantén hidratado el rabillo de los ojos (tu Palacio del Romance) y busca tiempo para miraros a los ojos y reír. Dice un viejo refrán que las parejas felices acaban pareciéndose: una sonrisa compartida es el mejor ritual de suerte que existe.",
  },
  { id: "career", name: "Carrera y exámenes", short: "Carrera", emoji: "🎓", color: "#4a8fe7",
    weights: { upper: 1.3, browLen: 0.8, browEye: 0.6, eyeTilt: 0.5, symmetry: 0.6, glabella: 0.4 },
    classic: "El Shen Xiang Quan Bian llama al centro de la frente el Palacio de la Carrera. Una frente luminosa y despejada con cejas ordenadas significa que \"tu nombre se eleva pronto\".",
    tip: "El día de la entrevista o del examen, echa un poco el pelo hacia atrás para enseñar la frente (Palacio de la Carrera). En la lectura del rostro, una frente descubierta significa que no te bloqueas tus propias oportunidades.",
  },
  { id: "study", name: "Estudios e inteligencia", short: "Estudios", emoji: "📚", color: "#5b8def",
    weights: { upper: 1.3, eyeOpen: 0.6, browLen: 0.6, eyeTilt: 0.5, glabella: 0.5, browEye: 0.4, symmetry: 0.4, ear: 0.6 },
    classic: "Los antiguos textos de lectura del rostro incluso tenían un nombre especial para las \"Salas del Saber\" del rostro. Una frente amplia y luminosa significa comprensión rápida; unos ojos claros, una mente aguda, y unas cejas ordenadas, constancia. El Shen Xiang Quan Bian dice que las orejas más altas que las cejas traen fama temprana gracias al estudio.",
    tip: "Cuando estudies, recógete el pelo y enseña la frente: en la lectura del rostro, una frente despejada \"abre la puerta a la sabiduría\". Y ojos claros, mente clara: una buena noche de sueño gana siempre a una noche en vela.",
  },
  { id: "health", name: "Salud y vitalidad", short: "Salud", emoji: "🌿", color: "#3fb97a",
    weights: { symmetry: 1.2, glabella: 0.6, noseLen: 0.5, philtrum: 0.9, balance: 1.2 },
    classic: "El Ma Yi Shen Xiang lee la salud en el puente de la nariz (el Palacio de la Salud) y dice que un surco largo y claro sobre el labio apunta a una vida larga. Cuando las Tres Zonas están equilibradas, la vida fluye sin tropiezos.",
    tip: "Si tiendes a fruncir el ceño, relaja a propósito el espacio entre las cejas. Se dice que un entrecejo liso mantiene tu energía fluyendo. Y el sueño: el mejor ritual de suerte que hay.",
  },
  { id: "business", name: "Alma de jefe", short: "Negocios", emoji: "🚀", color: "#ff7a3d",
    weights: { jawWidth: 1.2, noseWidth: 0.8, browThick: 0.8, browTilt: 0.5, mouthWidth: 0.7, noseLen: 0.4 },
    classic: "El Liu Zhuang Xiang Fa dice que cuando los pómulos y la nariz se apoyan mutuamente, es \"el rostro que sostiene el poder\"; y un Palacio del Equipo lleno a los lados de la barbilla significa muchos seguidores y grandes empresas.",
    tip: "Antes de una reunión importante, define la línea de tus cejas. Las cejas simbolizan la fuerza de voluntad, así que unas cejas nítidas transmiten decisión y control.",
  },
  { id: "honor", name: "Fama y reconocimiento", short: "Fama", emoji: "👑", color: "#a77bd9",
    weights: { upper: 1.0, noseLen: 0.8, browLen: 0.6, glabella: 0.6, eyeTilt: 0.5, symmetry: 0.4 },
    classic: "El Shen Xiang Quan Bian dice que cuando la frente, la nariz y la barbilla se alinean en equilibrio, \"las Tres Zonas están rectas\": el rostro de alguien cuyo nombre será conocido. Un Palacio del Destino abierto significa que ayudantes poderosos te impulsan.",
    tip: "Mantén limpio y cuidado el espacio entre tus cejas (Palacio del Destino). Erguirte cambia tu \"qi\" al instante: la postura es el truco de fama más fácil que existe.",
  },
  { id: "children", name: "Suerte familiar", short: "Familia", emoji: "🏡", color: "#ff9fb5",
    weights: { philtrum: 1.3, lipThick: 0.7, chinLen: 0.6, lower: 0.6, eyeOpen: 0.4 },
    classic: "El Ma Yi Shen Xiang llama a la zona suave bajo los ojos el Palacio de los Hijos y dice que un surco labial profundo y un rostro inferior lleno significan una familia próspera. Una barbilla redonda y llena es la señal de un hogar feliz.",
    tip: "Ilumina las ojeras con un poco de corrector para encender tu Palacio de la Familia. Dicen que reír con las personas que quieres lo hace brillar aún más.",
  },
  { id: "people", name: "Suerte social", short: "Social", emoji: "🤝", color: "#20b2c9",
    weights: { mouthCorner: 1.1, smile: 1.0, eyeGap: 0.6, glabella: 0.6, browLen: 0.7, jawWidth: 0.4 },
    classic: "El Shen Xiang Quan Bian llama a las cejas el Palacio de los Amigos —la suerte con compañeros y colegas— y dice que una \"boca de luna creciente\" con las comisuras hacia arriba es la boca que llama a la gente.",
    tip: "Prueba el \"flash de cejas\": levántalas un poco al saludar con una sonrisa. Es la forma más rápida de decir \"qué alegría verte\" sin pronunciar palabra.",
  },
];

// Frases de suerte por medida (hi: la medida es alta, lo: baja)
export const FORTUNE_LINES = {
  wealth: {
    noseWidth: { hi: "Tus aletas nasales llenas te dan un talento poco común para conservar el dinero. La verdadera riqueza no consiste en ganar mucho, sino en no perderlo, y eso lo tienes cubierto.", lo: "Tu nariz estilizada es la de alguien que hace crecer el dinero moviéndolo, no acumulándolo. Un instinto afilado y buena información son tu forma de atrapar oportunidades." },
    noseLen: { hi: "El largo puente de tu nariz muestra una riqueza que crece de forma constante, sobre todo a partir de los 40.", lo: "Tu nariz compacta indica una suerte con el dinero de \"momento perfecto\": atrapas las oportunidades en cuanto aparecen." },
    mouthWidth: { hi: "Tu boca generosa trae doble suerte: la buena comida y el buen dinero llegan juntos.", lo: "Tu boca definida muestra a alguien que gasta con inteligencia y cabeza, con verdadero talento para administrar." },
    lower: { hi: "Tu rostro inferior fuerte significa que tu caja fuerte se llena cada vez más con el tiempo: la clásica suerte económica de \"remontada final\".", lo: "Tu rostro inferior refinado significa que el dinero sigue a tu esfuerzo: cuanto más te muevas de joven, más fluye." },
    chinLen: { hi: "Tu barbilla firme es muy buena protegiendo a largo plazo lo que has construido.", lo: "Tu barbilla refinada apunta a ganar dinero leyendo las tendencias antes que nadie." },
    ear: { hi: "Si sumamos la forma de tus orejas, es una señal clara de que tu \"cuenco de bendiciones\" es grande.", lo: "" },
  },
  love: {
    eyeOpen: { hi: "Tus ojos grandes y claros muestran tus sentimientos con honestidad: hacen pensar \"esta persona es auténtica\".", lo: "Tus ojos almendrados y profundos tienen una atracción misteriosa: cuanto más te conocen, más se enamoran. Pura energía de fuego lento." },
    eyeTilt: { hi: "Las esquinas elevadas de tus ojos te dan un encanto seguro y cautivador de \"ojos de gato\" que hace girar cabezas a primera vista.", lo: "Las esquinas suaves de tus ojos te dan ese encanto cálido de \"ojos de cachorro\". En el amor, hacer que alguien se sienta tan a gusto es el arma definitiva." },
    lipThick: { hi: "Los labios carnosos son señal de un corazón generoso y cariñoso: das amor libremente y recibes mucho a cambio.", lo: "Los labios definidos significan que cada palabra que dices en el amor cuenta. No amas a la ligera: cuando te comprometes, es profundo y duradero." },
    mouthCorner: { hi: "Tus comisuras elevadas hacen que parezcas sonreír incluso en reposo, y los clásicos dicen que el amor encuentra caras así.", lo: "Tu boca serena da una primera impresión seria, pero en cuanto sonríes, el encanto explota. ¡Sonríe a menudo!" },
    smile: { hi: "¡Tu sonrisa en esta foto es radiante! El Liu Zhuang Xiang Fa dice que un rostro donde los ojos y la boca sonríen juntos tiene la mejor suerte en el amor de todas.", lo: "" },
    eyeGap: { hi: "Tus ojos bien separados te convierten en una pareja relajada que le da espacio al otro para respirar.", lo: "Tus ojos más juntos indican un amor entregado, de los de \"solo tú\"." },
  },
  marriage: {
    mouthCorner: { hi: "Tu \"boca de luna creciente\" significa un hogar siempre lleno de risas: iluminas el día de tu pareja.", lo: "Tu boca serena muestra un amor tranquilo y constante: lo demuestras más con hechos que con palabras. Unos cuantos \"te quiero\" más y tu relación brillará aún más cálida." },
    lipThick: { hi: "Tus labios carnosos muestran una pareja cálida y atenta que hace verdaderamente felices a quienes viven con ella.", lo: "Tus labios definidos marcan a una pareja que cumple sus promesas: leal, estable y comprometida a largo plazo." },
    glabella: { hi: "El espacio abierto entre tus cejas muestra un gran corazón que no guarda rencor: los clásicos dicen que las personas como tú discuten menos con su pareja.", lo: "El espacio definido entre tus cejas muestra a una pareja que se fija en los detalles. Hablad las cosas enseguida en lugar de dejar que se acumulen, y vuestro vínculo se hará cada vez más fuerte." },
    smile: { hi: "Tu sonrisa luminosa es como una lámpara en casa: ilumina a todos a tu alrededor.", lo: "" },
    symmetry: { hi: "Tu rostro maravillosamente equilibrado indica estabilidad emocional: la base de una relación tranquila y cómoda.", lo: "" },
    chinLen: { hi: "Tu barbilla firme apunta a una relación que dura hasta la vejez y se hace más profunda cada año.", lo: "Tu barbilla refinada muestra amor por las experiencias nuevas: mantienes viva la chispa durante mucho, mucho tiempo." },
    jawWidth: { hi: "Tu mandíbula fuerte marca el corazón fiable del hogar: la persona en la que tu pareja se apoya.", lo: "Tu mandíbula estilizada apunta a una relación de mejores amigos: divertida, cariñosa y relajada." },
    philtrum: { hi: "Tu surco labial definido muestra profundas raíces familiares: la señal de un hogar cálido y feliz.", lo: "" },
  },
  study: {
    upper: { hi: "Tu frente amplia y luminosa es la clásica \"frente de aprendizaje rápido\": entiendes las cosas a la primera.", lo: "Tu frente compacta significa que aprendes mejor haciendo. Cuantos más ejercicios prácticos hagas, más rápido subes de nivel." },
    eyeOpen: { hi: "Tus ojos grandes y claros muestran una curiosidad natural: los ojos del estudiante que investiga hasta entender.", lo: "Tus ojos almendrados y profundos muestran una concentración serena y de largo recorrido. Brillas en el estudio profundo y serio." },
    browLen: { hi: "Tus cejas largas atraen a grandes profesores, mentores y compañeros de estudio.", lo: "Tus cejas definidas marcan a alguien con iniciativa propia que planifica el trabajo y lo cumple." },
    eyeTilt: { hi: "Las esquinas elevadas de tus ojos muestran una concentración que se afila a medida que se acerca el día del examen.", lo: "Tus ojos suaves muestran un aprendizaje paciente, paso a paso: genial para cursos largos y grandes metas." },
    glabella: { hi: "Tu Palacio del Destino abierto significa que la comprensión fluye con facilidad: hasta los problemas difíciles parecen abordables.", lo: "El espacio definido entre tus cejas indica un pensamiento preciso y cuidadoso: menos despistes." },
    browEye: { hi: "El espacio amplio entre tus cejas y tus ojos significa una mente tranquila: mantienes la calma en el examen.", lo: "El espacio corto entre tus cejas y tus ojos muestra una concentración intensa: se te da genial el repaso de última hora." },
    symmetry: { hi: "Tu rostro equilibrado se interpreta como una mente ordenada: fuerte en lógica, matemáticas y materias estructuradas.", lo: "" },
    ear: { hi: "La fuerte energía de tus orejas te convierte en una gran oyente: sacas mucho provecho de las clases y conferencias.", lo: "" },
  },
  career: {
    upper: { hi: "Tu frente despejada (Palacio de la Carrera) te hace brillar siempre que te evalúan. En exámenes y entrevistas demuestras más de lo que preparaste.", lo: "Tu frente compacta viene con habilidades del mundo real. Brillas en el terreno, en la práctica y en la acción, no solo sobre el papel." },
    browLen: { hi: "Tus cejas largas atraen a mentores y veteranos que quieren ayudarte: las recomendaciones y los contactos te abren grandes puertas.", lo: "Tus cejas definidas muestran a alguien que se demuestra por puro talento. Deja que tu trabajo hable por ti." },
    browEye: { hi: "El espacio amplio entre tus cejas y tus ojos te da un aire relajado y abierto: quien te entrevista piensa \"quiero trabajar con esta persona\".", lo: "El espacio corto entre tus cejas y tus ojos indica una concentración intensa. Entregas resultados rápido bajo presión." },
    eyeTilt: { hi: "La forma afilada y elevada de tus ojos transmite \"esta persona hace que las cosas pasen\".", lo: "Tus ojos suaves generan confianza: das la impresión de ser un gran compañero de equipo." },
    symmetry: { hi: "Tu rostro maravillosamente equilibrado transmite estabilidad y confianza desde la primera impresión.", lo: "" },
    glabella: { hi: "Tu Palacio del Destino abierto significa caminos que se abren sin obstáculos.", lo: "El espacio definido entre tus cejas apunta a un juicio cuidadoso y minucioso." },
  },
  health: {
    symmetry: { hi: "Tu rostro está maravillosamente equilibrado de izquierda a derecha: se interpreta como señal de una energía estable y fluida.", lo: "" },
    glabella: { hi: "El espacio abierto entre tus cejas muestra a alguien que deja ir el estrés en lugar de aferrarse a él.", lo: "Cuando le das demasiadas vueltas a algo, la tensión puede acumularse en el cuello y los hombros: haz de los estiramientos un hábito diario." },
    noseLen: { hi: "El puente largo y liso de tu nariz significa un Palacio de la Salud fuerte.", lo: "Tu nariz compacta viene con una recuperación rápida. Descansa bien y te recuperas enseguida." },
    philtrum: { hi: "Tu surco labial largo y definido se acerca a lo que los clásicos llaman \"la señal de la longevidad\".", lo: "Tiendes a gastar tu energía en grandes ráfagas: las comidas regulares son tu llave secreta de la suerte." },
    balance: { hi: "Tus Tres Zonas —frente, nariz, barbilla— son maravillosamente uniformes. Los clásicos lo atesoran: \"zonas equilibradas, vida tranquila\".", lo: "Una de tus Tres Zonas destaca y le da a tu rostro mucho carácter. Apóyate en esa fortaleza y mantén un ritmo diario estable." },
  },
  business: {
    jawWidth: { hi: "Tu mandíbula fuerte muestra un Palacio del Equipo muy desarrollado: el clásico rostro de CEO con personal y socios leales.", lo: "Tu mandíbula estilizada prospera en modelos de negocio ligeros y rápidos: emprendimiento en solitario, creación de contenido, freelance." },
    noseWidth: { hi: "Tu nariz firme evita que el dinero del negocio se escape: gran instinto para el flujo de caja.", lo: "Tu nariz refinada encaja con negocios construidos sobre ideas y marca más que sobre grandes capitales." },
    browThick: { hi: "Tus cejas fuertes muestran empuje y agallas de verdad. Cuando otros dudan, tú te mueves primero.", lo: "Tus cejas finas leen los sentimientos y los detalles de los clientes: perfecto para servicios, diseño y marcas de estilo de vida." },
    browTilt: { hi: "Tus \"cejas de espada\" elevadas significan que no retrocedes cuando importa.", lo: "Tus cejas suaves relajan a la gente: un arma secreta en la mesa de negociación." },
    mouthWidth: { hi: "Tu boca generosa da fuerza a tus palabras: genial para ventas, presentaciones y captar inversión.", lo: "Tu boca definida es la marca de quien emprende y cumple su palabra." },
    noseLen: { hi: "El puente largo de tu nariz muestra la resistencia para llevar proyectos a largo plazo hasta la meta.", lo: "" },
  },
  honor: {
    upper: { hi: "Tu frente despejada ilumina tu Palacio de la Carrera: tu nombre se conoce pronto en cualquier organización.", lo: "Tu frente compacta significa un reconocimiento ganado con talento, y que dura." },
    noseLen: { hi: "Tu nariz recta y elegante muestra orgullo y dignidad: los clásicos la llaman \"la nariz que hace un nombre\".", lo: "Tu nariz simpática atrae popularidad y una amplia simpatía." },
    browLen: { hi: "Tus cejas largas ayudan a que tu reputación llegue lejos.", lo: "" },
    glabella: { hi: "Tu Palacio del Destino abierto significa que ayudantes poderosos elevan aún más tu nombre.", lo: "" },
    eyeTilt: { hi: "Las esquinas elevadas de tus ojos muestran ambición y propósito: sigues escalando.", lo: "" },
    symmetry: { hi: "Tu rostro equilibrado transmite justicia y confianza: verdadera energía de líder.", lo: "" },
  },
  children: {
    philtrum: { hi: "Tu surco labial largo y definido apunta a una familia próspera y sana, y a lazos profundos con los niños.", lo: "Tu surco labial corto significa un corazón eternamente joven: el tipo de madre, padre, tía o tío que también es su mejor amigo." },
    lipThick: { hi: "Tus labios carnosos muestran un corazón cálido que mantiene unida a toda la familia.", lo: "Tus labios definidos sugieren a alguien que educa con una estructura clara y cariñosa." },
    chinLen: { hi: "Tu barbilla firme se interpreta como señal de una familia unida y cariñosa en la madurez.", lo: "Tu barbilla refinada apunta a la persona elegante y divertida de la familia a la que todos admiran." },
    lower: { hi: "Tu rostro inferior lleno apunta a un hogar feliz siempre lleno de risas.", lo: "" },
    eyeOpen: { hi: "Tus ojos luminosos y claros añaden brillo a tu Palacio de la Familia.", lo: "" },
  },
  people: {
    mouthCorner: { hi: "Tu \"boca de luna creciente\" atrae a la gente incluso cuando no lo intentas.", lo: "Tu boca serena se gana la confianza: eres la amistad que la gente conserva toda la vida." },
    smile: { hi: "Tu sonrisa luminosa es un imán para la gente. Con solo mirar tu foto, a cualquiera se le alegra el día.", lo: "" },
    eyeGap: { hi: "Tus ojos bien separados muestran un corazón abierto y acogedor.", lo: "Tus ojos más juntos significan que cuidas a fondo a cada amistad: leal hasta la médula." },
    glabella: { hi: "El espacio abierto entre tus cejas muestra un gran corazón que no guarda rencor.", lo: "El espacio definido entre tus cejas viene con una atención considerada y detallista hacia los demás." },
    browLen: { hi: "Las cejas largas significan un Palacio de los Amigos lleno: buenas amistades a tu lado toda la vida.", lo: "Las cejas definidas significan un círculo íntimo pequeño, unido e incondicional." },
    jawWidth: { hi: "Tu mandíbula fuerte trae \"suerte de líder\": mucha gente te admira.", lo: "" },
  },
};

// Consejos de belleza (maquillaje y cuidado) — según el rasgo que quieras realzar
export const MAKEUP_TIPS = {
  noseWidth: { lo: "Aplica un toque de iluminador en la punta de la nariz: añade brillo a tu Palacio de la Riqueza y \"abre la puerta de la caja fuerte\".", hi: "Una línea fina de iluminador por el centro del puente nasal equilibra tus rasgos y aporta un aire elegante y pulido." },
  noseLen: { lo: "Un toque suave de contorno en la parte alta del puente nasal la hace parecer más larga y refuerza tu pilar de los \"años de plenitud\".", hi: "Un poco de sombra bajo la punta de la nariz suaviza un puente largo y aporta un aire cercano." },
  mouthCorner: { lo: "Usa perfilador para alargar hacia arriba las comisuras exteriores 1–2 mm. ¡Es la forma más fácil de crear la afortunada \"boca de luna creciente\"!", hi: "Tus comisuras elevadas ya son tu mejor rasgo: solo añade un brillo transparente para un acabado fresco." },
  lipThick: { lo: "Aplica un tono más claro solo en el centro de los labios y difumina hacia fuera: al instante, más llenos, cálidos y encantadores.", hi: "Un tono \"tus labios, pero mejor\" con los bordes ligeramente difuminados hace que los labios carnosos luzcan aún más chic." },
  browLen: { lo: "Alarga la cola de tus cejas justo un poco más allá del rabillo del ojo. Amplía tu Palacio de los Amigos: ¡hola, más gente buena!", hi: "Las cejas largas solo necesitan arreglar la cola. Un poco de gel para peinar los pelos hacia arriba las deja nítidas." },
  browThick: { lo: "Rellena las zonas despobladas con trazos finos que imiten el pelo para proyectar fuerza de voluntad y empuje.", hi: "Arregla solo la parte inferior de las cejas fuertes y péinalas hacia arriba con gel transparente: la fuerza se convierte en elegancia." },
  browTilt: { lo: "Eleva ligeramente el arco de las cejas para un aire más decidido y seguro.", hi: "Dibuja la cola de las cejas un poco más recta para suavizar una mirada intensa y ganar cercanía." },
  eyeOpen: { lo: "Riza las pestañas desde la raíz y añade un poco de sombra marrón en la línea inferior exterior: tu Inspector se abre al instante.", hi: "Los ojos grandes solo necesitan un delineado fino. Un toque de brillo justo debajo del ojo potencia tus palacios de la Familia y del Amor." },
  eyeTilt: { lo: "Lleva el delineado ligeramente hacia arriba en el rabillo exterior para una mirada aguda e inteligente.", hi: "Mantén recto el rabillo del delineado y añade un poco de sombra en las pestañas inferiores para una mirada más suave." },
  glabella: { lo: "Arregla el inicio interior de las cejas 1–2 mm para abrir tu Palacio del Destino. Los clásicos dicen que un entrecejo abierto mantiene la suerte fluyendo.", hi: "Deja tu entrecejo abierto tal como está: un toque de contorno en la nariz aporta enfoque y definición." },
  upper: { lo: "Prueba la raya al lado o un peinado que deje ver un poco la frente para iluminar tu Palacio de la Carrera.", hi: "Un flequillo suave y ligero o un poco de contorno en el nacimiento del pelo enmarcan de maravilla una frente amplia." },
  jawWidth: { lo: "Un poco de contorno bajo la mandíbula añade definición y un toque de seguridad.", hi: "Aplica contorno solo en los ángulos de la mandíbula bajo las orejas para que una mandíbula fuerte luzca estilizada y esculpida." },
  smile: { lo: "En las fotos, sonríe primero con los ojos en lugar de decir \"patata\". Los clásicos dicen que la verdadera suerte llega cuando tus ojos sonríen.", hi: "¡Tu sonrisa luminosa es el mejor glow-up! Añade un poco de colorete coral en la parte alta de las mejillas para más luz." },
  philtrum: { lo: "Define el arco de Cupido con perfilador para que tu surco labial se vea nítido y claro.", hi: "Perfila un poco por fuera el labio superior para equilibrar un surco labial largo." },
  symmetry: { lo: "Prueba a cambiar la raya del pelo, o dibuja un poco más alta la ceja que está más baja para equilibrar ambos lados.", hi: "Un rostro equilibrado luce mejor con un maquillaje natural, de \"no llevo nada\"." },
};

export const METRIC_LABELS = {
  eyeSize: "Ancho de los ojos", eyeOpen: "Apertura de los ojos", eyeTilt: "Elevación del rabillo", eyeGap: "Separación de los ojos",
  browLen: "Largo de las cejas", browThick: "Densidad de las cejas", browTilt: "Arco de las cejas", browEye: "Espacio ceja–ojo",
  glabella: "Palacio del Destino (entrecejo)", noseWidth: "Plenitud de la nariz", noseLen: "Largo del puente nasal", mouthWidth: "Ancho de la boca",
  mouthCorner: "Elevación de las comisuras", lipThick: "Grosor de los labios", philtrum: "Largo del surco labial", chinLen: "Largo de la barbilla",
  jawWidth: "Ancho de la mandíbula", faceRatio: "Largo del rostro", upper: "Zona superior (frente)", middle: "Zona media (cejas–nariz)",
  lower: "Zona inferior (nariz–barbilla)", symmetry: "Simetría", smile: "Puntuación de sonrisa",
};

// Nombres cortos y amables de los rasgos (con posesivo) para usar dentro de frases
export const FEATURE_NAMES = {
  eyeOpen: "tus ojos", eyeTilt: "la forma de tus ojos", eyeGap: "la separación de tus ojos", browLen: "tus cejas", browThick: "tus cejas",
  browTilt: "el arco de tus cejas", browEye: "el espacio entre cejas y ojos", glabella: "tu Palacio del Destino", noseWidth: "tu nariz",
  noseLen: "el puente de tu nariz", mouthWidth: "tu boca", mouthCorner: "tu línea de sonrisa", lipThick: "tus labios",
  philtrum: "tu surco labial", chinLen: "tu barbilla", jawWidth: "tu mandíbula", upper: "tu frente", lower: "tu rostro inferior",
  symmetry: "tu simetría", smile: "tu sonrisa",
};

// Frases gancho — lo primero que se muestra en el resultado
export const HOOKS = {
  wealth: ["Vale, eso no es solo una nariz. Es una caja fuerte. 💰", "¡Tu cartera reconoció esta cara antes que tú!", "Energía de imán de dinero detectada. 💸"],
  love: ["Esos ojos… alguien tiene el corazón acelerado ahora mismo. 💘", "Seamos sinceros: llamas mucho la atención, ¿verdad?", "Cara de robacorazones certificada. 💞"],
  marriage: ["Esta cara dice \"y vivieron felices para siempre\". 💍", "¡La suerte en pareja está escrita por toda esta cara!", "Energía de imán de almas gemelas detectada. 💞"],
  study: ["Energía de cerebrito, justo en tu frente. 📚", "¡La cara que a todo profesor le encantaba tener en clase!", "Vibras de cuadro de honor, sin discusión. 🧠"],
  career: ["La frente con la que sueñan los entrevistadores. 🎓", "¡Esta cara está hecha para el despacho de la esquina!", "Energía de \"estás contratado\", alta y clara. 💼"],
  health: ["¿Un equilibrio así? Hacía tiempo que no lo veía. 🌿", "¡Energía de protagonista con la barra de salud llena!", "Tu cara dice \"hecha para durar\". 💪"],
  business: ["Esa mandíbula te está llamando \"jefe\". 🚀", "¡Esta cara pertenece a la página de un fundador!", "Energía de CEO. Sin más. 👔"],
  honor: ["Esta cara va a ser famosa. 👑", "¡Allá donde vas, eres \"esa persona\" que todos recuerdan!", "Tu nombre en luces: la cara está de acuerdo. ✨"],
  children: ["Esta cara llena un hogar de risas. 🏡", "¡Tu Palacio de la Familia brilla muchísimo!", "Energía del corazón más cálido de la sala. 💗"],
  people: ["Una cara que atrae a la gente como un imán. 🤝", "¡Los ayudantes de la suerte hacen cola por esta cara!", "La persona favorita de todos, y la cara lo demuestra. 🌟"],
};

// ---------------------------------------------------------------------
// Personalización por género y edad
// Los "Años que fluyen" (流年運氣) del Ma Yi Shen Xiang: con la edad, la suerte baja por el rostro.
//   15–30 frente → 31–40 cejas y ojos → 41–50 nariz y pómulos → 51–60 surco labial y boca → 61+ barbilla
// ---------------------------------------------------------------------
export const GENDERS = { "": "Prefiero no decirlo", f: "Mujer", m: "Hombre" };
const GENDER_NOUN = { f: "mujer", m: "hombre" };
export const genderNoun = (g) => GENDER_NOUN[g] || "";

export const AGE_GROUPS = {
  "": { label: "Prefiero no decirlo" },
  "20": { label: "Menos de 30", phrase: "menor de 30 años", stage: "early", career: "Exámenes y primer empleo", children: "Suerte familiar",
    place: "tu frente (Zona Superior)", keys: ["upper"], years: "de los 15 a los 30 años",
    hi: "Y tu frente —justo donde está tu suerte ahora mismo— es amplia y luminosa. Es la temporada de los \"primeros pasos\" (estudios, exámenes, tu primer trabajo de verdad), y los mentores hacen cola para ayudarte.",
    lo: "Tu frente es compacta, lo que significa que tu suerte se abre cuando aprendes haciendo, no detrás de un escritorio. Prácticas, proyectos paralelos y viajes son ahora tus impulsores de suerte.",
    mid: "Tu frente está bien equilibrada, así que en este capítulo de la vida el esfuerzo constante se convierte directamente en resultados." },
  "30": { label: "30–39", phrase: "de entre 30 y 39 años", stage: "mid", career: "Carrera y ascensos", children: "Suerte familiar",
    place: "tus cejas y tus ojos", keys: ["browLen", "eyeOpen"], years: "de los 31 a los 40 años",
    hi: "Y tus cejas y ojos —donde vive tu suerte ahora— son maravillosamente expresivos. Tu criterio sobre las personas y tu red de contactos se abren a la vez: es un gran momento para conocer a colegas, socios y cofundadores clave.",
    lo: "Tus cejas y ojos son serenos y contenidos, así que creces a través de la confianza profunda más que de una red enorme. Profundiza en un campo y, al final de tus 30, serás la persona experta a la que todos llaman.",
    mid: "Tus cejas y ojos están bien equilibrados: perfecto para compaginar con soltura trabajo y vida familiar en este capítulo." },
  "40": { label: "40–49", phrase: "de entre 40 y 49 años", stage: "mid", career: "Carrera y ascensos", children: "Suerte familiar",
    place: "tu nariz y tus pómulos", keys: ["noseLen", "noseWidth"], years: "de los 41 a los 50 años",
    hi: "Y tu nariz —el Palacio de la Riqueza, donde está tu suerte ahora— ¡es fuerte! Los lectores de rostros llaman a los 40 \"la década de la nariz\", cuando el dinero y el estatus se mueven más. Tu momento es perfecto: es la hora de ir a por ello.",
    lo: "Tu nariz es estilizada y refinada, así que tu suerte crece fortaleciendo lo que ya tienes en lugar de expandirte de más. Ordena tus gastos y afila tu experiencia: el final de tus 40 te recompensará a lo grande.",
    mid: "Tu nariz ancla bien el centro de tu rostro, lo que apunta a un flujo estable de dinero y trabajo en este capítulo." },
  "50": { label: "50–59", phrase: "de entre 50 y 59 años", stage: "late", career: "Propósito y segundo acto", children: "Familia y legado",
    place: "tu surco labial y tu boca", keys: ["philtrum", "mouthCorner"], years: "de los 51 a los 60 años",
    hi: "Y tu surco labial y tu boca —donde está tu suerte ahora— lucen fantásticos. Un surco definido y unas comisuras elevadas traen salud, buena mesa y el don de unir a la gente con una sola palabra.",
    lo: "Tu boca descansa en una línea serena que da verdadero peso a tus palabras. Los lectores de rostros dicen que sonreír más a menudo ilumina muchísimo los 50, ¡así que deja salir esa sonrisa!",
    mid: "Tu surco labial y tu boca están bien equilibrados, lo que apunta a un ritmo de vida cómodo y un hogar en paz." },
  "60": { label: "60+", phrase: "de 60 años o más", stage: "late", career: "Propósito y segundo acto", children: "Nietos y legado",
    place: "tu barbilla", keys: ["chinLen", "jawWidth"], years: "a partir de los 61 años",
    hi: "Y tu barbilla —donde vive tu suerte ahora— es llena y fuerte. La barbilla es el \"suelo\" de la madurez, así que este es el rostro de alguien que disfruta del amor de su familia y del respeto de las generaciones más jóvenes.",
    lo: "Tu barbilla es delicada y refinada: conservas un espíritu joven toda la vida. Cuanto más sigas aprendiendo y explorando aficiones nuevas, más amplia se vuelve tu suerte.",
    mid: "Tu barbilla sostiene tu rostro con una línea firme, lo que apunta a un capítulo sano y tranquilo por delante." },
};

// Una frase extra por suerte según la etapa de la vida (early: menos de 30, mid: 30–49, late: 50+)
export const AGE_LINES = {
  wealth: { early: "Ahora mismo importa menos el gran dinero y más construir tus ahorros y buenos hábitos financieros.", mid: "Es el momento de hacer crecer lo ahorrado y construir una base sólida: hogar, inversiones, patrimonio.", late: "Ahora toca proteger lo que has construido y disfrutar de un futuro cómodo y sin preocupaciones." },
  love: { early: "Te llegan conexiones nuevas: di que sí a más invitaciones.", mid: "Ahora tu suerte en el amor es la confianza con la persona que tienes al lado. Los pequeños gestos llegan lejos.", late: "Tu vínculo con tu pareja y tus viejas amistades brilla más que nunca. Salid más a pasear juntos." },
  marriage: { early: "Tu suerte para encontrar pareja para toda la vida está totalmente abierta. Sin prisas: la persona adecuada está en camino.", mid: "Es la temporada de construir un hogar juntos. Protege vuestro tiempo a solas, incluso cuando la vida aprieta.", late: "Los años de historia compartida son ahora vuestro mayor tesoro. Caminar y reír juntos es la mejor medicina." },
  career: { early: "Tu suerte se concentra en los momentos de \"ser evaluado\": exámenes, entrevistas y tu primer empleo.", mid: "En las grandes encrucijadas —ascensos, cambios de trabajo, independizarte— la energía de tu rostro está de tu lado.", late: "La suerte está abierta para compartir tu experiencia, ser mentor y encontrar un segundo acto con sentido." },
  study: { early: "Tu suerte se centra en construir habilidades: exámenes, certificaciones, títulos. El esfuerzo que pongas ahora te rendirá toda la vida.", mid: "Un gran momento para aprender un campo nuevo o conseguir una acreditación profesional, y también para guiar el aprendizaje de tus hijos.", late: "Tu suerte de aprendizaje permanente brilla. Empieza una afición o un curso nuevo y mantén la mente y el corazón jóvenes." },
  health: { early: "Los hábitos de sueño y ejercicio que construyas ahora son tu cuenta de ahorro de salud para toda la vida.", mid: "Cuanto más ocupado estés, más debes cuidar el cuello, los hombros y la digestión. No te saltes las revisiones.", late: "Los paseos diarios y un poco de fuerza ligera son tus mejores impulsores de suerte. La risa es medicina." },
  business: { early: "\"Empieza pequeño, aprende rápido\" es ahora tu estilo ganador en los negocios.", mid: "La gente y el capital se están juntando: gran momento para crecer y para alianzas.", late: "Te van mejor los proyectos estables basados en la confianza y la experiencia que las expansiones arriesgadas." },
  honor: { early: "Las oportunidades de hacerte un nombre llegan pronto: no dejes pasar las pequeñas.", mid: "Tu nombre está subiendo en tu sector y en tu comunidad. No huyas de los puestos de liderazgo.", late: "Entras en la etapa de la persona mayor respetada. Compartir tu sabiduría eleva tu nombre aún más." },
  children: { early: "Tu suerte familiar futura es brillante: las buenas conexiones llevan a una familia feliz.", mid: "Reír con tus hijos (o con los niños de tu vida) hace brillar tu Palacio de la Familia.", late: "Este es el rostro de alguien que disfruta del éxito de su familia y de la alegría de los nietos." },
  people: { early: "Estás conociendo a amigos y mentores que te acompañarán toda la vida.", mid: "Las personas que conoces en el trabajo se convierten en tus ayudantes de la suerte. Saluda tú primero.", late: "Las amistades de toda la vida son ahora tu apoyo más fuerte. Comparte las risas en cada reunión." },
};

// Consejos de cuidado para hombres (misma estructura que MAKEUP_TIPS)
export const GROOMING_TIPS = {
  noseWidth: { lo: "Mantén la piel alrededor de la nariz libre de grasa y descamación. Se dice que una punta de la nariz limpia y clara ilumina tu suerte con el dinero.", hi: "Un cuidado sencillo de la piel alrededor de la nariz hace que una nariz fuerte luzca aún más distinguida." },
  noseLen: { lo: "Prueba un flequillo más corto o un peinado algo levantado para resaltar las líneas verticales del rostro: tu nariz parece más larga y tu pilar de los \"años de plenitud\" se mantiene erguido.", hi: "Un poco de volumen en los laterales del pelo suaviza un rostro y un puente nasal largos." },
  mouthCorner: { lo: "Usa bálsamo labial y practica una ligera elevación de las comisuras. ¡La afortunada \"boca de luna creciente\" se puede construir con la expresión!", hi: "Tus comisuras elevadas son tu mejor baza: solo evita que se te agrieten los labios." },
  lipThick: { lo: "Un bálsamo labial transparente añade un brillo saludable y una impresión más cálida y cercana.", hi: "Solo mantén los labios suaves e hidratados: los labios carnosos transmiten salud y confianza." },
  browLen: { lo: "No recortes la cola de las cejas: déjala crecer. Se dice que las cejas más largas que los ojos traen más suerte con amigos y familia.", hi: "Las cejas largas solo necesitan quitar algunos pelos sueltos." },
  browThick: { lo: "Un sérum para cejas o un toque ligero de lápiz para rellenar huecos proyecta fuerza de voluntad y empuje.", hi: "Quita solo los pelos sueltos bajo las cejas fuertes: lo rudo se vuelve refinado." },
  browTilt: { lo: "Arregla los pelos bajo el arco de la ceja para definirlo: al instante, más decidido.", hi: "Recorta un poco por encima de la cola de las cejas para suavizar una mirada intensa y ganar cercanía." },
  eyeOpen: { lo: "Duerme lo suficiente y usa compresas frías para bajar la hinchazón. Unos ojos claros \"abren\" a tu Inspector.", hi: "Los ojos grandes se ven llenos de energía en cuanto cuidas las ojeras." },
  eyeTilt: { lo: "Si usas gafas, prueba monturas que se eleven un poco en los extremos para una mirada aguda y segura.", hi: "Monturas más redondas o una expresión relajada convierten una mirada afilada en una mirada cálida." },
  glabella: { lo: "Arregla el pelo del entrecejo e intenta dejar el hábito de fruncir el ceño. Un Palacio del Destino abierto mantiene la suerte fluyendo.", hi: "Deja tu entrecejo abierto tal como está: solo evita las arrugas de fruncir." },
  upper: { lo: "Peina el pelo hacia arriba o llévalo corto para enseñar la frente (Palacio de la Carrera), sobre todo en entrevistas y días importantes.", hi: "Un flequillo algo más bajo suaviza una frente amplia y equilibra tus rasgos." },
  jawWidth: { lo: "Un afeitado limpio y apurado que deje ver la mandíbula añade un toque fuerte y seguro.", hi: "Los laterales cortos con volumen arriba equilibran a la perfección una mandíbula fuerte." },
  smile: { lo: "En las fotos, sonríe primero con los ojos. Los clásicos dicen que la verdadera suerte llega cuando tus ojos sonríen.", hi: "Tu sonrisa luminosa es tu mejor amuleto: un buen cuidado dental la hace brillar aún más." },
  philtrum: { lo: "Un afeitado limpio sobre el labio hace que tu surco labial se vea nítido y saludable.", hi: "Un surco labial definido luce con nada más que un buen afeitado." },
  symmetry: { lo: "Prueba a cambiar la raya del pelo, o arregla un poco la ceja más baja para equilibrar ambos lados.", hi: "Un rostro equilibrado luce mejor con un corte limpio y un afeitado fresco." },
};
