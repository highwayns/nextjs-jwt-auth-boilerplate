-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'ZH', 'JA');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'EN';
