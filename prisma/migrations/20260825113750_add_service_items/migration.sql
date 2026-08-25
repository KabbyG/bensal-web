-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "items" TEXT[] DEFAULT ARRAY[]::TEXT[];
