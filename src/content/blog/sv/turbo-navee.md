---
title: 'Att planera ett andra brädmärke: vad som krävs för att göra Turbo faktiskt multi-brand'
description: 'Varför att lägga till stöd för Navee-scootrar i Turbo är en riktig arkitekturändring, inte en drivrutins-plugin, vad en tredje part redan reverse-engineerat för en systermodell, och varför appen medvetet inte har börjat bygga det än.'
pubDate: 'Sep 06 2026'
heroImage: '/blog/turbo-navee-logo.png'
---

Turbo har hittills varit en Tynee-formad app: en bräda, ett protokoll, en implicit användare. Det har varit okej eftersom det började som ett projekt för att förstå min egen åktur på min egen bräda. Men en lagkamrat som gick med för att bygga stöd för sin egen scooter, en Navee V40i Pro, gjorde "lägg till en andra enhet" från en hypotes till en riktig fråga, och det ärliga svaret visade sig vara "inte än, och inte på det sätt man skulle tro."

## Det finns inget Navee-SDK att wrappa

Tuya (plattformen Tynees OEM bygger på) publicerar ett riktigt, dokumenterat Android-SDK som vilken utvecklare som helst kan länka mot med rätt uppgifter, det är vad [Turbos egen board-ble-modul](/blog/turbo-tuya-free) ersatte med en hemmabyggd implementation. Navee, vars brädor faktiskt byggs av en OEM som heter Brightway Innovation Intelligent Technology, har ingen motsvarighet alls. Deras egen app pratar med scootern över ett proprietärt, odokumenterat BLE-protokoll och till sin egen backend över ett vanligt REST-API utan publik dokumentation, inga tredjeparts-API-nycklar, och inget publicerat SDK. Det finns inget leverantörs-SDK att ta bort här, för det fanns aldrig ett att börja med, det här är ett rått reverse-engineering-problem från start istället för ett SDK-wrappingsproblem.

## Försprånget: någon har redan gjort det svåra jobbet, för en annan modell

En liten open source-grupp kallad [`scooterteam`](https://github.com/scooterteam) reverse-engineerar Brightway-byggda scootrar, och deras `navee-st3-pro`-repo (MIT-licensierat) är ett fullständigt arkiv för en systermodell av Navee: en fungerande Kotlin/Jetpack Compose-app som parkopplar, autentiserar, läser telemetri och skickar kommandon utan något Navee-SDK inblandat, plus ett skrivet protokolldokument avkodat från att dekompilera den riktiga Navee-APK:n och från levande Bluetooth-fångster.

Protokollformen den dokumenterar: en `[55 AA] [flagga] [cmd] [len] [data] [checksumma] [FE FD]`-ram, AES-128-ECB-autentisering med en av fem nycklar inbakade i APK:n, och en kommandotabell som täcker lås, farthållare, ljus, hastighetsgränser och telemetriläsningar. Inget av de exakta värdena är bekräftade för V40i Pro, Navee och Xiaomi säljer båda scootrar byggda av samma OEM över många modeller och PID:er som delar en Android-app, så protokollets *form* är väldigt troligt delad medan de specifika GATT-UUID:erna, AES-nycklarna och kommandobytevärdena inte är garanterade att matcha. En första skrivskyddad genomgång mot en riktig V40i Pro har redan bekräftat GATT-tjänsten och karaktäristik-UUID:erna live, som skiljer sig från ST3 Pro-referensen precis som den förutsägelsen förväntade. Allt bortom det (det faktiska ramformatet, AES-nyckeluppsättningen, kommandotabellen) är fortfarande obekräftat, för inget skriver till scootern än.

## Varför firmware-uppdateringar troligen inte kan bryta det här under oss

En sak värd att vara säker på, och värd att förklara varför: scootern har ingen egen WiFi eller mobildata, dess enda konnektivitet är Bluetooth till en telefon. Den officiella Navee-appen pushar firmware-uppdateringar över samma BLE-länk som en app-initierad överföring, scootern pollar aldrig efter en på egen hand. Så länge den officiella Navee-appen aldrig parkopplas med scootern igen när en hemmabyggd integration tar över, finns det ingen kanal kvar för firmwaren, eller AES-nycklarna och kommandouppsättningen den upprätthåller, att ändras under integrationen. Det är ett strukturellt argument, inte en förhoppningsfull gissning, och det är den typen av sak värd att verifiera istället för att anta, men mekanismen i sig är sund.

## Varför det här inte byggs än, med flit

Den lockande genvägen är en `NaveeScooterProfile` fastspikad på vad kodvägen som redan finns för Tynee-brädan. Det skulle fungera i den snäva bemärkelsen att få en andra enhet att ansluta, och det skulle också betyda att göra om jobbet ordentligt så fort två riktiga förutsättningar landar som appen inte har än:

1. **Riktigt per-enhetsstöd.** Idag hårdkodar appen antaganden om en bräda genom hela kodbasen, `boardLink.ts`, brädinställningsskärmen, vägmätaruppskattningslogiken. Att lägga till ett andra märke ovanpå den grunden betyder att varenda ett av de antagandena besöks igen två gånger, en gång nu och en gång ordentligt senare.
2. **Riktiga per-användarkonton**, så enhetsägande och inställningar faktiskt är scopade per person istället för implicit.

Båda är redan spårade som sina egna epos, och multi-brand-stöd är medvetet spärrat bakom att de blir klara först. Den faktiska arkitekturändringen när de landar är en `DeviceProfile`-abstraktion: ett gränssnitt (anslut, läs telemetri, läs och skriv inställningar, beräkna räckvidd och effektivitet) som en `TuyaBoardProfile` (en refaktorering av vad som redan finns, ingen beteendeändring) och en ny `NaveeScooterProfile` båda implementerar. Det är vad som gör "universell ridecomputer" till något faktiskt sant, istället för en Tynee-formad app med en Navee-gren kilad in.

## Där Naveees protokoll genuint kommer förenkla saker, när det väl är byggt

Inte allt om ett andra märke är mer jobb. Naveees egna telemetripushar (`0x70`/`0x76`/`0x90`/`0x92` i `scooterteam`s dokumenterade kommandotabell) exponerar total- och resdistans direkt och kontinuerligt över BLE. Tynees bräda exponerade aldrig tillförlitligt ett live-vägmätartal, vilket är varför Turbos vägmätarlogik bär en resehistorik-ankarfallback för det idag. En Navee-integration behöver troligen inte den fallbacken som sin primära väg alls, bara som en genuin offline-reserv, för scootern själv är villig att bara säga hur långt den gått.

Det som inte kommer föras över direkt är effektivitets- och räckviddsmodellen: Tynees per-läge-effektivitetsprofil är handbyggd runt just den brädans Hobbywing ESC-lägen, och en Navee-motsvarighet behöver sin egen profil byggd från hur V40i Pros egna lägen och hastighetsgränser faktiskt beter sig, inte en kopia av tal justerade för annan hårdvara.

## Planen, ärligt

Det här är ett fall där det intressanta ingenjörsbeslutet var att välja *att inte* börja än. Reverse-engineering-vägen är trovärdig, ett riktigt prejudikat finns, en första hårdvarugenomgång har redan bekräftat en del av den, och risken (att firmware tyst ändrar protokollet) har en strukturell anledning att vara låg. Men att bygga ett andra märke på en grund som fortfarande antar en bräda och en användare skulle betyda två omskrivningar istället för en. Att sekvensera arbetet, grunder först, andra märket sedan, är samma disciplin bakom varenda annat inlägg på den här bloggen: det snabba sättet och det rätta sättet är inte samma sak här, och det är värt att säga det innan koden skrivs, inte efteråt.
