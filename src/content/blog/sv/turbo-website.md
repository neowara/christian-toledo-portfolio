---
title: 'Att bygga turboapp.casa-verde.casa: en marknadsföringssajt utan marknadsföringsbudget'
description: 'Varför Turbos landningssida är en handbyggd Astro-sajt istället för en mall, och de små interaktionsdetaljerna, telefonram-gallerier, ett delat lightbox, scroll-snap på touch, som gör en enda-sidas-sajt att kännas genomtänkt istället för hopslängd.'
pubDate: 'Sep 06 2026'
heroImage: '/blog/turbo-website-hero.jpg'
---

Turbo, Android-appen och backenden jag skrivit om tidigare, behövde en plats att skicka folk till som inte tänker läsa källkod. Det är [turboapp.casa-verde.casa](https://turboapp.casa-verde.casa): en enda-sidas Astro-sajt, deployad till Cloudflare Workers, som finns för att göra ett jobb, visa hur appen faktiskt ser ut, tillräckligt bra för att en främling ska kunna avgöra på tio sekunder om den är något för dem.

<figure>
  <img src="/blog/turbo-website-hero.jpg" alt="Turbo-appens dashboard-skärm med live batteri, spänning och körläge" />
  <figcaption>Hero-skärmdumpen: live-telemetri från brädan, samma skärm som appen faktiskt levererar</figcaption>
</figure>

## Ingen mall, med flit

Det hade gått snabbare att slänga in copyn i en landningssidebyggare. Jag gjorde inte det, av samma anledning som [den här portfolion](/blog/this-website) inte heller är en mall: ett generiskt SaaS-landningssidelook hade underskattat en app vars hela poäng är att den inte gör saker på det generiska sättet. Sajten är en liten, beroendesnål Astro-build, en enda `index.astro`-fil, riktig CSS, inget komponentbibliotek, så varje visuellt beslut är ett jag faktiskt tog, inte ett en mall tog åt mig.

Det visuella språket lånar appens egen mörka, ambernyanserade palett och driver den längre: ett anpassat inskannat displaytypsnitt (`Sixtyfour Bled`) för ordmärket, JetBrains Mono för etiketter, och en snurrande hjulglyf som ersätter "O":et i loggan, ett litet skämt om att en skateboardsajt borde ha ett hjul som faktiskt snurrar.

## Skärmdumpar som måste förtjäna en andra titt

En ridecomputer-app lever eller dör på om dess skärmar ser pålitliga ut vid en snabb titt, så galleriet är sajtens faktiska innehåll, inte dekoration runt någon marknadsföringstext. Skärmdumpar sitter i en CSS-telefonram (rundade hörn, en notch, en subtil bezelskugga) istället för som platta rektanglar, för en naken skärmdump läses som en beskärning, en inramad läses som en produkt.

<figure>
  <img src="/blog/turbo-website-verdicts.jpg" alt="Turbo-skärm som visar 'görbart', 'i underkant' eller 'inte tillräckligt' per körläge" />
  <figcaption>En av gallerets nio skärmar: en riktig utfallsbedömning per läge, inte ett enda generiskt räckviddstal</figcaption>
</figure>

Två olika galleribehandlingar finns med flit. Heron har en lös, handspridd remsa av fem telefoner, alternerande lutning, som en besökare ser innan de skrollar. Funktionssektionen under den är en disciplinerad horisontell filmremsa av alla nio skärmar, var och en med en snurrande konisk gradientring vid hover och ett `<button>`-triggat lightbox för helskärmsvyn, delad kod mellan båda remsorna istället för två separata implementationer. Att få det delade lightboxet rätt innebar att designa det kring vilken trigger som helst som öppnade det, inte bara filmremsans, så heroremsans telefoner och filmremsans kort anropar samma `openLightbox()` med samma dataattribut.

## Detaljen som inte syns i en skärmdump: touch-beteende

Båda skrollbara remsorna är fri skroll på desktop och `scroll-snap-type: x mandatory` på touch, styrt av en riktig `(hover: none)`-mediafråga istället för en gissning baserad på skärmbredd, för en bredd-brytpunkt skulle felklassificera en pekskärmslaptop eller en muskörd surfplatta. Touch har ingen `:hover`, så ringen och förstoringsikonen som desktop får från en riktig hover måste komma någon annanstans ifrån: en scroll-lyssnare besläktad med `IntersectionObserver` hittar vilket kort som ligger närmast remsans mitt och ger det en `.in-focus`-klass, som driver exakt samma CSS som `:hover`-regeln gör på desktop. Det är den typen av interaktionsdetalj ingen medvetet lägger märke till när den är rätt och alla lägger märke till när den är fel, ett kort som aldrig verkar vara "valt" medan du svepar igenom det.

<figure>
  <img src="/blog/turbo-website-widget.jpg" alt="Turbos hemskärmswidget som visar senaste åkturens distans och lägesfördelning" />
  <figcaption>Widgetskärmen, en av de svårare bilderna att rama in bra eftersom den inte är en helskärmsvy</figcaption>
</figure>

Det finns en mindre, lätt att missa fix i samma anda i CSS:en: de horisontella remsorna behöver `overflow-x: auto` för det fria skrollbeteendet, men det tvingar webbläsaren att beräkna `overflow-y` som `auto` också, vilket skulle klippa hover-lyfttransformen på kantkorten. Fixen är inte smart, generös padding på varje sida, `--edge: 4rem`, så inget ett kort gör under hover eller fokus någonsin når containerns faktiska kant. Tillräckligt liten att det är frestande att hoppa över, och den typen av sak som gör att en sajt känns oavslutad om man inte gör den.

## Innehåll som inte översäljer

"Varför"-sektionen och about-rutnätet säger rakt ut vad Turbo inte är: inte anknutet till Tynee, NAVEE eller Tuya, inget upplåst eller kringgått på hårdvaran, inga annonser eller analys-SDK:er, anslutningsnycklar som aldrig lämnar telefonen. Det är inte juridisk standardtext för sin egen skull, det är samma instinkt bakom att [helt undvika Tuyas SDK](/blog/turbo-tuya-free) i appen själv: säg exakt vad som är sant och låt det vara säljargumentet, istället för en marknadsföringssajts vanliga vana att antyda mer än produkten faktiskt gör.

<figure>
  <img src="/blog/turbo-website-route-planner.jpg" alt="Turbos ruttplanerare med en karta för att peka ut en destination" />
  <figcaption>Ruttplaneraren, routad server-side och kontrollerad mot live-batteri innan du bestämmer dig för en resa</figcaption>
</figure>

## Varför en landningssida för en hobbyapp överhuvudtaget

Turbo behöver ingen marknadsföringssajt för att fungera, appen fungerar fint utan en. Men ett projekt existerar egentligen bara som en sak, koden, tills någon som inte är jag kan titta på det i tio sekunder och förstå vad det är till för. Det är det faktiska jobbet den här sajten gör, och det är samma disciplin som resten av den här portfolion: om ett system är värt att bygga bra, är det värt att kunna förklara bra också.
