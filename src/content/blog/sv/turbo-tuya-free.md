---
title: 'Att ta bort Tuya SDK:t: att återimplementera ett proprietärt BLE-protokoll från grunden'
description: 'Hur Turbo gick från att wrappa Tuyas Direct BLE SDK till en Kotlin GATT-klient byggd från grunden, utan SDK, utan molnberoende, och utan något pågående Tuya-krav alls, och vad som faktiskt krävdes för att få ramformatet, krypteringen och handskakningen rätt.'
pubDate: 'Sep 06 2026'
heroImage: '/blog/turbo-tuya-settings.jpg'
---

Tidigare inlägg om Turbo beskriver den som att använda "Direct BLE, Tuya SDK:ns lokala Bluetooth-väg" för att prata med brädan utan att gå via Tuyas moln. Det var sant, och det var också inte hela historien. Appen länkar inte Tuya SDK:t alls längre. `grep -ri thingclips mobile/` i appens källkod returnerar ingenting. Det som ersatte det är en Kotlin-implementation byggd från grunden av brädans faktiska trådprotokoll, reverse-engineerat och återimplementerat en opcode i taget.

<figure>
  <img src="/blog/turbo-tuya-settings.jpg" alt="Turbos inställningshubb med rutor för brädanslutning, körspårning och utseende" />
  <figcaption>Brädanslutning är en inställningsruta nu, inget SDK, inget pågående kontokrav för att åka</figcaption>
</figure>

## Varför SDK-vägen aldrig var slutmålet

Tuyas Direct BLE SDK är en riktig förbättring jämfört med att routa varje läsning genom Tuyas moln, den pratar faktiskt direkt med brädan över Bluetooth. Men det är fortfarande ett SDK: ett beroende av Tuyas Android-bibliotek, dess egen bindnings- och parkopplingsmodell, och en design som (i SDK:ns eget flöde) stjäl enhetens Tuya-app-bindning istället för att dela den. Bra nog för att lansera, inte bra nog för att stanna där. Det faktiska målet, nedskrivet innan något implementationsarbete började, var rakt på sak: leverera en build med **inget Tuya SDK i APK:n, inget Tuya-utvecklarkonto, och ingen Tuya-prenumeration**, medan brädan förblir parkopplad i den officiella Tuya Smart-appen hela tiden, eftersom det är appen Tynee säger till kunder att använda för firmware-uppdateringar och garantisupport.

## Steg ett: läs referensen istället för att gissa

Ingenting om den här brädans protokoll är publicerat någonstans av Tuya eller av Tynee. Startpunkten var `ha-tuya-ble`, en MIT-licensierad Python-implementation Home Assistant beror på för sin egen Tuya BLE-integration, läst direkt istället för antagen. Från den kom det faktiska trådformatet:

- **Ram**: `seq_num(4) | response_to(4) | code(2) | length(2) | data | crc16(2)`, nollutfylld till en multipel av 16 byte, kontrollsummerad med CRC-16/MODBUS.
- **Kryptering**: AES-128-CBC med en slumpmässig IV, skickad som `security_flag(1) | iv(16) | ciphertext`.
- **Fragmentering**: styckad för att passa 20-byte GATT-skrivningar, varje fragment bär ett varint-paketnummer, fragment noll bär också totallängden.
- **Nyckelhärledning**: två varianter (en "v2" som använder `local_key + sec_key`, en "v3" som bara använder de första sex tecknen av `local_key`), sessionsnyckeln härledd genom att hasha det materialet tillsammans med sex byte av enhetstillhandahållen slumpmässighet.

Inget av det där togs för givet. Innan en rad produktions-Kotlin skrevs kördes en fast nyckel och IV genom den riktiga Python-referensen och den förväntade byte-för-byte-utmatningen committades som en testfixtur, så Kotlin-implementationen hade något konkret att matcha mot istället för "det ser rätt ut."

## Vad referensen inte berättade: delarna bara riktig hårdvara avslöjar

En skriven protokollspecifikation och en bräda som faktiskt svarar på dina skrivningar är två olika problem, och det mesta av den hårt förvärvade detaljen i projektets protokolldokument handlar om det andra:

- **Att prenumerera på notifieringar behöver en explicit CCCD-deskriptorskrivning.** Att aktivera notifieringar på karaktäristiken ensam ger tyst ingenting, inget fel, bara ingen data, någonsin.
- **Brädan återmonterar inte en ram uppdelad över flera GATT-skrivningar under dess förhandlade MTU.** En 36-byte skrivning skickad i ett skott fungerade direkt; samma nyttolast uppdelad i 20 och 17 byte ignorerades tyst. MTU förhandlas upp till 247, men det säkra golvet innan förhandling slutförs är fortfarande standard-20-byte-styckningen, inte ett tal valt för att se effektivt ut.
- **Exakt en GATT-operation i luften åt gången**, seriellt genom en kö där varje operation bara slutförs på sin egen callback. Androids BLE-stack korrumperar tillstånd under samtidiga operationer på en enda anslutning; det här är den faktiska grundorsaken den *gamla* SDK-baserade kommandokön själv jobbade runt, så begränsningen försvann inte med SDK:t, den flyttade bara in i kod som äger den direkt nu.
- **Återanslutnings-backoff taket är 300 sekunder, inte 30.** En tidigare version skannade var 30:e sekund hela natten efter en bräda som helt enkelt var parkerad hemma över natten, och slösade batteri i onödan.
- **En tappad GATT-anslutning måste stängas innan en återanslutning schemaläggs, och en ersatt klient måste stänga sin gamla anslutning synkront först.** Två levande GATT-sessioner som tävlar om samma brädas uppmärksamhet betyder att ingen handskakning någonsin slutförs, för brädan kan inte skilja de två centralerna åt, och det här felläget läses som ett mystiskt `GATT_ERROR 133` istället för en uppenbar orsak.

Brädans firmware svarar på fel opcode genom att tyst släppa ramen, aldrig med ett fel. Det faktumet ensamt är varför projektets levande protokolldokument öppnar med en varning till framtida läsare: om en ändring här ser ut som att den borde vara enklare, en kodväg istället för två, ett fast värde istället för något förhandlat, anta att det redan provades och gick sönder på riktig hårdvara.

## Den enda platsen Tuyas servrar fortfarande är inblandade, kort, en gång

Att få tag i brädans `localKey` (och, beroende på vilken härledning den accepterar, `secKey`) betyder fortfarande att fråga Tuya, för det nyckelmaterialet genereras vid bindningstillfället och skrivs aldrig ut någonstans en användare kunde skriva in det för hand. Så onboarding-flödet loggar in i användarens befintliga Tuya-konto genom Tuyas odokumenterade mobil-API, samma HMAC-signerade, AES-GCM-krypterade API som Home Assistants egen integration beror på, hämtar enhetslistan och dess nycklar en gång, och kallar aldrig Tuya igen. Ingen bindning eller avbindning sker, så brädan lämnar aldrig Tuya Smart-appens kontroll. Från den punkten pratar telefonen direkt med brädan, fungerar i flygplansläge, och har ingen väg tillbaka till Tuyas servrar alls.

<figure>
  <img src="/blog/turbo-tuya-board-settings.jpg" alt="Turbos brädinställningsskärm med snabbkontroller för lås, lampa, och accelerations-/bromskurvor per läge" />
  <figcaption>Varenda en av de här skrivningarna går nu bara telefon-till-bräda, verifierat mot riktig hårdvara efter att SDK:t var borta</figcaption>
</figure>

Social inloggning (Google, Apple, Facebook) visade sig vara en återvändsgränd värd att skriva ner istället för att tyst släppa: Tuyas egen mobilklient routar det genom `thing.m.user.third.login`, en partneridentitetsfederationsendpoint spärrad av ett kommersiellt avtal Tuya har med specifika företag, inte en väg en tredjepartsapp kan använda oavsett hur mycket kod som skrivs mot den. E-post-och-lösenord-inloggning täcker varje konto ändå, inklusive de som ursprungligen skapades via en social knapp, eftersom Tuyas eget supportflöde kräver att lägga till en e-post och lösenord till alla konton som inte började med ett. Det är ett fall där rätt mängd ingenjörsarbete var noll, när väl den faktiska begränsningen förstods.

## Vad det här köpte, konkret

- **Inget Tuya SDK, inget Tuya Maven-beroende, inga Tuya-manifestnycklar**, bekräftat genom att grep:a hela mobilens källkodsträd efter SDK:ns eget klassprefix och hitta ingenting.
- **Flygplansläge fungerar.** Inte som en reservväg, som den normala vägen, eftersom det aldrig fanns ett molnanrop i live-telemetriloopen från början.
- **Tillverkarens egen app fortsätter fungera.** Inget om det här läser eller skriver brädans bindningstillstånd, så en användare kan fortfarande öppna Tuya Smart för firmware-uppdateringar utan att något går sönder på någondera sidan.
- **Ett externt beroende mindre som kan sluta fungera på ett schema utanför någons kontroll.** En SDK-uppdatering, en policyändring för Tuya-konton, en ändring av prenumerationsnivå, ingen av dessa kan längre tyst stoppa brädan från att ansluta, för det finns inget SDK kvar att påverkas av någon av dem.

## Varför det här var värt reverse-engineering-ansträngningen

Den ärliga versionen av den här historien är inte "SDK:t var långsamt" eller "SDK:t var dyrt," det var det inte särskilt. Det är att bero på någon annans molnkonto och någon annans SDK för en funktion så central i appen betyder att appens viktigaste förmåga, att faktiskt prata med din egen bräda, aldrig var helt under sin egen kontroll. Att återimplementera protokollet direkt betyder att varenda trådnivå-fakta om hur den här brädan pratar nu är något projektet faktiskt vet, testat mot en fixtur, verifierat mot riktig hårdvara, och ägt från början till slut, inte licensierat.
