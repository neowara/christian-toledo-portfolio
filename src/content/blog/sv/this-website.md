---
title: 'Den här webbplatsen: designbesluten bakom en portfolio som beter sig som en produkt'
description: 'Varför den här sajten är en statisk Astro-bygge med en mörk ingenjörsanteckningsbok-estetik, hur innehållet är strukturerat för att bevisa hur jag arbetar snarare än bara påstå det, och de små designreglerna som håller den sammanhållen.'
pubDate: 'Sep 04 2026'
heroImage: '/og-image.png'
---

Den här sajten är en portfolio, men jag ville inte att den skulle kännas som en. De flesta portfolior är ett galleri av skärmdumpar och en lista med tekniknamn, och de bevisar väldigt lite om hur personen bakom faktiskt arbetar. Den här är byggd kring en annan idé: sajten själv ska bete sig som en produkt jag skulle leverera på jobbet, och innehållet ska visa de vanor jag påstår mig ha, inte bara beskriva dem.

Så det här inlägget är lite meta. Det handlar om webbplatsen du läser just nu, och resonemanget bakom hur den är uppbyggd.

## En statisk sajt, medvetet

Hela sajten är en statisk Astro-bygge, distribuerad till Cloudflare Workers. Det finns ingen databas, inget server-side-tillstånd, ingen byggtidsmagi utöver det Astro ger dig gratis. Det är ett val, inte en begränsning.

En portfolio har nästan inga dynamiska krav. Det är en handfull sidor, två språk och en liten blogg. Att ta till ett tungt ramverk eller en CMS för det vore precis den typen av överkonstruktion jag argumenterar emot i resten av mitt arbete. Statisk output betyder att sajten är snabb av konstruktion, billig att hosta och har nästan ingen attackyta. Den enda "infrastrukturen" är en innehållspipeline: Markdown-filer i `src/content/blog/`, en per inlägg, på både engelska och svenska, validerade mot ett schema vid byggtid.

Den tvåspråkiga uppsättningen är värd att lyfta fram. Varje sida och varje blogginlägg finns i både `en` och `sv`, och routingen speglar det (`/blog/...` och `/sv/blog/...`). Att hålla de två i synk är en disciplinfråga, inte en teknisk sådan, och det är samma disciplin jag tar med mig till att hålla dokumentation aktuell i en riktig kodbas.

## "Ingenjörsanteckningsboken"-estetiken

Den visuella designen är byggd kring en idé jag hela tiden återkom till: den här sajten ska se ut som en ingenjörsanteckningsbok, inte en marknadsföringssida. Den enda begränsningen löste en mängd mindre beslut.

Mörk som standard, med en accentfärg. Accenten är en varm bärnsten, använd sparsamt: eyebrows, nodprickar, enstaka ramar. Monospace är reserverat för metadata och etiketter, aldrig för brödtext. Det finns inget glow, ingen neon, ingen clip-path-dekoration, inget som skriker "titta på mina designkunskaper." Återhållsamheten är poängen. En anteckningsbok är ett verktyg, och verktyg ska komma ur vägen.

Typografin är Atkinson Hyperlegible, vald för läsbarhet snarare än mode, med JetBrains Mono för de kodinspirerade etiketterna. Även de små detaljerna förstärker temat: sektions-eyebrows läser som filsökvägar, och sektionen "Hur jag arbetar" visar sina fyra värden som noder förenade av en linje, som ett litet diagram man skulle skissa i marginalen.

## Innehåll som bevisar påståendena

Startsidan leder med två system, Turbo och casa-verde, och var och en har ett djupdykningsinlägg som går in på den faktiska ingenjörskonsten: reverse-engineering av ett Bluetooth-protokoll, att anpassa en fysikmodell till räckviddsdata, att driva ett hemmalabb med skrivna ADR:er. Det här är inte "titta vad jag gjort"-inlägg. De är bevis för påståendena i Om-sektionen, att jag skriver ner saker och att jag bryr mig om gränsfallen.

Det är den strukturella poängen. Om-sidan anger värden som "skriver ner saker" och "genuint självdriven," och resten av sajten är arrangerad så att de påståendena går att kontrollera. Beslutsloggen för casa-verde nämns inte bara, den länkas. Sektionen "När jag inte kodar" visar hobbyn som matar tillbaka in i arbetet, en elskateboard som blev en Android-app, ett hemmalabb som blev en läxa i infrastruktur.

## Små regler som håller den sammanhållen

Några designregler bär hela sajten och är värda att skriva ner, för de är den typen av sak som hindrar en liten sajt från att driva iväg:

- **En accentfärg, använd med avsikt.** Om något ska sticka ut får det bärnstenen. Allt annat håller sig i den neutrala skalan.
- **Monospace betyder metadata.** Datum, taggar, etiketter, filsökvägs-eyebrows. Brödtext är aldrig monospace.
- **Kort och ramar gör layoutjobbet.** Inga tunga skuggor eller gradienter; höjd kommuniceras med bakgrundstoner och hårfina ramar.
- **Allt har en anledning.** Om en sektion eller en stil inte förtjänar sin plats, stannar den inte.

## Varför bry sig

Det hade gått snabbare att slänga in en mall och kalla det klart. Men sajten är den enda artefakten där jag har total kontroll över både kod och innehåll, så det är platsen att visa vad jag faktiskt värderar: återhållsamhet framför dekoration, bevis framför påståenden, och grunderna rätt innan något annat spelar roll. Det är samma standard jag skulle vilja hålla vilken kodbas jag än arbetar i, och det kändes rätt att hålla även den här till den.
