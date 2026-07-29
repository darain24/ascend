const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export type GeneratedQuest = {
  title: string;
  detail: string;
  stat: "STR" | "VIT" | "INT" | "AGI" | "PER";
  difficulty: "EASY" | "NORMAL" | "HARD" | "ELITE";
  xp: number;
};

async function callGroq(messages: Array<{ role: "system" | "user"; content: string }>) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured.");
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.35,
      max_tokens: 900,
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Groq request failed (${response.status}).`);
  const result = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = result.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned an empty response.");
  return JSON.parse(content) as unknown;
}

export async function generateQuestChain(goal: string): Promise<GeneratedQuest[]> {
  const result = (await callGroq([
    {
      role: "system",
      content:
        "You are Ascend's quest designer. Return JSON only as {\"quests\": [...]}. Create 3-7 realistic ordered quests. Each quest needs title, detail, stat (STR|VIT|INT|AGI|PER), difficulty (EASY|NORMAL|HARD|ELITE), and xp (35|60|100|180).",
    },
    { role: "user", content: goal.slice(0, 1200) },
  ])) as { quests?: GeneratedQuest[] };
  if (!Array.isArray(result.quests) || result.quests.length < 3 || result.quests.length > 7) {
    throw new Error("AI response did not contain a valid quest chain.");
  }
  return result.quests;
}

export async function generateNarration(context: string) {
  try {
    const result = (await callGroq([
      {
        role: "system",
        content:
          "Return JSON only as {\"message\":\"...\"}. Write one concise, original System-style progression message. Do not mention copyrighted characters.",
      },
      { role: "user", content: context.slice(0, 600) },
    ])) as { message?: string };
    return result.message?.slice(0, 220) || null;
  } catch {
    return null;
  }
}

export async function generateHunterReport(context: string) {
  const result = (await callGroq([
    {
      role: "system",
      content:
        "Return JSON only as {\"report\":\"...\"}. Write a short performance report with strength, weakest area, and one concrete focus for next week.",
    },
    { role: "user", content: context.slice(0, 5000) },
  ])) as { report?: string };
  if (!result.report) throw new Error("AI report was empty.");
  return result.report.slice(0, 1800);
}

export async function answerSystemQuestion(question: string, journalContext: string) {
  const result = (await callGroq([
    {
      role: "system",
      content:
        "Return JSON only as {\"answer\":\"...\"}. Answer only from the supplied personal history. If the history is insufficient, say so clearly. Give practical, concise guidance.",
    },
    {
      role: "user",
      content: `Question: ${question.slice(0, 800)}\n\nPersonal history:\n${journalContext.slice(0, 5000)}`,
    },
  ])) as { answer?: string };
  if (!result.answer) throw new Error("AI answer was empty.");
  return result.answer.slice(0, 1400);
}
