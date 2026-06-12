import { mockBoxes, mockBooks, mockBorrowRecords } from "./src/data/mockData";

const getBoxTurnoverRate = () => {
  const books = mockBooks;
  const borrowRecords = mockBorrowRecords;
  const boxes = mockBoxes;
  return boxes
    .map((box) => {
      const boxBooks = books.filter((b) => b.boxId === box.id);
      const boxRecords = borrowRecords.filter((r) => boxBooks.some((b) => b.id === r.bookId));
      let totalDays = 0;
      let completedCount = 0;
      boxRecords.forEach((r) => {
        if (r.actualReturnDate) {
          const borrow = new Date(r.borrowDate);
          const ret = new Date(r.actualReturnDate);
          totalDays += Math.ceil((ret.getTime() - borrow.getTime()) / (1000 * 60 * 60 * 24));
          completedCount++;
        }
      });
      return {
        box,
        borrowCount: boxRecords.length,
        avgDays: completedCount > 0 ? Math.round((totalDays / completedCount) * 10) / 10 : 0,
      };
    })
    .sort((a, b) => {
      if (b.borrowCount !== a.borrowCount) {
        return b.borrowCount - a.borrowCount;
      }
      if (a.avgDays === 0 && b.avgDays === 0) return 0;
      if (a.avgDays === 0) return 1;
      if (b.avgDays === 0) return -1;
      return a.avgDays - b.avgDays;
    });
};

const result = getBoxTurnoverRate();
console.log("=== 箱子流转速度排序结果 ===");
result.forEach((item, idx) => {
  console.log(
    `${idx + 1}. ${item.box.name} - 借阅:${item.borrowCount}次, 平均周期:${item.avgDays || "—"}天`
  );
});
console.log("\n最快的箱子:", result.find((b) => b.borrowCount > 0)?.box.name);
