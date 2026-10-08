-- Add account-level interface preferences without changing existing profile data.
CREATE TYPE "InterfaceAccent" AS ENUM ('INDIGO', 'TEAL', 'BLUE');
CREATE TYPE "InterfaceDensity" AS ENUM ('COMFORTABLE', 'COMPACT');
CREATE TYPE "InterfaceMotion" AS ENUM ('SYSTEM', 'EXPRESSIVE', 'REDUCED');

ALTER TABLE "Profile"
  ADD COLUMN "interfaceAccent" "InterfaceAccent" NOT NULL DEFAULT 'INDIGO',
  ADD COLUMN "interfaceDensity" "InterfaceDensity" NOT NULL DEFAULT 'COMFORTABLE',
  ADD COLUMN "interfaceMotion" "InterfaceMotion" NOT NULL DEFAULT 'SYSTEM';
