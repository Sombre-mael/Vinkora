-- Allow one account-owned dynamic QR without a paid subscription.
-- Existing anonymous beta QR codes remain untouched and manageable.

ALTER TABLE "QrCode"
    DROP CONSTRAINT "QrCode_ownership_consistency_check";

ALTER TABLE "QrCode"
    ADD CONSTRAINT "QrCode_ownership_consistency_check" CHECK (
        (
            "ownership" = 'USER_OWNED'
            AND "ownerId" IS NOT NULL
            AND "anonymousDeviceHash" IS NULL
            AND "editTokenHash" IS NULL
            AND "creationIpHash" IS NULL
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

CREATE UNIQUE INDEX "QrCode_one_free_dynamic_per_owner"
    ON "QrCode" ("ownerId")
    WHERE "ownership" = 'USER_OWNED'
      AND "createdUnderSubscriptionId" IS NULL;
