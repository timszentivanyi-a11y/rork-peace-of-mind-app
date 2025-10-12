export const MOTIVATIONAL_QUOTES = [
  "Každý den je nová příležitost stát se lepší verzí sebe sama. Malé kroky vedou k velkým změnám.",
  "Úspěch není konečný, neúspěch není fatální. Důležitá je odvaha pokračovat.",
  "Věř v sebe a všechno je možné. Tvá síla je větší, než si myslíš.",
  "Štěstí není cíl, ale způsob života. Najdi radost v malých věcech.",
  "Změna začíná rozhodnutím přestat dělat výmluvy a začít jednat.",
  "Tvé myšlenky formují tvou realitu. Mysli pozitivně a pozitivní věci přijdou.",
  "Každý expert byl kdysi začátečník. Každý profesionál byl kdysi amatér.",
  "Nejlepší čas zasadit strom byl před 20 lety. Druhý nejlepší čas je teď.",
  "Neporovnávej se s ostatními. Porovnávej se s tím, kým jsi byl včera.",
  "Obtíže nepřicházejí, aby tě zničily, ale aby odhalily tvou sílu.",
  "Tvá jediná hranice je ta, kterou si sám stanovíš ve své mysli.",
  "Malé pokroky každý den vedou k velkým výsledkům.",
  "Buď vděčný za to, co máš, a budeš mít více.",
  "Život je 10% to, co se ti stane, a 90% to, jak na to reaguješ.",
  "Nejkrásnější věci v životě nejsou věci. Jsou to lidé, místa a vzpomínky.",
  "Tvá budoucnost je vytvářena tím, co děláš dnes, ne zítra.",
  "Každý den je dar. Proto se mu říká přítomnost.",
  "Úsměv je křivka, která všechno narovná.",
  "Buď změnou, kterou chceš vidět ve světě.",
  "Síla nespočívá v tom, co dokážeš, ale v tom, jak překonáš to, co jsi myslel, že nedokážeš.",
  "Každý západ slunce přináší slib nového úsvitu.",
  "Tvé sny jsou platné. Pracuj na nich každý den.",
  "Pozitivní myšlení není o tom ignorovat problémy, ale najít v nich příležitosti.",
  "Buď sám se sebou trpělivý. Růst potřebuje čas.",
  "Každý krok vpřed, i ten nejmenší, je pokrok.",
  "Tvá hodnota není určena tvými chybami, ale tím, jak se z nich učíš.",
  "Dnes je perfektní den na to začít něco nového.",
  "Věř v proces. Důvěřuj své cestě.",
  "Tvá síla roste v momentech, kdy si myslíš, že už nemůžeš, ale pokračuješ.",
  "Každý den je nová stránka v knize tvého života. Napiš krásný příběh.",
  "Buď laskavý k sobě. Jsi na cestě, ne v cíli."
];

export function getTodaysQuote(): string {
  const today = new Date();
  const dayOfMonth = today.getDate(); // 1-31
  const quoteIndex = (dayOfMonth - 1) % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[quoteIndex];
}