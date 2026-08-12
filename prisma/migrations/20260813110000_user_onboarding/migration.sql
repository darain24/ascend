ALTER TABLE "User"
ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3);

-- Onboarding is only for accounts created after this feature ships.
UPDATE "User"
SET "onboardingCompletedAt" = CURRENT_TIMESTAMP
WHERE "onboardingCompletedAt" IS NULL;
