const NIZZA_CLASSES: Record<number, string> = {
  1: "Chemische Erzeugnisse für gewerbliche, wissenschaftliche, fotografische, land-, garten- und forstwirtschaftliche Zwecke",
  2: "Farben, Firnisse, Lacke; Rostschutzmittel, Holzkonservierungsmittel; Färbemittel, Farbstoffe; Druckfarben",
  3: "Wasch- und Bleichmittel; Putz-, Polier-, Fettentfernungs- und Schleifmittel; Parfümerien, Mittel zur Körper- und Schönheitspflege, Haarwässer; Zahnputzmittel",
  4: "Technische Öle und Fette; Schmiermittel; Brennstoffe und Leuchtstoffe; Kerzen und Dochte für Beleuchtungszwecke",
  5: "Pharmazeutische und veterinärmedizinische Erzeugnisse; Hygienepräparate für medizinische Zwecke; diätetische Lebensmittel und Erzeugnisse für medizinische oder veterinärmedizinische Zwecke",
  6: "Unedle Metalle und deren Legierungen; Baumaterialien aus Metall; transportable Bauten aus Metall; Schlosserarbeiten und Kleineisenwaren; Metallrohre; Geldschränke",
  7: "Maschinen und Werkzeugmaschinen; Motoren (ausgenommen Motoren für Landfahrzeuge); Kupplungen und Vorrichtungen zur Kraftübertragung (ausgenommen solche für Landfahrzeuge)",
  8: "Handwerkzeuge und handgetriebene Geräte; Messerschmiedewaren, Gabeln und Löffel; Hieb- und Stichwaffen; Rasierapparate",
  9: "Wissenschaftliche, Schifffahrts-, Vermessungs-, fotografische, Film-, optische Apparate und Instrumente; elektrische Apparate und Instrumente; Computer, Software",
  10: "Chirurgische, ärztliche, zahn- und tierärztliche Instrumente und Apparate; künstliche Gliedmaßen, Augen und Zähne; orthopädische Artikel; chirurgisches Nahtmaterial",
  11: "Beleuchtungs-, Heizungs-, Dampferzeugungs-, Koch-, Kühl-, Trocken-, Lüftungs- und Wasserleitungsgeräte sowie sanitäre Anlagen",
  12: "Fahrzeuge; Apparate zur Beförderung auf dem Lande, in der Luft oder auf dem Wasser",
  13: "Schusswaffen; Munition und Geschosse; Sprengstoffe; Feuerwerkskörper",
  14: "Edelmetalle und deren Legierungen; Juwelierwaren, Schmuckwaren, Edelsteine; Uhren und Zeitmessinstrumente",
  15: "Musikinstrumente",
  16: "Papier und Pappe (Karton); Druckereierzeugnisse; Buchbinderartikel; Fotografien; Schreibwaren und Büroartikel (ausgenommen Möbel)",
  17: "Kautschuk, Guttapercha, Gummi, Asbest, Glimmer; Waren daraus; Schläuche (nicht aus Metall); Dichtungs-, Polster- und Isoliermaterial",
  18: "Leder und Lederimitationen; Häute und Felle; Reise- und Handkoffer; Regenschirme und Sonnenschirme; Spazierstöcke; Peitschen, Pferdegeschirr und Sattlerwaren",
  19: "Baumaterialien (nicht aus Metall); Rohre (nicht aus Metall) für Bauzwecke; Asphalt, Pech, Teer und Bitumen; transportable Bauten (nicht aus Metall); Denkmäler (nicht aus Metall)",
  20: "Möbel, Spiegel, Bilderrahmen; Waren aus Holz, Kork, Rohr, Binsen, Weide, Horn, Knochen, Elfenbein, Fischbein, Schildpatt, Bernstein, Perlmutter, Meerschaum",
  21: "Geräte und Behälter für Haushalt und Küche; Glaswaren, Porzellan und Steingut; Kämme und Schwämme; Bürsten und Pinsel; Putzzeug; Stahlwolle",
  22: "Seile und Bindfaden; Netze, Zelte und Planen; Polsterfüllstoffe; rohe Gespinstfasern",
  23: "Garne und Fäden für textile Zwecke",
  24: "Webstoffe und Textilwaren, soweit nicht in anderen Klassen enthalten; Bett- und Tischdecken",
  25: "Bekleidungsstücke, Schuhwaren, Kopfbedeckungen",
  26: "Spitzen und Stickereien, Bänder und Schnürbänder; Knöpfe, Haken und Ösen, Nadeln; künstliche Blumen; Haarschmuck; Kunsthaar",
  27: "Teppiche, Fußmatten, Matten, Linoleum und andere Fußbodenbeläge; Tapeten (ausgenommen aus textilem Material)",
  28: "Spiele und Spielzeug; Turn- und Sportartikel; Christbaumschmuck",
  29: "Fleisch, Fisch, Geflügel und Wild; Fleischextrakte; konserviertes, tiefgekühltes, getrocknetes und gekochtes Obst und Gemüse; Gallerten (Gelees); Konfitüren, Kompotte; Eier; Milch, Käse, Butter, Joghurt",
  30: "Kaffee, Tee, Kakao und Kaffee-Ersatzmittel; Reis, Nudeln; Mehle und Getreidepräparate; Brot, feine Backwaren und Konditorwaren; Speiseeis; Zucker, Honig; Gewürze",
  31: "Rohes oder teilweise bearbeitetes Getreide; lebende Tiere; frisches Obst und Gemüse; natürliche Pflanzen und Blumen; Tierfutter; Malz",
  32: "Biere; Mineralwässer und kohlensäurehaltige Wässer; alkoholfreie Getränke; Fruchtgetränke und Fruchtsäfte; Sirupe und andere Präparate für die Zubereitung von Getränken",
  33: "Alkoholische Getränke (ausgenommen Biere)",
  34: "Tabak; Raucherartikel; Streichhölzer",
  35: "Werbung; Geschäftsführung; Unternehmensverwaltung; Büroarbeiten",
  36: "Versicherungswesen; Finanzwesen; Geldgeschäfte; Immobilienwesen",
  37: "Bauwesen; Reparaturwesen; Installationsarbeiten",
  38: "Telekommunikation",
  39: "Transportwesen; Verpackung und Lagerung von Waren; Veranstaltung von Reisen",
  40: "Materialbearbeitung",
  41: "Erziehung; Ausbildung; Unterhaltung; sportliche und kulturelle Aktivitäten",
  42: "Wissenschaftliche und technologische Dienstleistungen und Forschungsarbeiten; Industrielle Analyse- und Forschungsdienstleistungen; Entwurf und Entwicklung von Computerhardware und -software",
  43: "Dienstleistungen zur Verpflegung und Beherbergung von Gästen",
  44: "Medizinische und veterinärmedizinische Dienstleistungen; Gesundheits- und Schönheitspflege für Menschen und Tiere; Dienstleistungen im Bereich der Land-, Garten- oder Forstwirtschaft",
  45: "Juristische Dienstleistungen; Sicherheitsdienste zum physischen Schutz von Sachgütern oder Personen; von Dritten erbrachte persönliche und soziale Dienstleistungen",
};

export function getNizzaDescription(classNumber: number): string {
  return NIZZA_CLASSES[classNumber] ?? `Unbekannte Klasse ${classNumber}`;
}

export function enrichNizzaClasses(
  classes: number[]
): { classNumber: number; description: string }[] {
  return classes.map((c) => ({
    classNumber: c,
    description: getNizzaDescription(c),
  }));
}
