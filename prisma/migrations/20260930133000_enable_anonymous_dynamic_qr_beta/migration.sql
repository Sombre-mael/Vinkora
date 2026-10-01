-- Anonymous dynamic QR beta. This migration is additive and preserves
-- every existing user-owned QR code.

CREATE TYPE "QrOwnership" AS ENUM ('USER_OWNED', 'ANONYMOUS_BETA');

ALTER TABLE "QrCode"
    ALTER COLUMN "ownerId" DROP NOT NULL,
    ALTER COLUMN "createdUnderSubscriptionId" DROP NOT NULL,
    ADD COLUMN "ownership" "QrOwnership" NOT NULL DEFAULT 'USER_OWNED',
    ADD COLUMN "anonymousDeviceHash" VARCHAR(64),
    ADD COLUMN "editTokenHash" VARCHAR(64),
    ADD COLUMN "creationIpHash" VARCHAR(64);

CREATE UNIQUE INDEX "QrCode_editTokenHash_key"
    ON "QrCode"("editTokenHash");

CREATE INDEX "QrCode_anonymousDeviceHash_status_idx"
    ON "QrCode"("anonymousDeviceHash", "status");

CREATE INDEX "QrCode_creationIpHash_createdAt_idx"
    ON "QrCode"("creationIpHash", "createdAt");

ALTER TABLE "QrCode"
    ADD CONSTRAINT "QrCode_ownership_consistency_check" CHECK (
        (
            "ownership" = 'USER_OWNED'
            AND "ownerId" IS NOT NULL
            AND "createdUnderSubscriptionId" IS NOT NULL
            AND "anonymousDeviceHash" IS NULL
            AND "editTokenHash" IS NULL
        )
        OR
        (
            "ownership" = 'ANONYMOUS_BETA'
            AND "ownerId" IS NULL
            AND "createdUnderSubscriptionId" IS NULL
            AND "anonymousDeviceHash" IS NOT NULL
            AND "editTokenHash" IS NOT NULL
            AND "logoUrl" IS NULL
        )
    ) NOT VALID;

ALTER TABLE "QrCode"
    VALIDATE CONSTRAINT "QrCode_ownership_consistency_check";
