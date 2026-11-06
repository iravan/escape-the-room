import { create } from "zustand";

export type Lang = "ja" | "ko";
export type Cell = { char: string; romaji: string } | null;
export const MISSING = 15; // one hole / plaque per painting

type Pack = {
  label: string;
  chartTitle: string;
  unit: string;
  columns: string[];
  vowels: string[];
  chart: Cell[];
  clues: Record<string, string>;
  congrats: string;
  help: string;
  notebook: string;
  puzzleHint: string;
  controlsChart: string;
};

const parse = (src: string): Cell[] => src.split(" ").map((c) => (c === "-" ? null : { char: c[0], romaji: c.slice(1) }));

// Japanese gojūon: columns are consonants (first column = bare vowels), rows are a i u e o.
const JA_SRC = "あa いi うu えe おo かka きki くku けke こko さsa しshi すsu せse そso たta ちchi つtsu てte とto なna にni ぬnu ねne のno " +
  "はha ひhi ふfu へhe ほho まma みmi むmu めme もmo やya - ゆyu - よyo らra りri るru れre ろro わwa - - - をwo んn - - - -";
const JA_CLUES: Record<string, string> = {
  あ: "あめ (ame) means rain. あ = a", い: "いぬ (inu) means dog. い = i", う: "うみ (umi) means sea. う = u",
  え: "え (e) means picture. え = e", お: "おと (oto) means sound. お = o",
  か: "かお (kao) means face. か = ka", き: "き (ki) means tree. き = ki", く: "くも (kumo) means cloud. く = ku",
  け: "けむり (kemuri) means smoke. け = ke", こ: "こえ (koe) means voice. こ = ko",
  さ: "さかな (sakana) means fish. さ = sa", し: "しろ (shiro) means white. し = shi", す: "すな (suna) means sand. す = su",
  せ: "せかい (sekai) means world. せ = se", そ: "そら (sora) means sky. そ = so",
  た: "たいよう (taiyou) means sun. た = ta", ち: "ちず (chizu) means map. ち = chi", つ: "つき (tsuki) means moon. つ = tsu",
  て: "て (te) means hand. て = te", と: "とり (tori) means bird. と = to",
  な: "はな (hana) means flower. な = na", に: "にわ (niwa) means garden. に = ni", ぬ: "ぬの (nuno) means cloth. ぬ = nu",
  ね: "ねる (neru) means to sleep. ね = ne", の: "のき (noki) means eaves. の = no",
  は: "はた (hata) means flag. は = ha", ひ: "ひまわり (himawari) means sunflower. ひ = hi", ふ: "ふね (fune) means boat. ふ = fu",
  へ: "へや (heya) means room. へ = he", ほ: "ほし (hoshi) means star. ほ = ho",
  ま: "まど (mado) means window. ま = ma", み: "みず (mizu) means water. み = mi", む: "むら (mura) means village. む = mu",
  め: "め (me) means eye. め = me", も: "もり (mori) means forest. も = mo",
  や: "やま (yama) means mountain. や = ya", ゆ: "ゆき (yuki) means snow. ゆ = yu", よ: "よる (yoru) means night. よ = yo",
  ら: "らくがき (rakugaki) means doodle. ら = ra", り: "りんご (ringo) means apple. り = ri", る: "るす (rusu) means away. る = ru",
  れ: "れきし (rekishi) means history. れ = re", ろ: "いろ (iro) means colour. ろ = ro",
  わ: "かわ (kawa) means river. わ = wa", を: "を (o) is the object particle. を = wo", ん: "ほん (hon) means book. ん = n",
};

// Korean hangul: columns are consonants, rows are ㅏ ㅓ ㅗ ㅜ ㅡ.
const KO_SRC = "가ga 거geo 고go 구gu 그geu 나na 너neo 노no 누nu 느neu 다da 더deo 도do 두du 드deu 라ra 러reo 로ro 루ru 르reu " +
  "마ma 머meo 모mo 무mu 므meu 바ba 버beo 보bo 부bu 브beu 사sa 서seo 소so 수su 스seu 아a 어eo 오o 우u 으eu " +
  "자ja 저jeo 조jo 주ju 즈jeu 차cha 처cheo 초cho 추chu 츠cheu";
const KO_CLUES: Record<string, string> = {
  가: "가방 (gabang) means bag. 가 = ga", 거: "거리 (geori) means street. 거 = geo", 고: "고양이 (goyangi) means cat. 고 = go",
  구: "구름 (gureum) means cloud. 구 = gu", 그: "그림 (geurim) means picture. 그 = geu",
  나: "나무 (namu) means tree. 나 = na", 너: "너 (neo) means you. 너 = neo", 노: "노래 (norae) means song. 노 = no",
  누: "눈 (nun) means eye / snow. 누 = nu", 느: "느리다 (neurida) means slow. 느 = neu",
  다: "다리 (dari) means bridge. 다 = da", 더: "더 (deo) means more. 더 = deo", 도: "도시 (dosi) means city. 도 = do",
  두: "두다 (duda) means to put. 두 = du", 드: "들 (deul) means field. 드 = deu",
  라: "라디오 (radio) means radio. 라 = ra", 러: "러시아 (reosia) means Russia. 러 = reo", 로: "로봇 (robot) means robot. 로 = ro",
  루: "루프 (rupeu) means loop. 루 = ru", 르: "르네 (reune) means René. 르 = reu",
  마: "마음 (maeum) means heart. 마 = ma", 머: "머리 (meori) means head. 머 = meo", 모: "모자 (moja) means hat. 모 = mo",
  무: "물 (mul) means water. 무 = mu", 므: "므릇 (meureut) means of course. 므 = meu",
  바: "바다 (bada) means sea. 바 = ba", 버: "버스 (beoseu) means bus. 버 = beo", 보: "보다 (boda) means to see. 보 = bo",
  부: "부엌 (bueok) means kitchen. 부 = bu", 브: "브이 (beui) means V. 브 = beu",
  사: "사랑 (sarang) means love. 사 = sa", 서: "서울 (seoul) means Seoul. 서 = seo", 소: "손 (son) means hand. 소 = so",
  수: "수박 (subak) means watermelon. 수 = su", 스: "스케치 (seukechi) means sketch. 스 = seu",
  아: "아이 (ai) means child. 아 = a", 어: "어디 (eodi) means where. 어 = eo", 오: "오늘 (oneul) means today. 오 = o",
  우: "우유 (uyu) means milk. 우 = u", 으: "음식 (eumsik) means food. 으 = eu",
  자: "자연 (jayeon) means nature. 자 = ja", 저: "저녁 (jeonyeok) means evening. 저 = jeo", 조: "조금 (jogeum) means a little. 조 = jo",
  주: "주다 (juda) means to give. 주 = ju", 즈: "즈음 (jeueum) means around then. 즈 = jeu",
  차: "차 (cha) means tea / car. 차 = cha", 처: "처음 (cheoeum) means first time. 처 = cheo", 초: "초등 (chodeung) means elementary. 초 = cho",
  추: "추다 (chuda) means to dance. 추 = chu", 츠: "츠 (cheu) is the cheu sound. 츠 = cheu",
};

export const LANGS: Record<Lang, Pack> = {
  ja: {
    label: "日本語  Japanese",
    chartTitle: "ひらがな  hiragana",
    unit: "kana",
    columns: ["", "k", "s", "t", "n", "h", "m", "y", "r", "w", "n"],
    vowels: ["a", "i", "u", "e", "o"],
    chart: parse(JA_SRC),
    clues: JA_CLUES,
    congrats: "おめでとう (omedetou, congratulations)",
    help: "Drag to look; WASD or the stick (bottom left) to move. Click the notebook by the door for instructions, read the plaques, then solve the hiragana chart.",
    notebook: `You are locked in the gallery after closing time. The only way out is the hiragana chart on the table at the far end of the west room (down the corridor) — fifteen kana are missing from it (a different fifteen each time you play).

Read the plaque under every painting: each one teaches a Japanese word and one kana. Then put those kana back in the right holes on the chart. Columns are consonants (k, s, t…), rows are vowels (a, i, u, e, o): か sits where k meets a.

Fill the chart correctly and the door will open.`,
    puzzleHint: "Columns are consonants, rows are vowels: か sits where k meets a. The plaques under the paintings tell you which kana makes which sound.",
    controlsChart: "On the table at the far end of the west room. Click it, pick a piece, tap the hole it belongs in. Tap a placed piece to take it back.",
  },
  ko: {
    label: "한국어  Korean",
    chartTitle: "한글  hangul",
    unit: "syllable",
    columns: ["g", "n", "d", "r", "m", "b", "s", "Ø", "j", "ch"],
    vowels: ["a", "eo", "o", "u", "eu"],
    chart: parse(KO_SRC),
    clues: KO_CLUES,
    congrats: "축하합니다 (chukahamnida, congratulations)",
    help: "Drag to look; WASD or the stick (bottom left) to move. Click the notebook by the door for instructions, read the plaques, then solve the hangul chart.",
    notebook: `You are locked in the gallery after closing time. The only way out is the hangul chart on the table at the far end of the west room (down the corridor) — fifteen syllables are missing from it (a different fifteen each time you play).

Read the plaque under every painting: each one teaches a Korean word and one hangul syllable. Then put those syllables back in the right holes on the chart. Columns are consonants (g, n, d…), rows are vowels (a, eo, o, u, eu): 가 sits where g meets a.

Fill the chart correctly and the door will open.`,
    puzzleHint: "Columns are consonants, rows are vowels: 가 sits where g meets a. The plaques under the paintings tell you which syllable makes which sound.",
    controlsChart: "On the table at the far end of the west room. Click it, pick a hangul piece, tap the hole it belongs in. Tap a placed piece to take it back.",
  },
};

const TITLE = 1.4;
export const CHART_ASPECT = (TITLE + LANGS.ja.vowels.length) / (LANGS.ja.columns.length + 1);

export type Placed = Record<number, string>;
type Round = { pieces: string[]; holes: number[]; clues: string[] };

const shuffle = <T>(arr: T[], rnd: () => number) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

export function deal(lang: Lang, n = MISSING, rnd: () => number = Math.random): Round {
  const { chart, clues } = LANGS[lang];
  const pool = chart.flatMap((c, i) => (c && clues[c.char] ? [{ i, char: c.char, clue: clues[c.char] }] : []));
  const picked = shuffle(pool, rnd).slice(0, Math.min(n, pool.length));
  return { pieces: shuffle(picked.map((p) => p.char), rnd), holes: picked.map((p) => p.i), clues: picked.map((p) => p.clue) };
}

export const wrong = (p: Placed, holes: number[], lang: Lang) =>
  holes.filter((i) => p[i] && p[i] !== LANGS[lang].chart[i]!.char);
export const solved = (p: Placed, holes: number[], lang: Lang) =>
  holes.every((i) => p[i] === LANGS[lang].chart[i]!.char);

const empty: Round = { pieces: [], holes: [], clues: [] };

export const usePuzzle = create<{ lang: Lang | null; placed: Placed; pick: string; escaped: boolean } & Round>(() => ({
  lang: null, placed: {}, pick: "", escaped: false, ...empty,
}));

export function start(lang: Lang, rnd: () => number = Math.random) {
  usePuzzle.setState({ lang, placed: {}, pick: "", escaped: false, ...deal(lang, MISSING, rnd) });
}

export function fresh(rnd: () => number = Math.random) {
  const lang = usePuzzle.getState().lang;
  if (!lang) return;
  usePuzzle.setState({ placed: {}, pick: "", escaped: false, ...deal(lang, MISSING, rnd) });
}

export function resetToTitle() {
  usePuzzle.setState({ lang: null, placed: {}, pick: "", escaped: false, ...empty });
}

export function tapHole(i: number) {
  const { placed, pick, holes, lang } = usePuzzle.getState();
  if (!lang) return;
  const next = { ...placed };
  if (pick) next[i] = pick;
  else delete next[i];
  usePuzzle.setState({ placed: next, pick: "", escaped: solved(next, holes, lang) });
}

export function drawChart(g: CanvasRenderingContext2D, placed: Placed, holes: number[], lang: Lang, cell = 96) {
  const p = LANGS[lang], rows = p.vowels.length, holeSet = new Set(holes);
  // One label column on the left, then one column per consonant group.
  const gridCols = (lang === "ja" ? p.columns.length : p.columns.length + 1);
  const top = cell * TITLE, W = cell * gridCols, H = top + cell * rows;
  g.canvas.width = W; g.canvas.height = H;
  g.fillStyle = "#f6efdf"; g.fillRect(0, 0, W, H);
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#2b2b2d";
  g.font = `700 ${cell * 0.42}px "Noto Sans JP", "Noto Sans KR", sans-serif`;
  g.fillText(p.chartTitle, W / 2, cell * 0.4);
  g.font = `${cell * 0.28}px sans-serif`; g.fillStyle = "#6b4636";
  if (lang === "ja") {
    p.columns.forEach((c, x) => g.fillText(c || "–", cell * (x + 1.5), top - cell * 0.3));
  } else {
    p.columns.forEach((c, x) => g.fillText(c, cell * (x + 1.5), top - cell * 0.3));
  }
  p.vowels.forEach((v, y) => g.fillText(v, cell * 0.5, top + cell * (y + 0.5)));
  p.chart.forEach((c, i) => {
    if (!c) return;
    const x = cell * (Math.floor(i / rows) + 1), y = top + cell * (i % rows), hole = holeSet.has(i), piece = placed[i];
    g.strokeStyle = "#b9ab92"; g.lineWidth = 2; g.strokeRect(x, y, cell, cell);
    if (hole && !piece) { g.fillStyle = "#3a3330"; g.fillRect(x + cell * 0.12, y + cell * 0.12, cell * 0.76, cell * 0.76); return; }
    if (piece) { g.fillStyle = "#6b4636"; g.beginPath(); g.arc(x + cell / 2, y + cell / 2, cell * 0.42, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = piece ? "#f6efdf" : "#2b2b2d"; g.font = `${cell * 0.5}px "Noto Sans JP", "Noto Sans KR", sans-serif`;
    g.fillText(piece || c.char, x + cell / 2, y + cell * (piece ? 0.5 : 0.42));
    if (!piece) { g.fillStyle = "#6d6a65"; g.font = `${cell * 0.18}px sans-serif`; g.fillText(c.romaji, x + cell / 2, y + cell * 0.82); }
  });
}
