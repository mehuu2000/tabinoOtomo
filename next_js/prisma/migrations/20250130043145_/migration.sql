-- DropForeignKey
ALTER TABLE "MemoItem" DROP CONSTRAINT "MemoItem_memoId_fkey";

-- AddForeignKey
ALTER TABLE "MemoItem" ADD CONSTRAINT "MemoItem_memoId_fkey" FOREIGN KEY ("memoId") REFERENCES "Memo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
