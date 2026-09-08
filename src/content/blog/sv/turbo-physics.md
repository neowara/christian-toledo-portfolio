---
title: 'Fysiken bakom en räckviddsuppskattning: att anpassa Crr, luftmotstånd och drivlineförlust till dina egna åkturer'
description: 'Hur Turbo-backenden går från en läroboksekvation för kraft, spårad till riktiga tekniska referenser, till en per-förare, per-läge regressionsanpassning, varför nedförsbacke inte ger regen-kredit, och vad som händer med modellen under 20% batteri.'
pubDate: 'Sep 06 2026'
heroImage: '/blog/turbo-physics-activity.jpg'
---

Jag har skrivit tidigare om varför Turbos räckviddsuppskattning behövde riktig fysik istället för ett platt km-per-procent-tal. Det här är delen jag hoppade över där: vad den fysikmodellen faktiskt är, var dess konstanter kom ifrån, och hur den går från en läroboksekvation till ett tal anpassat specifikt till hur *du* åker.

<figure>
  <img src="/blog/turbo-physics-activity.jpg" alt="Turbos aktivitetsskärm med veckovis åkdistans och effektivitetstrender" />
  <figcaption>Aktivitetsvyn den här modellen till slut matar: riktiga trendlinjer, inte ett statiskt specifikationsblad-tal</figcaption>
</figure>

## Ekvationen, och var varenda konstant i den kom ifrån

Backendens kraftmodell är en rad, samma som varenda seriös cykel- eller elcykel-effektkalkylator använder:

```
P = (Crr·m·g·cos(θ) + m·g·sin(θ) + ½·ρ·CdA·v_rel²) · v / η
```

Rullmotstånd, lutning och luftmotstånd, summerade, multiplicerade med hastighet, dividerade med drivlineeffektivitet. Ingen av de fyra konstanterna (`Crr`, `CdA`, `η`, `ρ`) valdes på känsla. Innan en rad `physics.py` skrevs spårades var och en till en primärkälla: Grin Technologies motorsimulator- och batteritekniksidor, Kreuzotters hastighets- och effektkalkylator, och tillverkarnas specifikationssidor för brädor som Tynee Explorer Pro och Meepo Voyager, korskontrollerade mot deras annonserade wattimmar-tal mot cellkemi för att bekräfta att siffrorna var internt konsekventa (ett 14S4P-paket av Samsung 50S-celler vid 3,6V nominellt går verkligen ihop till 1008 Wh, precis vad Tynees produktsida påstår).

Det gav standardvärden: `Crr = 0,0135`, `CdA = 0,6 m²`, `η = 0,875`, rakt i mitten av de dokumenterade intervallen för småhjuliga elfordon. Det är vad en helt ny enhet får innan den har någon åkhistorik alls. De är en startpunkt, inte den intressanta delen.

## Regression, inte en uppslagstabell

Så fort en enhet har minst 15 avslutade resor i ett givet körläge slutar `calibration.py` gissa och anpassar `Crr`, `CdA` och `η` från förarens faktiska data via minsta kvadratmetoden:

```
E_wh = a·(distans·vikt) + b·(Σ v_rel²·distans) + c·(klättring·vikt)
```

där `a = Crr·g/η`, `b = 0,5·ρ·CdA/η`, och `c = g/η`. Lös 3×3-normalekvationerna (handrullad Cramers regel, eftersom projektet medvetet inte har något NumPy-beroende för ett enda anropsställe) och de tre fysiska konstanterna faller ut algebraiskt. Varje resa som matar regressionen behöver en riktigt registrerad vikt, rutt och batteriprocent använd; en resa som saknar någon av dem utesluts helt istället för att fyllas i med en gissning, för i en modell där varenda term är viktskalad skulle en gissad vikt tyst korrumpera alla tre anpassade konstanter samtidigt, inte bara en.

De anpassade talen klipps fortfarande till litteraturens rimliga gränser (`Crr` 0,005–0,05, `CdA` 0,2–1,2, `η` 0,5–0,98), så en brusig anpassning från en kort, konstig sträcka av resor kan inte producera en fysiskt orimlig konstant som gör varje framtida uppskattning sämre än läroboksstandarden den ersatte.

## Regeln som krävde mest eftertanke: ingen regen-kredit för nedförsbacke

`climb_energy_wh()` tar bara emot ett icke-negativt klättrat-meter-tal. En nedförsbacke subtraherar inte energi från modellen, även om gravitationen gör riktigt arbete på vägen ner. Det är medvetet: de här brädorna friåker nedför istället för att regenerera laddning, så att kreditera en nedförsbacke skulle få modellen att påstå räckvidd som batteriet faktiskt inte kan leverera. Det är en liten regel, ett enda `if climb_m <= 0: return 0.0`, men det är skillnaden mellan en modell som är ärlig om hårdvaran och en som är optimistisk om den.

<figure>
  <img src="/blog/turbo-tuya-board-settings.jpg" alt="Turbos brädinställningsskärm med snabbkontroller och accelerations-/bromskurvor per läge" />
  <figcaption>Inställningar per läge lästa direkt från brädan, samma lägen som fysikprofilen anpassas separat för</figcaption>
</figure>

## Motorwatt är marknadsföring, inte en fysikgräns

Ett fynd från källgenomgången ändrade hur modellen hanterar ett specifikationsfält den redan hade: `motorPowerW`. Den självklara instinkten är att använda en brädas annonserade motoreffekt som ett hårt tak för hur mycket mekanisk effekt den anpassade `η` kan antyda. Grin Technologies är raka med varför det är fel: *"det finns INGET SÅDANT som en 'rated watt'"* för en elfordonsmotor, samma fysiska motor säljs under tre olika watt-etiketter beroende på tillverkarens marknadsföring. Så `motorPowerW` kopplas in som en lös förnuftsknuff, inte en klämma, om en anpassad `η` skulle antyda uthållig effekt långt över vad den svagaste motorn bland enheterna i en delad-läge-anpassning rimligen kunde leverera, knuffas anpassningen tillbaka proportionellt, aldrig hårdklämd till ett tal som aldrig var fysiskt meningsfullt från början.

## Vad som händer nära tomt

Både den empiriska baslinjen och fysikkorrigeringen behandlar varje batteriprocentenhet som att leverera samma räckvidd, ett antagande som tyst bryter samman under belastning under ungefär 20% laddningsnivå. Ingen tillverkare publicerar en per-SOC intern resistanskurva för cellerna dessa brädor använder, men den underliggande elektrokemin är väl förstådd: intern resistans är U-formad mot SOC, stigande två till tre gånger när grafitanoden närmar sig full delitiering, som förstärker en öppen-krets-spänning som redan sjunker i samma region. Det är den verkliga mekanismen bakom att en bräda "kämpar" precis innan den dör, inte en mystisk klippa.

Den metodologiskt korrekta fixen är en full elektrisk modell, öppen-krets-spänning minus en strömberoende resistansterm, integrerad till en avstängningsspänning. Det behöver en kalibrerad per-cell-kurva den här appen inte har än, så den interimistiska fixen är en nedgraderingsmultiplikator: 1,0 (ingen straff) vid eller över 20% SOC, fallande snabbare än linjärt under det, ner till ett golv som aldrig påstår mindre än 35% av den naiva linjära uppskattningen ens vid 0%. Det är en interimsmodell, och koden säger det rakt ut, istället för att presentera en platshållare som ett färdigt svar.

## Varför besvära sig med att anpassa istället för att leverera standardvärdena för alltid

Ett läroboksstandardvärde är detsamma för varje förare på varje bräda. Ett anpassat är ett påstående om *din* bräda, *din* vikt, *din* körstil, backat av din egen resehistorik, och det blir ärligare ju mer du åker. Det är hela anledningen till att räckviddsuppskattning i Turbo existerar som en riktig regressionspipeline istället för tre konstanter hämtade från ett specifikationsblad: den intressanta frågan var aldrig "vad gör en genomsnittlig bräda," den var "vad gör min faktiskt."
