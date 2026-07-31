ALTER TABLE "Session"
ADD COLUMN "id" TEXT NOT NULL DEFAULT (concat('c', replace(gen_random_uuid()::text, '-', '')));

ALTER TABLE "Session"
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");

ALTER TABLE "UserStats"
ALTER COLUMN "str" SET DEFAULT 0,
ALTER COLUMN "vit" SET DEFAULT 0,
ALTER COLUMN "int" SET DEFAULT 0,
ALTER COLUMN "agi" SET DEFAULT 0,
ALTER COLUMN "per" SET DEFAULT 0,
ALTER COLUMN "disciplineMeter" SET DEFAULT 0;

ALTER TABLE "User"
ADD COLUMN "githubUsername" TEXT;

CREATE UNIQUE INDEX "User_githubUsername_key" ON "User"("githubUsername");

ALTER TABLE "RaidContribution"
ADD COLUMN "questLogId" TEXT;

CREATE UNIQUE INDEX "RaidContribution_raidBossId_questLogId_key"
ON "RaidContribution"("raidBossId", "questLogId");

ALTER TABLE "RaidContribution"
ADD CONSTRAINT "RaidContribution_questLogId_fkey"
FOREIGN KEY ("questLogId") REFERENCES "QuestLog"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
