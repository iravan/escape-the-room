import { create } from "zustand";

// The final puzzle: a printed hiragana chart (gojūon) on a table at the end of the gallery, with holes in it.
// Columns are the consonant rows (a k s t n h m y r w n), five vowels (a i u e o) each; "-" = no kana there.
const SRC = "あa いi うu えe おo かka きki くku けke こko さsa しshi すsu せse そso たta ちchi つtsu てte とto なna にni ぬnu ねne のno " +
  "はha ひhi ふfu へhe ほho まma みmi むmu めme もmo やya - ゆyu - よyo らra りri るru れre ろro わwa - - - をwo んn - - - -";
export type Cell = { kana: string; romaji: string } | null;
export const CHART: Cell[] = SRC.split(" ").map((c) => (c === "-" ? null : { kana: c[0], romaji: c.slice(1) }));
export const COLUMNS = ["", "k", "s", "t", "n", "h", "m", "y", "r", "w", "n"];
export const VOWELS = ["a", "i", "u", "e", "o"];
const TITLE = 1.4; // title + header strip, in cells
export const CHART_ASPECT = (TITLE + VOWELS.length) / (COLUMNS.length + 1); // printed chart, height ÷ width

// One teaching clue per kana (shown on a painting plaque). Each deal picks a random subset — one per painting.
export const CLUES: Record<string, string> = {
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

export const MISSING = 15; // one hole / plaque per painting

export type Placed = Record<number, string>; // hole (chart index) → piece put there
type Round = { pieces: string[]; holes: number[]; clues: string[] }; // tray order; chart indices; plaque text per painting

const shuffle = <T>(arr: T[], rnd: () => number) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

// Pick `n` random kana that have clues, shuffle the tray, and assign each painting a matching plaque.
export function deal(n = MISSING, rnd: () => number = Math.random): Round {
  const pool = CHART.flatMap((c, i) => (c && CLUES[c.kana] ? [{ i, kana: c.kana, clue: CLUES[c.kana] }] : []));
  const picked = shuffle(pool, rnd).slice(0, Math.min(n, pool.length));
  return { pieces: shuffle(picked.map((p) => p.kana), rnd), holes: picked.map((p) => p.i), clues: picked.map((p) => p.clue) };
}

export const wrong = (p: Placed, holes: number[]) => holes.filter((i) => p[i] && p[i] !== CHART[i]!.kana);
export const solved = (p: Placed, holes: number[]) => holes.every((i) => p[i] === CHART[i]!.kana);

// `pick` = the piece in hand; `escaped` = the chart is complete and right: the game is over.
// A new deal runs on first load and on Play again (see `fresh`).
export const usePuzzle = create<{ placed: Placed; pick: string; escaped: boolean } & Round>(() => ({
  placed: {}, pick: "", escaped: false, ...deal(),
}));

export function fresh(rnd: () => number = Math.random) {
  usePuzzle.setState({ placed: {}, pick: "", escaped: false, ...deal(MISSING, rnd) });
}

// Tap a hole: put the piece in hand there (the one already there goes back to the tray), or take its piece back.
export function tapHole(i: number) {
  const { placed, pick, holes } = usePuzzle.getState(), next = { ...placed };
  if (pick) next[i] = pick;
  else delete next[i];
  usePuzzle.setState({ placed: next, pick: "", escaped: solved(next, holes) });
}

// Draw the chart as printed on paper: headers, every kana with its romaji, empty holes, and the pieces put in them.
export function drawChart(g: CanvasRenderingContext2D, placed: Placed, holes: number[], cell = 96) {
  const top = cell * TITLE, W = cell * (COLUMNS.length + 1), H = top + cell * VOWELS.length, holeSet = new Set(holes);
  g.canvas.width = W; g.canvas.height = H;
  g.fillStyle = "#f6efdf"; g.fillRect(0, 0, W, H);
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#2b2b2d";
  g.font = `700 ${cell * 0.42}px "Noto Sans JP", sans-serif`;
  g.fillText("ひらがな  hiragana", W / 2, cell * 0.4);
  g.font = `${cell * 0.3}px sans-serif`; g.fillStyle = "#6b4636";
  COLUMNS.forEach((c, x) => g.fillText(c || "–", cell * (x + 1.5), top - cell * 0.3));
  VOWELS.forEach((v, y) => g.fillText(v, cell * 0.5, top + cell * (y + 0.5)));
  CHART.forEach((c, i) => {
    if (!c) return;
    const x = cell * (Math.floor(i / 5) + 1), y = top + cell * (i % 5), hole = holeSet.has(i), piece = placed[i];
    g.strokeStyle = "#b9ab92"; g.lineWidth = 2; g.strokeRect(x, y, cell, cell);
    if (hole && !piece) { g.fillStyle = "#3a3330"; g.fillRect(x + cell * 0.12, y + cell * 0.12, cell * 0.76, cell * 0.76); return; }
    if (piece) { g.fillStyle = "#6b4636"; g.beginPath(); g.arc(x + cell / 2, y + cell / 2, cell * 0.42, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = piece ? "#f6efdf" : "#2b2b2d"; g.font = `${cell * 0.5}px "Noto Sans JP", sans-serif`;
    g.fillText(piece || c.kana, x + cell / 2, y + cell * (piece ? 0.5 : 0.42));
    if (!piece) { g.fillStyle = "#6d6a65"; g.font = `${cell * 0.18}px sans-serif`; g.fillText(c.romaji, x + cell / 2, y + cell * 0.82); }
  });
}
