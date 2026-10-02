-- Enrich anonymous dynamic QR campaigns and scan analytics without removing
-- or rewriting existing data.

CREATE TYPE "QrCampaignChannel" AS ENUM (
    'UNSPECIFIED',
    'SOCIAL_MEDIA',
    'POSTER',
    'FLYER',
    'MENU',
    'EVENT',
    'PACKAGING',
    'OTHER'
);

ALTER TABLE "QrCode"
    ADD COLUMN "campaignChannel" "QrCampaignChannel" NOT NULL DEFAULT 'UNSPECIFIED';

ALTER TABLE "Click"
    ADD COLUMN "dailyVisitorHash" VARCHAR(64),
    ADD COLUMN "continentCode" VARCHAR(2),
    ADD COLUMN "regionCode" VARCHAR(3),
    ADD COLUMN "timezone" VARCHAR(64),
    ADD COLUMN "language" VARCHAR(35),
    ADD COLUMN "operatingSystem" VARCHAR(50),
    ADD COLUMN "localHour" SMALLINT,
    ADD COLUMN "localWeekday" SMALLINT;

CREATE INDEX "Click_qrCodeId_dailyVisitorHash_occurredAt_idx"
    ON "Click"("qrCodeId", "dailyVisitorHash", "occurredAt");

ALTER TABLE "Click"
    ADD CONSTRAINT "Click_local_hour_check"
    CHECK ("localHour" IS NULL OR ("localHour" >= 0 AND "localHour" <= 23)) NOT VALID,
    ADD CONSTRAINT "Click_local_weekday_check"
    CHECK ("localWeekday" IS NULL OR ("localWeekday" >= 0 AND "localWeekday" <= 6)) NOT VALID;

ALTER TABLE "Click" VALIDATE CONSTRAINT "Click_local_hour_check";
ALTER TABLE "Click" VALIDATE CONSTRAINT "Click_local_weekday_check";
