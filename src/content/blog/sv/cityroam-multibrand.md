---
title: 'Att lansera ett andra märke: vad det faktiskt krävdes för att göra Cityroam flermärkes'
description: 'Att lägga till stöd för NAVEE-elsparkcyklar innebar att reverse-engineera en krypterad utmaning-svar-handskakning utan SDK och utan dokumentation, och en riktig enhetsabstraktion under den. Här är vad protokollet visade sig vara, och det enda omvända antagandet som fick ett tidigt utkast att loopa i all evighet.'
pubDate: 'Sep 06 2026'
updatedDate: 'Sep 16 2026'
heroImage: '/blog/cityroam-board-settings.jpg'
---

Cityroam var under större delen av sin livstid en Tynee-formad app: en bräda, ett protokoll, en underförstådd användare. Det var helt okej så länge det var ett projekt för att förstå mina egna åkturer på min egen bräda. Sedan ville en kompis att hans elsparkcykel, en NAVEE V40i Pro, skulle fungera på samma sätt, och "lägg till en andra enhet" slutade vara hypotetiskt.

Det fungerar nu. Elsparkcykeln parkopplas, autentiserar, strömmar telemetri och tar emot kommandon: körläge, energiåtervinning, lås, farthållare och lysen fungerar alla från samma app, på samma turinspelare, dashboard, widget och notiser som brädan redan använde. Det här inlägget handlar om vad som låg i vägen, för nästan inget av det var den del jag väntade mig.

> **En tidigare version av det här inlägget argumenterade för motsatsen**: att stöd för flera märken medvetet *inte* byggdes ännu, förrän två förutsättningar var på plats först. Det stämde när det skrevs, och sekvenseringsargumentet håller fortfarande: abstraktionen kom in före det andra märket, inte efter. Men arbetet har sedan dess lanserats och är verifierat fungerande på riktig hårdvara, så inlägget är omskrivet för att beskriva vad som hände i stället för vad som planerades.

## Den här gången fanns inget SDK att ta bort

Tuya, plattformen som Tynees tillverkare bygger på, publicerar ett riktigt, dokumenterat Android-SDK. [Att radera det](/sv/blog/cityroam-tuya-free) och ersätta det med en Kotlin GATT-klient byggd från grunden var ett eget arbete, men det utgick åtminstone från något dokumenterat.

NAVEE, vars elsparkcyklar tillverkas av en OEM vid namn Brightway Innovation Intelligent Technology, har ingen motsvarighet alls. Deras app pratar med elsparkcykeln över ett proprietärt, odokumenterat BLE-protokoll och med deras eget backend över ett REST-API utan publik dokumentation, utan API-nycklar för tredjepart och utan publicerat SDK. Här fanns inget leverantörs-SDK att ta bort, för det fanns aldrig något från början. Det var ett rent reverse-engineering-problem från första raden.

## Försprånget, och dess enda förgiftade detalj

En liten öppen källkodsgrupp som heter [`scooterteam`](https://github.com/scooterteam) reverse-engineerar Brightway-byggda elsparkcyklar, och deras MIT-licensierade repo `navee-st3-pro` dokumenterar en syskonmodell: ramformatet, ett autentiseringsschema med AES-128-ECB, och en kommandotabell som täcker lås, farthållare, lysen, hastighetsgränser och telemetri.

Den referensen sparade mig mycket tid, och innehöll också den enda detalj som kostade mest.

Deras `NaveeAuth.kt` **dekrypterar** utmaningen som elsparkcykeln skickar. Den officiella NAVEE-appen, dekompilerad, gör inte det: dess krypto-hjälpare initierar chiffret med `Cipher.ENCRYPT_MODE`. Den **krypterar** utmaningen och skickar tillbaka chiffertexten.

Gör man det baklänges misslyckas handskakningen på minsta möjliga informativa sätt. Elsparkcykeln slutar svara, länken bryts, och appen återansluter och gör om det, i all evighet.

## Vad handskakningen faktiskt är

När den officiella appens verkliga sekvens väl var kartlagd visade den sig vara stelbent, och varje steg spelar roll:

1. Begär en MTU på 148.
2. Vänta, aktivera sedan notiser på notify-karaktäristiken.
3. Vänta, skriv sedan en `0x30`-autentiseringsram.
4. Elsparkcykeln svarar på `0x30` med en 16 byte lång utmaning. Appen svarar `0x31` med den utmaningen **AES-128-ECB-krypterad** under nyckeln den angav. Elsparkcykeln svarar `0x31` med status 0. Appen skickar `0x30` igen; elsparkcykeln svarar `0x30`, status 0, ingen utmaning, och då är den autentiserad.
5. Appen ställer elsparkcykelns klocka och kör sedan normalt. Elsparkcykeln skickar telemetri kontinuerligt, och appen behandlar ett glapp på 7 sekunder i den strömmen som en död länk.

Ett tidigt utkast stannade vid steg 2 och autentiserade aldrig alls. Utöver det läste det standardkaraktäristikerna Battery Level och Device Name, som den officiella appen aldrig rör. Det visar sig spela roll: att läsa en krypterad karaktäristik får Android att påbörja bonding, och en enhet som inte förväntar sig en bonding-begäran svarar med att släppa anslutningen.

Det fanns alltså två oberoende orsaker till samma symptom, och en återanslutningsloop ovanpå som ivrigt dolde båda. Lösningen var inte smart. Den bestod i att läsa vad den officiella appen gör, i ordning, och sedan göra det och inget mer.

## Delen som egentligen var ett arkitekturproblem

Protokollet var det synliga arbetet. Det strukturella arbetet handlade om att ett andra märke inte skulle förvandla appen till en hög av villkorssatser.

Det som kom in först var en enhetsprofilabstraktion: ett gränssnitt som täcker anslutning, läsning av telemetri, läsning och skrivning av inställningar samt beräkning av räckvidd och effektivitet. Den befintliga Tynee-implementationen refaktorerades till den utan beteendeförändring, och NAVEE kom in som en andra implementation snarare än som en gren inuti den första.

Vinsten är att bara två saker är märkesspecifika: BLE-protokollmodulen och konto-API:et. Allt ovanför det körs oförändrat på båda enheterna: sessionslagret, turinspelaren, den nativa turjournalen, dashboarden, hemskärmswidgeten, notiserna. En elsparkcykel spelar in en tur genom exakt samma kodväg som en bräda.

Den sekvenseringen var medveten och den var rätt. Att spika fast en `NaveeProfile` på kod som hårdkodade antaganden om en enda bräda hade fungerat i den snäva meningen att få en andra enhet att ansluta, och hade inneburit att göra om hela saken ordentligt senare.

## Där det andra märket visade sig enklare

Allt med ett andra märke är inte mer arbete. NAVEE:s telemetri exponerar total- och turmätarställning direkt och kontinuerligt. Tynees bräda exponerade aldrig tillförlitligt en live-siffra för mätarställning, vilket är anledningen till att vägmätarlogiken bär på en reserv förankrad i turhistoriken. Elsparkcykeln berättar bara hur långt den åkt, så den reserven går tillbaka till att vara ett offline-skyddsnät i stället för huvudvägen.

Det som inte gick att återanvända var effektivitetsmodellen. Tynees profil per läge är byggd kring just den brädans ESC-lägen; elsparkcykeln behövde en egen, anpassad efter hur dess lägen och hastighetsgränser faktiskt beter sig. Att kopiera siffror inställda för annan hårdvara hade gett självsäkra, felaktiga räckviddsuppskattningar, vilket är sämre än inga alls.

## Vad jag tar med mig

Två saker.

Den första är att en bra referensimplementation fortfarande är ett påstående som ska kontrolleras, inte ett faktum. `scooterteam`s arbete sparade väldigt mycket tid och innehöll ett omvänt antagande som kostade en del av den tillbaka. Det som avgjorde saken var inte resonemang om vilket som lät rimligast. Det var att dekompilera den officiella appen och läsa vilket läge chiffret initierades i.

Den andra är att abstraktionen förtjänade sin plats genom att komma in *före* den andra enheten, inte efter. Det är den minst synliga delen av det här arbetet och det enda skälet till att den intressanta delen förblev liten.
