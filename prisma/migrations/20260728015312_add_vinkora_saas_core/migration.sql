-- Phase 2A: Vinkora SaaS core.
-- This migration is prepared for inspection only and must not be applied
-- before the application deployment sequence has been approved.

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "PlanType" AS ENUM ('PASS', 'SUBSCRIPTION');
CREATE TYPE "SubscriptionStatus" AS ENUM (
    'PENDING',
    'ACTIVE',
    'GRACE_PERIOD',
    'EXPIRED',
    'SUSPENDED',
    'CANCELLED'
);
CREATE TYPE "ActivationMode" AS ENUM ('MANUAL', 'AUTOMATIC');
CREATE TYPE "Currency" AS ENUM ('USD', 'CDF');
CREATE TYPE "PaymentOperator" AS ENUM (
    'M_PESA',
    'AIRTEL_MONEY',
    'ORANGE_MONEY',
    'CASH',
    'BANK',
    'OTHER'
);
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'REFUNDED');
CREATE TYPE "ResourceStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');
CREATE TYPE "LinkOwnership" AS ENUM ('USER_OWNED', 'LEGACY_ANONYMOUS');
CREATE TYPE "PostGraceBehavior" AS ENUM (
    'KEEP_REDIRECTING',
    'SHOW_EXPIRED_PAGE',
    'DISABLE_REDIRECT'
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuthIdentity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" VARCHAR(80) NOT NULL,
    "subject" VARCHAR(191) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthIdentity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(120),
    "phoneEncrypted" TEXT,
    "phoneLast4" VARCHAR(4),
    "company" VARCHAR(160),
    "city" VARCHAR(120),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "type" "PlanType" NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "priceUsd" DECIMAL(12,2) NOT NULL,
    "priceCdf" DECIMAL(16,2),
    "linkQuota" INTEGER,
    "qrCodeQuota" INTEGER,
    "analyticsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 0,
    "postGraceBehavior" "PostGraceBehavior" NOT NULL DEFAULT 'SHOW_EXPIRED_PAGE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Plan_durationDays_positive_check" CHECK ("durationDays" > 0),
    CONSTRAINT "Plan_priceUsd_positive_check" CHECK ("priceUsd" > 0),
    CONSTRAINT "Plan_priceCdf_positive_check" CHECK ("priceCdf" IS NULL OR "priceCdf" > 0),
    CONSTRAINT "Plan_linkQuota_positive_check" CHECK ("linkQuota" IS NULL OR "linkQuota" > 0),
    CONSTRAINT "Plan_qrCodeQuota_positive_check" CHECK ("qrCodeQuota" IS NULL OR "qrCodeQuota" > 0),
    CONSTRAINT "Plan_gracePeriodDays_nonnegative_check" CHECK ("gracePeriodDays" >= 0)
);

CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "activationMode" "ActivationMode" NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "graceEndsAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "activatedById" TEXT,
    "renewedFromId" TEXT,
    "planCodeSnapshot" VARCHAR(50) NOT NULL,
    "planNameSnapshot" VARCHAR(120) NOT NULL,
    "durationDaysSnapshot" INTEGER NOT NULL,
    "priceUsdSnapshot" DECIMAL(12,2) NOT NULL,
    "priceCdfSnapshot" DECIMAL(16,2),
    "linkQuotaSnapshot" INTEGER,
    "qrCodeQuotaSnapshot" INTEGER,
    "analyticsEnabledSnapshot" BOOLEAN NOT NULL,
    "gracePeriodDaysSnapshot" INTEGER NOT NULL,
    "postGraceBehaviorSnapshot" "PostGraceBehavior" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Subscription_durationDaysSnapshot_positive_check"
        CHECK ("durationDaysSnapshot" > 0),
    CONSTRAINT "Subscription_priceUsdSnapshot_positive_check"
        CHECK ("priceUsdSnapshot" > 0),
    CONSTRAINT "Subscription_priceCdfSnapshot_positive_check"
        CHECK ("priceCdfSnapshot" IS NULL OR "priceCdfSnapshot" > 0),
    CONSTRAINT "Subscription_linkQuotaSnapshot_positive_check"
        CHECK ("linkQuotaSnapshot" IS NULL OR "linkQuotaSnapshot" > 0),
    CONSTRAINT "Subscription_qrCodeQuotaSnapshot_positive_check"
        CHECK ("qrCodeQuotaSnapshot" IS NULL OR "qrCodeQuotaSnapshot" > 0),
    CONSTRAINT "Subscription_gracePeriodDaysSnapshot_nonnegative_check"
        CHECK ("gracePeriodDaysSnapshot" >= 0),
    CONSTRAINT "Subscription_dates_order_check" CHECK (
        (
            "startsAt" IS NULL
            AND "endsAt" IS NULL
            AND "graceEndsAt" IS NULL
        )
        OR
        (
            "startsAt" IS NOT NULL
            AND "endsAt" IS NOT NULL
            AND "graceEndsAt" IS NOT NULL
            AND "startsAt" <= "endsAt"
            AND "endsAt" <= "graceEndsAt"
        )
    ),
    CONSTRAINT "Subscription_status_dates_check" CHECK (
        (
            "status" = 'PENDING'
            AND "startsAt" IS NULL
            AND "endsAt" IS NULL
            AND "graceEndsAt" IS NULL
        )
        OR
        (
            "status" IN ('ACTIVE', 'GRACE_PERIOD')
            AND "startsAt" IS NOT NULL
            AND "endsAt" IS NOT NULL
            AND "graceEndsAt" IS NOT NULL
        )
        OR
        -- These statuses may legitimately occur before activation, so dates
        -- may remain NULL; if present, dates_order_check still applies.
        "status" IN ('EXPIRED', 'SUSPENDED', 'CANCELLED')
    )
);

CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" DECIMAL(16,2) NOT NULL,
    "currency" "Currency" NOT NULL,
    "operator" "PaymentOperator" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionReference" VARCHAR(191),
    "payerPhoneEncrypted" TEXT,
    "payerPhoneLast4" VARCHAR(4),
    "paidAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Payment_amount_positive_check" CHECK ("amount" > 0),
    CONSTRAINT "Payment_transactionReference_not_blank_check"
        CHECK (
            "transactionReference" IS NULL
            OR length(btrim("transactionReference")) > 0
        )
);

CREATE TABLE "QrCode" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdUnderSubscriptionId" TEXT NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "destinationUrl" TEXT NOT NULL,
    "styleOptions" JSONB NOT NULL,
    "logoUrl" TEXT,
    "status" "ResourceStatus" NOT NULL DEFAULT 'ACTIVE',
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "lastClickedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QrCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Click" (
    "id" TEXT NOT NULL,
    "linkId" TEXT,
    "qrCodeId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitorHash" VARCHAR(64),
    "countryCode" VARCHAR(2),
    "city" VARCHAR(120),
    "deviceType" VARCHAR(50),
    "browser" VARCHAR(80),
    "referrerHost" VARCHAR(255),
    "isBot" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Click_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Click_exactly_one_target_check" CHECK (
        (
            "linkId" IS NOT NULL
            AND "qrCodeId" IS NULL
        )
        OR
        (
            "linkId" IS NULL
            AND "qrCodeId" IS NOT NULL
        )
    )
);

CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" VARCHAR(120) NOT NULL,
    "resourceType" VARCHAR(80) NOT NULL,
    "resourceId" VARCHAR(191) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Expand Link without dropping or recreating the existing table.
ALTER TABLE "Link"
    ADD COLUMN "ownerId" TEXT,
    ADD COLUMN "createdUnderSubscriptionId" TEXT,
    ADD COLUMN "ownership" "LinkOwnership",
    ADD COLUMN "destinationUrl" TEXT,
    ADD COLUMN "title" VARCHAR(180),
    ADD COLUMN "status" "ResourceStatus" NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN "clickCount" INTEGER NOT NULL DEFAULT 0;

-- Backfill every row that may exist at migration time.
UPDATE "Link"
SET
    "destinationUrl" = "originalUrl",
    "clickCount" = "clicks",
    "ownership" = 'LEGACY_ANONYMOUS'
WHERE
    "destinationUrl" IS NULL
    OR "ownership" IS NULL
    OR "clickCount" <> "clicks";

-- Fail explicitly instead of truncating a legacy slug.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "Link" WHERE length("slug") > 64) THEN
        RAISE EXCEPTION 'Link migration aborted: a legacy slug exceeds 64 characters';
    END IF;
END
$$;

ALTER TABLE "Link"
    ALTER COLUMN "destinationUrl" SET NOT NULL,
    ALTER COLUMN "ownership" SET NOT NULL,
    ALTER COLUMN "ownership" SET DEFAULT 'USER_OWNED',
    ALTER COLUMN "slug" SET DATA TYPE VARCHAR(64);

-- Indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

CREATE INDEX "AuthIdentity_userId_idx" ON "AuthIdentity"("userId");
CREATE UNIQUE INDEX "AuthIdentity_provider_subject_key"
    ON "AuthIdentity"("provider", "subject");

CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

CREATE UNIQUE INDEX "Plan_code_key" ON "Plan"("code");
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");
CREATE INDEX "Plan_isActive_displayOrder_idx" ON "Plan"("isActive", "displayOrder");
CREATE INDEX "Plan_type_isActive_idx" ON "Plan"("type", "isActive");

CREATE UNIQUE INDEX "Subscription_renewedFromId_key" ON "Subscription"("renewedFromId");
CREATE INDEX "Subscription_userId_status_endsAt_idx"
    ON "Subscription"("userId", "status", "endsAt");
CREATE INDEX "Subscription_planId_status_idx" ON "Subscription"("planId", "status");
CREATE INDEX "Subscription_status_graceEndsAt_idx"
    ON "Subscription"("status", "graceEndsAt");
CREATE UNIQUE INDEX "Subscription_id_userId_key" ON "Subscription"("id", "userId");
-- This protects database consistency but does not replace the server
-- transaction required for activation and renewal.
CREATE UNIQUE INDEX "Subscription_one_current_per_user"
    ON "Subscription"("userId")
    WHERE "status" IN ('ACTIVE', 'GRACE_PERIOD');

CREATE INDEX "Payment_userId_status_createdAt_idx"
    ON "Payment"("userId", "status", "createdAt");
CREATE INDEX "Payment_subscriptionId_status_idx"
    ON "Payment"("subscriptionId", "status");
CREATE INDEX "Payment_verifiedById_verifiedAt_idx"
    ON "Payment"("verifiedById", "verifiedAt");
CREATE UNIQUE INDEX "Payment_operator_transactionReference_key"
    ON "Payment"("operator", "transactionReference");

CREATE UNIQUE INDEX "QrCode_slug_key" ON "QrCode"("slug");
CREATE INDEX "QrCode_ownerId_status_idx" ON "QrCode"("ownerId", "status");
CREATE INDEX "QrCode_ownerId_createdAt_idx" ON "QrCode"("ownerId", "createdAt");
CREATE INDEX "QrCode_status_lastClickedAt_idx" ON "QrCode"("status", "lastClickedAt");
CREATE INDEX "QrCode_createdUnderSubscriptionId_idx"
    ON "QrCode"("createdUnderSubscriptionId");

CREATE INDEX "Click_linkId_occurredAt_idx" ON "Click"("linkId", "occurredAt");
CREATE INDEX "Click_qrCodeId_occurredAt_idx" ON "Click"("qrCodeId", "occurredAt");
CREATE INDEX "Click_linkId_visitorHash_occurredAt_idx"
    ON "Click"("linkId", "visitorHash", "occurredAt");
CREATE INDEX "Click_qrCodeId_visitorHash_occurredAt_idx"
    ON "Click"("qrCodeId", "visitorHash", "occurredAt");
CREATE INDEX "Click_occurredAt_isBot_idx" ON "Click"("occurredAt", "isBot");

CREATE INDEX "AuditLog_actorUserId_createdAt_idx"
    ON "AuditLog"("actorUserId", "createdAt");
CREATE INDEX "AuditLog_resourceType_resourceId_createdAt_idx"
    ON "AuditLog"("resourceType", "resourceId", "createdAt");
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

CREATE INDEX "Link_ownerId_status_idx" ON "Link"("ownerId", "status");
CREATE INDEX "Link_ownerId_createdAt_idx" ON "Link"("ownerId", "createdAt");
CREATE INDEX "Link_status_lastClickedAt_idx" ON "Link"("status", "lastClickedAt");
CREATE INDEX "Link_createdUnderSubscriptionId_idx"
    ON "Link"("createdUnderSubscriptionId");

-- Foreign keys
ALTER TABLE "AuthIdentity"
    ADD CONSTRAINT "AuthIdentity_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Profile"
    ADD CONSTRAINT "Profile_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Subscription"
    ADD CONSTRAINT "Subscription_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Subscription"
    ADD CONSTRAINT "Subscription_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "Plan"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Subscription"
    ADD CONSTRAINT "Subscription_activatedById_fkey"
    FOREIGN KEY ("activatedById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Subscription"
    ADD CONSTRAINT "Subscription_renewedFromId_fkey"
    FOREIGN KEY ("renewedFromId") REFERENCES "Subscription"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payment"
    ADD CONSTRAINT "Payment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payment"
    ADD CONSTRAINT "Payment_subscriptionId_userId_fkey"
    FOREIGN KEY ("subscriptionId", "userId")
    REFERENCES "Subscription"("id", "userId")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payment"
    ADD CONSTRAINT "Payment_verifiedById_fkey"
    FOREIGN KEY ("verifiedById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Link"
    ADD CONSTRAINT "Link_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Link"
    ADD CONSTRAINT "Link_createdUnderSubscriptionId_ownerId_fkey"
    FOREIGN KEY ("createdUnderSubscriptionId", "ownerId")
    REFERENCES "Subscription"("id", "userId")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "QrCode"
    ADD CONSTRAINT "QrCode_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "QrCode"
    ADD CONSTRAINT "QrCode_createdUnderSubscriptionId_ownerId_fkey"
    FOREIGN KEY ("createdUnderSubscriptionId", "ownerId")
    REFERENCES "Subscription"("id", "userId")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Click"
    ADD CONSTRAINT "Click_linkId_fkey"
    FOREIGN KEY ("linkId") REFERENCES "Link"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Click"
    ADD CONSTRAINT "Click_qrCodeId_fkey"
    FOREIGN KEY ("qrCodeId") REFERENCES "QrCode"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AuditLog"
    ADD CONSTRAINT "AuditLog_actorUserId_fkey"
    FOREIGN KEY ("actorUserId") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Link may contain legacy data, so add the check without scanning first.
ALTER TABLE "Link"
    ADD CONSTRAINT "Link_ownership_consistency_check" CHECK (
        (
            "ownership" = 'LEGACY_ANONYMOUS'
            AND "ownerId" IS NULL
            AND "createdUnderSubscriptionId" IS NULL
        )
        OR
        (
            "ownership" = 'USER_OWNED'
            AND "ownerId" IS NOT NULL
            AND "createdUnderSubscriptionId" IS NOT NULL
        )
    ) NOT VALID;

-- The backfill above must satisfy the constraint before validation.
ALTER TABLE "Link"
    VALIDATE CONSTRAINT "Link_ownership_consistency_check";

-- originalUrl and clicks are intentionally retained during Phase 2A.
-- A later inspected migration will remove them after the redirect code has
-- switched to destinationUrl/clickCount and production verification passes.
