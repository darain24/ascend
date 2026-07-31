"use client";

import { Bot, Check, Plus, Send, Sparkles } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { useEffect } from "react";
import { useHunterStore } from "@/store/use-hunter-store";
import { cosineSimilarity, localEmbedding } from "@/lib/ai/embeddings";
import type { GeneratedQuest } from "@/lib/ai/groq";

type JournalEntry = { id: string; content: string; createdAt: string };

export function SystemView() {
  const addQuest = useHunterStore((state) => state.addQuest);
  const [goal, setGoal] = useState("");
  const [quests, setQuests] = useState<GeneratedQuest[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatorError, setGeneratorError] = useState("");
  const [saved, setSaved] = useState(false);
  const [entry, setEntry] = useState("");
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [journalError, setJournalError] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    void fetch("/api/journal")
      .then(async (response) => {
        const result = (await response.json()) as { entries?: JournalEntry[]; error?: string };
        if (!response.ok) throw new Error(result.error || "Journal could not be loaded.");
        setJournal(result.entries ?? []);
      })
      .catch((error) => setJournalError(error instanceof Error ? error.message : "Journal could not be loaded."));
  }, []);

  async function generate(event: FormEvent) {
    event.preventDefault();
    setGeneratorError("");
    setSaved(false);
    setGenerating(true);
    try {
      const response = await fetch("/api/ai/quests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ goal }),
      });
      const result = (await response.json()) as { quests?: GeneratedQuest[]; error?: string };
      if (!response.ok || !result.quests) throw new Error(result.error || "Generation failed.");
      setQuests(result.quests);
    } catch (error) {
      setGeneratorError(error instanceof Error ? error.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  async function saveQuests() {
    setGeneratorError("");
    try {
      const created = await Promise.all(quests.map(async (quest) => {
        const response = await fetch("/api/quests", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...quest, type: "CUSTOM" }),
        });
        const result = (await response.json()) as { quest?: Parameters<typeof addQuest>[0]; error?: string };
        if (!response.ok || !result.quest) throw new Error(result.error || "A generated quest could not be saved.");
        return result.quest;
      }));
      created.forEach(addQuest);
      setSaved(true);
      setQuests([]);
      setGoal("");
    } catch (error) {
      setGeneratorError(error instanceof Error ? error.message : "Generated quests could not be saved.");
    }
  }

  async function saveJournal(event: FormEvent) {
    event.preventDefault();
    const content = entry.trim();
    if (!content) return;
    setJournalError("");
    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const result = (await response.json()) as { entry?: JournalEntry; error?: string };
      if (!response.ok || !result.entry) throw new Error(result.error || "Journal entry could not be saved.");
      setJournal((current) => [result.entry!, ...current]);
      setEntry("");
    } catch (error) {
      setJournalError(error instanceof Error ? error.message : "Journal entry could not be saved.");
    }
  }

  const relevantEntries = useMemo(() => {
    if (!question.trim()) return journal.slice(-8);
    const queryVector = localEmbedding(question);
    return journal
      .map((item) => ({ item, score: cosineSimilarity(queryVector, localEmbedding(item.content)) }))
      .sort((first, second) => second.score - first.score)
      .slice(0, 5)
      .map(({ item }) => item);
  }, [journal, question]);

  async function ask(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    setAnswer("");
    try {
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, entries: relevantEntries }),
      });
      const result = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok || !result.answer) throw new Error(result.error || "The System could not answer.");
      setAnswer(result.answer);
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : "The System could not answer.");
    } finally {
      setAsking(false);
    }
  }

  return (
    <>
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">System</h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">Plan goals, reflect, and learn from your own history.</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <section className="system-panel p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Sparkles size={16} /></div>
            <div><h2 className="text-sm font-semibold">AI quest generator</h2><p className="mt-0.5 text-[10px] text-[var(--muted)]">Turn one goal into a reviewed quest chain.</p></div>
          </div>
          <form className="mt-5" onSubmit={generate}>
            <textarea value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Describe a goal, such as learning data structures…" className="min-h-24 w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--panel)] p-3 text-sm outline-none focus:border-indigo-400" required />
            {generatorError && <p className="mt-2 text-xs text-rose-600">{generatorError}</p>}
            {saved && <p className="mt-2 text-xs text-emerald-600">Quest chain added to your list.</p>}
            <button disabled={generating} className="mt-3 flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-medium text-white disabled:opacity-60">
              <Sparkles size={13} /> {generating ? "Generating…" : "Generate quest chain"}
            </button>
          </form>
          {quests.length > 0 && (
            <div className="mt-6 space-y-3 border-t border-[var(--line)] pt-5">
              <p className="text-xs font-semibold">Review and edit</p>
              {quests.map((quest, index) => (
                <div key={`${quest.title}-${index}`} className="rounded-2xl border border-[var(--line)] p-4">
                  <input value={quest.title} onChange={(event) => setQuests((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} className="w-full bg-transparent text-xs font-semibold outline-none" />
                  <textarea value={quest.detail} onChange={(event) => setQuests((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, detail: event.target.value } : item))} className="mt-2 min-h-12 w-full resize-none bg-transparent text-[11px] text-[var(--muted)] outline-none" />
                  <p className="text-[10px] font-medium text-indigo-600">{quest.stat} · {quest.difficulty} · {quest.xp} XP</p>
                </div>
              ))}
              <button onClick={saveQuests} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-xs font-medium text-white"><Plus size={13} /> Add all quests</button>
            </div>
          )}
        </section>

        <div className="space-y-5">
          <section className="system-panel p-5 sm:p-6">
            <h2 className="text-sm font-semibold">Daily journal</h2>
            <p className="mt-1 text-[10px] text-[var(--muted)]">Private reflections provide context for System answers.</p>
            <form className="mt-4" onSubmit={saveJournal}>
              <textarea value={entry} onChange={(event) => setEntry(event.target.value)} placeholder="What happened today?" className="min-h-24 w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--panel)] p-3 text-sm outline-none focus:border-indigo-400" />
              <button className="mt-3 flex items-center gap-2 rounded-xl border border-[var(--line)] px-4 py-2.5 text-xs font-medium"><Check size={13} /> Save reflection</button>
            </form>
            {journalError && <p className="mt-3 text-xs text-rose-600">{journalError}</p>}
            <p className="mt-4 text-[10px] text-[var(--muted)]">{journal.length} saved {journal.length === 1 ? "entry" : "entries"}</p>
          </section>
          <section className="system-panel p-5 sm:p-6">
            <div className="flex items-center gap-3"><Bot size={17} className="text-indigo-600" /><h2 className="text-sm font-semibold">Ask the System</h2></div>
            <form className="mt-4 flex gap-2" onSubmit={ask}>
              <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="What should I focus on?" className="h-11 min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-xs outline-none focus:border-indigo-400" />
              <button disabled={asking} aria-label="Ask the System" className="grid size-11 place-items-center rounded-xl bg-slate-900 text-white disabled:opacity-60"><Send size={14} /></button>
            </form>
            {answer && <p className="mt-4 rounded-xl bg-[var(--bg)] p-4 text-xs leading-6">{answer}</p>}
          </section>
        </div>
      </div>
    </>
  );
}
