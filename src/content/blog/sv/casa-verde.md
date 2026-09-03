---
title: 'Att driva ett hemmalabb som om det vore någon annans jobb'
description: 'Varför vissa stackar i mitt hemmalabb körs med Ansible och andra med GitOps, vad 80 skrivna ADR:er faktiskt har fångat, och två verkliga incidenter från en självhostad röstassistent.'
pubDate: 'Sep 03 2026'
heroImage: '/blog/casa-verde-map.svg'
---

**casa-verde** är mitt hemmalabb: en enda Proxmox-server som kör runt tio LXC-containrar, mediaautomation, ett foto- och musikbibliotek, lokal DNS, en självhostad röstassistent, en moddad spelserver, plus en Home Assistant Green-enhet kopplad till samma deploy-pipeline. Inget av det där är ovanligt för ett hemmalabb. Det jag faktiskt tycker är värt att skriva om är hur det *drivs*: som kod, med en beslutslogg, på samma sätt som jag skulle vilja att ett produktionssystem på jobbet drivs.

<figure>
  <img src="/blog/casa-verde-map.svg" alt="casa-verde infrastrukturkarta: Proxmox-värd, LXC-containrar, och hur de hänger ihop" />
  <figcaption>Den faktiska kartan över labbet, som ett redigerbart diagram i repot, automatiskt regenererat vid varje ändring</figcaption>
</figure>

## Ett repo, och en riktig deploy-pipeline

Att pusha till `main` är själva deployen. En självhostad GitHub Actions-runner på servern applicerar relevanta Ansible-roller på de containrar som en push faktiskt berör. Den där "faktiskt berör"-delen blev viktig när labbet växte förbi ett par containrar: en full deploy körde tidigare fem playbooks helt sekventiellt, i storleksordningen 5 till 6 minuter, oavsett om ändringen var infrastrukturbred eller en enradig dokumentationsfix. Numera diffas varje push mot föregående commit: playbooks som en push inte rör hoppas över helt (en ren dokumentationscommit deployas på ungefär 7 sekunder), och det som blir kvar körs samtidigt som bakgrundsprocesser inom samma jobb, eftersom det bara finns en runner att faktiskt placera arbete på. En push som rör allt tar nu ungefär lika lång tid som den långsammaste enskilda playbooken istället för summan av alla.

En handfull stackar är medvetet **inte** Ansible. Där en stack gynnas av webhook-snabba omdistribueringar, en docker-compose-tjänst som ändras ofta, hanteras den istället genom **Komodo**, ett GitOps-verktyg: push, webhook triggas, Komodo hämtar och bygger om. Allt annat som den stacken äger (ett bevakningsskript, delade roller) går fortfarande genom Ansible. Poängen är inte "välj ett verktyg", det är att använda vilken deploy-modell som faktiskt passar hur ofta en given del ändras.

## Vanan som betyder mer än något verktygsval: att skriva en ADR

Varje icke-trivialt beslut i det här repot får en kort skriven post, mer än 80 stycken vid det här laget, som förklarar vad som beslutades och varför. Det inkluderar besluten som visade sig vara fel. En migrering av alla röstkommandon till ett annat registreringssystem, gjord på en dag, orsakade en generell latensregression över hela linjen, inte bara för kommandona som migrerades; posten om det misstaget, och den partiella återställningen som fixade det, ligger precis där bredvid ändringen som orsakade det. Det är den faktiska nyttan med vanan: det är inte en changelog över lyckade satsningar, det är en logg av resonemang som är tillräckligt bra för att ett dåligt beslut fångas och förklaras istället för att tyst glömmas bort.

Ett konkret exempel: den självhostade röstassistenten kör Whisper för tal-till-text och en liten lokalt finjusterad modell (inte en generisk chattmodell) för kommando-fallback, enbart på CPU, ingen GPU. Tidigt misslyckades ett omatchat röstkommando direkt med "förlåt, jag förstod inte det": säkert, men inte hjälpsamt. Att dirigera omatchade kommandon till en lokal LLM istället verkade vara en enkel förbättring, förutom att den första versionen av det tog 45 till 57 sekunder att svara, eftersom en stor generell chattmodell ombads läsa en prompt på flera tusen tokens (varje exponerad smarta hem-enhet skrivs in i den) och sedan generera fritt. Fixen var inte mer hårdvara, det var att inse att modellen var fel för jobbet: att byta till en liten modell faktiskt finjusterad för enhetskontroll skar ner det till ungefär 5 till 6 sekunder, och att trimma (och sedan försiktigt utöka igen) hur många enheter som exponeras alls höll promptstorleken från att svälla upp igen.

## En andra, tystare bugg: trådar som slåss om kärnor

Relaterat, och mindre uppenbart: den lokala LLM-motorn detekterar sitt antal trådar från *värdens* CPU-topologi, inte containerns faktiska CPU-gräns. Utan override startade den tolv-plus trådar som konkurrerade om en budget på sex kärnor, varje kärna fastnaglad på 100 % bara av schemaläggningskonkurrens, generingsgenomströmningen kraschade till en bråkdel av vad hårdvaran faktiskt klarade av. Det finns ingen miljövariabel för det här; det enda stället att faktiskt låsa det på är en modellspecifik parameterfil, applicerad automatiskt vid varje deploy så att det inte tyst kan glida tillbaka till fel standardvärde. Det är den typen av bugg som ser ut som "modellen är bara långsam" tills man faktiskt kollar vad CPU:n håller på med.

## Övervakning betyder "gick det faktiskt fel", inte "körs det fortfarande"

Att en process är igång säger nästan ingenting om huruvida den faktiskt gör sitt jobb, det gäller oavsett om processen är en deploy-pipeline eller ett smarta hem-tillägg. casa-verde kör en daglig drift-kontroll som jämför det som faktiskt körs mot det som ligger i git och larmar om de har divergerat, container-/tjänstehälsokontroller var femte minut, SMART-diskhälsokontroller, och en stående vakthund som startar om vilket tillägg som helst som kraschat tyst, tillagd specifikt efter att ett supervisor-tillägg kraschade i timmar med varje enhet det tillhandahöll fortfarande visande gammal cachad status, så inget *såg* fel ut förrän något faktiskt försökte använda det. Larm går ut via en självhostad push-notisserver, indelade i nivåer efter faktisk allvarlighetsgrad istället för en enda brandslangskanal.

## Varför bry sig, för ett hemmalabb

Därför att felmönstren i "det är bara en hobby, det löser sig" är samma felmönster som drabbar riktiga produktionssystem, bara med lägre insatser: drift mellan det som är deployat och det som är dokumenterat, en övervakning som bekräftar fel sak, en fix som appliceras utan att skriva ner varför. Att driva casa-verde på det här sättet är medveten övning i att fånga de sakerna innan de kostar något som faktiskt spelar roll.
