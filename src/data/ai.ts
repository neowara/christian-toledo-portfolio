// How I work with AI, homepage #ai section.
//
// The point of this section is NOT a logo wall. Naming models is what everyone does
// and it proves nothing. What's actually differentiating here is operating evidence:
// a latency problem fixed by scoping a model correctly instead of buying hardware, a
// regression caused and reverted the same day, a cost figure that only happens if you
// route work deliberately, and one failure mode still openly unsolved.
//
// Every figure below is real and was verified before being written down:
//   - Local model list        → `ollama list` on the workstation
//   - Roo Code task numbers   → 182 history_item.json files in the extension's
//                               globalStorage (tokens, cost, delegated subtasks)
//   - Providers               → config files, cached model lists, and real API
//                               responses in task history
//   - Voice assistant figures → casa-verde's own ADR log (0015–0018, 0048–0061)
//
// If a figure here can't be pointed at, it doesn't belong in this section. That's the
// whole reason it carries any weight.

export interface AiPillar {
  title: string;
  body: string;
}

export interface AiFigure {
  /** Short, mono-rendered. Keep it scannable. */
  figure: string;
  caption: string;
}

export interface AiPractice {
  pillars: AiPillar[];
  figures: AiFigure[];
  toolGroups: { label: string; tools: string[] }[];
  closing: string;
}

export const AI_PRACTICE: AiPractice = {
  pillars: [
    {
      title: "Local, on my own hardware",
      body: "Seven models pulled locally through Ollama (general, coding, and embedding), running on my own GPU. Before any of that, I checked whether the home voice assistant actually needed a GPU at all, and it didn't: speech-to-text runs about six times faster than real time on CPU alone. The research came before the purchase.",
    },
    {
      title: "Cloud, chosen per job",
      body: "Claude, OpenAI, Gemini, DeepSeek, z.AI and Groq, picked by task, cost, and latency rather than loyalty. There's one boundary I don't cross for convenience: anything touching my home stays on local models, by design. Open-ended questions go to a cloud pipeline on a separate wake word.",
    },
    {
      title: "Agents as real tooling",
      body: "Seven purpose-built subagents, deliberately split into read-only reviewers, test runners, and stack-specific implementers, plus agent instructions committed per repo. One of them drives a real Android build on an emulator and looks at the screenshots, rather than trusting that a step reported success.",
    },
  ],
  figures: [
    {
      figure: "45–57s → ~5–6s",
      caption:
        "voice assistant latency, fixed by scoping the model and prompt correctly, not by buying hardware",
    },
    {
      figure: "768 candidates",
      caption:
        "a fuzzy-matching regression I caused, diagnosed, and rolled back the same day",
    },
    {
      figure: "402M tokens · $18.90",
      caption:
        "routing bulk agent work to cheap models and reserving the expensive ones for what needs them",
    },
    {
      figure: "182 tasks · 47 delegated",
      caption:
        "real multi-agent orchestration across code, architect, and review modes",
    },
    {
      figure: "7 local models",
      caption:
        "run on my own GPU, after proving CPU-only inference was viable first",
    },
    {
      figure: "1 problem still open",
      caption:
        "a local model that fabricates rather than admits uncertainty: documented, partly mitigated, not solved",
    },
  ],
  toolGroups: [
    { label: "Local", tools: ["Ollama"] },
    {
      label: "Agents",
      tools: ["Claude Code", "Roo Code", "Cline", "Codex", "Gemini CLI"],
    },
    {
      label: "Providers",
      tools: ["Anthropic", "OpenAI", "DeepSeek", "z.AI", "Groq", "OpenRouter"],
    },
  ],
  closing:
    "The last figure is the one I'd want to be asked about. A local model that confidently invents an answer is a much more interesting problem than one that's simply slow, and I'd rather write that down than pretend the setup is finished.",
};

export const AI_PRACTICE_SV: AiPractice = {
  pillars: [
    {
      title: "Lokalt, på min egen hårdvara",
      body: "Sju modeller hämtade lokalt via Ollama (generella, kodinriktade och embedding), som körs på mitt eget grafikkort. Innan något av det kollade jag om röstassistenten i hemmet ens behövde ett grafikkort, och det gjorde den inte: tal-till-text går ungefär sex gånger snabbare än realtid på enbart CPU. Efterforskningen kom före inköpet.",
    },
    {
      title: "Moln, valt per uppgift",
      body: "Claude, OpenAI, Gemini, DeepSeek, z.AI och Groq, valda utifrån uppgift, kostnad och latens snarare än lojalitet. Det finns en gräns jag inte överskrider för bekvämlighets skull: allt som rör mitt hem stannar på lokala modeller, medvetet. Öppna frågor går till en molnpipeline på ett separat väckningsord.",
    },
    {
      title: "Agenter som riktiga verktyg",
      body: "Sju specialbyggda subagenter, medvetet uppdelade i läsande granskare, testkörare och stackspecifika implementerare, plus agentinstruktioner incheckade per repo. En av dem kör en riktig Android-build i en emulator och tittar faktiskt på skärmbilderna, i stället för att lita på att ett steg rapporterade att det gick bra.",
    },
  ],
  figures: [
    {
      figure: "45–57s → ~5–6s",
      caption:
        "latensen i röstassistenten, löst genom att skala modellen och prompten rätt, inte genom att köpa hårdvara",
    },
    {
      figure: "768 kandidater",
      caption:
        "en regression i fuzzy-matchningen som jag orsakade, hittade och rullade tillbaka samma dag",
    },
    {
      figure: "402M tokens · $18,90",
      caption:
        "genom att skicka merparten av agentarbetet till billiga modeller och spara de dyra till det som kräver dem",
    },
    {
      figure: "182 uppgifter · 47 delegerade",
      caption:
        "verklig orkestrering av flera agenter, över kod-, arkitekt- och granskningslägen",
    },
    {
      figure: "7 lokala modeller",
      caption:
        "körs på mitt eget grafikkort, efter att först ha bevisat att CPU-only fungerade",
    },
    {
      figure: "1 kvarstående problem",
      caption:
        "en lokal modell som hittar på i stället för att erkänna osäkerhet: dokumenterat, delvis mildrat, inte löst",
    },
  ],
  toolGroups: [
    { label: "Lokalt", tools: ["Ollama"] },
    {
      label: "Agenter",
      tools: ["Claude Code", "Roo Code", "Cline", "Codex", "Gemini CLI"],
    },
    {
      label: "Leverantörer",
      tools: ["Anthropic", "OpenAI", "DeepSeek", "z.AI", "Groq", "OpenRouter"],
    },
  ],
  closing:
    "Den sista siffran är den jag helst vill få frågor om. En lokal modell som självsäkert hittar på ett svar är ett betydligt mer intressant problem än en som bara är långsam, och jag skriver hellre ner det än låtsas att bygget är färdigt.",
};
