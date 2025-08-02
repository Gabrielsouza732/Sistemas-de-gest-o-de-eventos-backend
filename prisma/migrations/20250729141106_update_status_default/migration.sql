-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Aguardando',
ALTER COLUMN "endDate" DROP NOT NULL;
