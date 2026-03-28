export const affirmations = [
  "Jsem silný/á, schopný/á a zasloužím si štěstí. Každý den se stávám lepší verzí sebe sama.",
  "Mám v sobě sílu překonat všechny výzvy, které mi život přinese.",
  "Jsem vděčný/á za všechno dobré ve svém životě a přitahuji ještě více pozitivity.",
  "Věřím ve své schopnosti a důvěřujem svému vnitřnímu hlasu.",
  "Každý den je nová příležitost k růstu a učení se.",
  "Jsem v míru se sebou samým/samou a s okolním světem.",
  "Moje mysl je klidná a soustředěná na pozitivní věci.",
  "Zasloužím si lásku, respekt a štěstí ve všech oblastech života.",
  "Jsem odolný/á a dokážu se vyrovnat s jakoukoliv situací.",
  "Každý den přináším do světa něco pozitivního a hodnotného.",
  "Jsem vděčný/á za své tělo a starám se o něj s láskou.",
  "Moje budoucnost je plná nekonečných možností a příležitostí.",
  "Jsem obklopen/a láskou a podporou lidí, kteří mě mají rádi.",
  "Důvěřujem procesu života a vím, že vše se děje z nějakého důvodu.",
  "Jsem tvůrcem/tvůrkyní svého vlastního štěstí a úspěchu.",
  "Každý den se učím něco nového a rozvíjím své schopnosti.",
  "Jsem v harmonii se svými emocemi a umím je zdravě vyjadřovat.",
  "Moje přítomnost přináší radost a pozitivitu ostatním lidem.",
  "Jsem hrdý/á na svůj pokrok a oslavuji každý malý úspěch.",
  "Život je krásný dar a já si ho plně užívám každý den.",
  "Jsem schopen/schopna odpustit sobě i ostatním a jít dál.",
  "Moje intuice mě vede správným směrem v životě.",
  "Jsem obklopen/a hojností a prosperitou ve všech formách.",
  "Každý den se probouzím s nadšením a vděčností za nový den.",
  "Jsem jedinečný/jedinečná a mám co nabídnout tomuto světu.",
  "Moje zdraví se každým dnem zlepšuje a cítím se skvěle.",
  "Jsem v míru s minulostí a těším se na budoucnost.",
  "Moje vztahy jsou založené na lásce, respektu a vzájemném porozumění.",
  "Jsem schopen/schopna dosáhnout všeho, co si předsevezmu.",
  "Každý den je příležitost k tomu, abych byl/byla nejlepší verzí sebe sama."
];

export const getTodayAffirmation = (): string => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return affirmations[dayOfYear % affirmations.length];
};