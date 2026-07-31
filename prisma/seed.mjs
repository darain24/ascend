import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const skills = [
  { key: "steady-start", title: "Steady Start", description: "The first quest of each day earns bonus XP.", cost: 0, perkType: "XP_ALL", perkValue: 0.02 },
  { key: "deep-focus", title: "Deep Focus", description: "Intelligence quests earn bonus XP.", cost: 1, perkType: "XP_INT", perkValue: 0.08 },
  { key: "iron-will", title: "Iron Will", description: "Vitality quests earn bonus XP.", cost: 2, perkType: "XP_VIT", perkValue: 0.08 },
  { key: "quick-learner", title: "Quick Learner", description: "All quests earn a small XP bonus.", cost: 2, perkType: "XP_ALL", perkValue: 0.05 },
];

const items = [
  { key: "novice-title", name: "Novice Hunter", description: "The title every new hunter can earn.", type: "TITLE", value: "Novice Hunter" },
  { key: "indigo-frame", name: "Indigo Gate", description: "A calm indigo avatar frame.", type: "AVATAR_FRAME", value: "indigo" },
  { key: "emerald-skin", name: "Emerald Accent", description: "An emerald interface accent.", type: "ACCENT_SKIN", value: "emerald" },
];

for (const skill of skills) {
  await db.skill.upsert({ where: { key: skill.key }, update: skill, create: skill });
}
for (const item of items) {
  await db.item.upsert({ where: { key: item.key }, update: item, create: item });
}

await db.$disconnect();
