---
title: 'Reverse-engineering av en Bluetooth-skateboard, och modellering av dess fysik istället för att gissa'
description: 'Hur Turbo pratar direkt med brädan över BLE, varför en linjär uppskattning av räckvidd baserad på batteriprocent inte var tillräckligt bra, och vad en självhostad OSRM-instans gör i ett hobbyprojekt.'
pubDate: 'Sep 03 2026'
heroImage: '/blog/turbo-dashboard.png'
---

Jag åker elskateboard, en Tuya-uppkopplad bräda som ur kartongen är designad att styras genom en telefonapp som pratar med Tuyas moln. Det är helt okej för att slå på den och välja ett läge. Det är inte okej om man faktiskt vill förstå åkturen: hur mycket räckvidd som verkligen är kvar, vilket läge man var i när batteriet sjönk snabbast, eller om de där "23 km/h" som appen visade i två sekunder var på riktigt eller en Bluetooth-hicka. Så jag byggde **Turbo**, en Android-app plus en självhostad backend, för att äga den datan från början till slut.

<figure>
  <img src="/blog/turbo-dashboard.png" alt="Turbo-dashboardens skärm som visar batteri, spänning, körläge och senaste åkturer" />
  <figcaption>Dashboarden: live-telemetri från brädan läst direkt över Bluetooth, ingen molnresa</figcaption>
</figure>

## Att komma bort från Tuyas moln

Standardvägen genom appen är: telefon till Tuya Cloud till bräda. Det fungerar, men det betyder att varje läsning av batteriprocent eller varje inställningsändring gör en resa genom en tredje parts servrar, med deras latens och deras tillgänglighet. Jag ville att telefonen skulle prata direkt med brädan, så Turbo använder **Direct BLE**, Tuya SDK:ns lokala Bluetooth-väg, istället för molnets API.

I praktiken innebar det att kartlägga brädans faktiska data point-protokoll (DP): vilken BLE-karaktäristik som bär vilket värde, hur körläge, hastighetsgränser, accelerations-/bromskurvor och motorkonfiguration är kodade, och hur man skriver tillbaka inställningar utan molnresor. När det väl var löst kom vinsten direkt: live-telemetri (batteri, spänning, vägmätare, aktivt läge) och en fullt redigerbar inställningsskärm, allt offline-kapabelt, allt under appens egen kontroll.

Backenden, per design, **rör aldrig Bluetooth alls**. Den har ingen radio och ingen anslutning till brädan. Telefonen är det enda som någonsin pratar med brädan, och den skickar till backenden vilken live-avläsning en förfrågan behöver (t.ex. skickas batteriprocent och spänning som query-parametrar till räckvidds-endpointen). Den uppdelningen höll backenden enkel och testbar, och betydde att en egenhet i brädans firmware aldrig blir en backend-bugg.

<figure>
  <img src="/blog/turbo-board-config.png" alt="Skärm för brädkonfiguration med hastighetsgränser per läge, accelerations- och bromskurvor, och live-telemetri" />
  <figcaption>Fullständiga brädinställningar: hastighetsgränser, accelerations-/bromskurvor, motorkonfiguration, läst och skriven över Direct BLE</figcaption>
</figure>

## Varför räckviddsberäkning behövde riktig fysik

Det uppenbara sättet att uppskatta återstående räckvidd är: batteriprocent gånger något genomsnittligt km-per-procent-tal. Jag började där, och det var fel tillräckligt ofta för att vara oanvändbart, eftersom "hur långt en procent batteri räcker" inte är en konstant. Det beror kraftigt på vilket av brädans fyra körlägen (`eco`, `ride`, `speed`, `turbo`) man är i, eftersom varje läge drar ström i olika takt för olika topphastighet.

Så backenden håller en **effektivitetsprofil** per läge, ombyggd från riktig åkturshistorik: kilometer per procent och kilometer per volt, per läge, plus hur många åkturer som faktiskt bidragit till det talet. Om det inte finns tillräckligt med historik ännu för ett läge, kommer uppskattningen för det läget tillbaka som `null`, medvetet, inte en påhittad nolla. Den distinktionen (ingen data ännu kontra en bekräftad nolla) låter pedantisk tills man sitter och stirrar på en dashboard och försöker skilja "jag har inte åkt i turbo-läge tillräckligt många gånger för att veta" från "turbo-läge ger dig noll räckvidd", vilket är väldigt olika fakta.

Ovanpå de empiriska effektivitetstalen finns ett andra lager: en anpassad **fysikprofil** per läge, rullmotstånd, luftmotstånd och drivlineeffektivitet, härledd från åkturshistorik och använd för att skala uppskattningen när en live vikt-/vindavläsning finns tillgänglig. Det empiriska talet svarar på "vad har faktiskt hänt"; fysikmodellen låter det generalisera lite längre än enbart rå historik skulle göra.

## Att få brusig GPS att se ut som en riktig rutt

Telefon-GPS på en åktur som slingrar sig genom gator och cykelbanor är brusig nog att en rått inspelad spårning synligt skär genom byggnader istället för att följa vägen. Istället för att acceptera det passerar åktursrutter genom en självhostad **OSRM**-instans map-matching-endpoint, som snäpper inspelningen till den faktiska väggrafen. Om OSRM inte är konfigurerad behåller åkturer bara sin rå rutt; berikning är designad att degradera, aldrig att fela en åkturs sparning.

En detalj som spelade större roll än väntat: OSRM-datan måste byggas med **cykel**-ruttningsprofilen, inte bil. Den här brädan spenderar det mesta av sin tid på cykelbanor som en bilorienterad väggraf helt enkelt inte bär som kanter, så att använda fel profil betydde att rutter tyst misslyckades att snäppa på exakt de segment som spelade störst roll. Den är också beskuren till en stadsstor bounding box istället för ett helt lands utsnitt, efter att ett landsomfattande cykelutsnitt OOM-dödade extraktionsprocessen på den blygsamma servern allt det här körs på.

Åkturer berikas också med väder (väderkoder, känns-som-temperatur, vindhastighet) genomsnittat över åktursresans tidsfönster från ett nyckelfritt väder-API, så att en åkturdetaljvy kan visa hur åkturen faktiskt kändes, inte bara vart den gick.

<figure>
  <img src="/blog/turbo-trip-detail.png" alt="Skärm för åktursdetaljer med karta, fördelning per körläge, och spänningsgraf" />
  <figcaption>Åktursdetaljer: snäppt rutt, lägesfördelning, och en spänningsgraf hämtad från åkturens mätvärden</figcaption>
</figure>

## Att behandla ett hobbyprojekts data som om det spelade roll

Eftersom åktursstatistik är det som räckvidds- och effektivitetsmodellerna byggs från, ville jag inte ha den bakom en delad statisk token på det sätt många personliga projekt slutar med. Turbo har riktiga per-användarkonton (argon2id-hashade lösenord, sessionstokens med 90 dagars rullande giltighet) utan publik registrering; konton utfärdas av admin. Varje åktur, pågående åktur, effektivitetsprofil och loggpost är knuten till användaren som skapade den. Det finns också en liten adminpanel för kontohantering och läs-/felsökningsinspektion av datan, medvetet låst till läsning/radering för åktursstabellerna, eftersom riktiga skrivningar går genom samma berikningslogik som en normal åktursparning använder, så att ett adminformulär inte tyst kan få en åktur att avvika från vad som faktiskt hände.

## Vad det här till slut bevisar

Inget av det här behövde vara så här grundligt för en personlig ridtracker. Jag kunde ha levererat en GPS-logger och en batteriprocent och kallat det klart. Anledningen till att det inte är det är samma anledning som jag angriper produktionsarbete på det sätt jag gör: de intressanta buggarna finns i kantfallen, null kontra noll, ett brädläge med för lite historik att lita på, en rutt som borde ha snäppt och tyst inte gjorde det, och ett system som är ärligt om de fallen är värt mer än ett som alltid har ett självsäkert svar.
