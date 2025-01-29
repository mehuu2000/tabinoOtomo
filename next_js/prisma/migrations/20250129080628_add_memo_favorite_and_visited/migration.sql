-- AlterTable
ALTER TABLE "Memo" ADD COLUMN     "favorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "visited" BOOLEAN NOT NULL DEFAULT false;
