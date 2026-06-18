import type { Book, BorrowRecord, Family, RecommendResult } from '../types';

function ageToRange(age: number): string {
  if (age <= 2) return '0-2岁';
  if (age <= 4) return '3-4岁';
  if (age <= 6) return '5-6岁';
  if (age <= 8) return '7-8岁';
  return '9-12岁';
}

function parseAgeRange(range: string): [number, number] {
  const match = range.match(/(\d+)-(\d+)/);
  if (!match) return [0, 12];
  return [parseInt(match[1]), parseInt(match[2])];
}

function ageMatchScore(childAge: number, bookAgeRange: string): number {
  const [min, max] = parseAgeRange(bookAgeRange);
  if (childAge >= min && childAge <= max) return 40;
  const diff = childAge < min ? min - childAge : childAge - max;
  if (diff === 1) return 25;
  if (diff === 2) return 10;
  return 0;
}

export function recommendBooks(
  family: Family,
  books: Book[],
  records: BorrowRecord[],
  limit: number = 8
): RecommendResult[] {
  const borrowedBookIds = records
    .filter((r) => r.familyId === family.id)
    .map((r) => r.bookId);

  const familyThemes = new Map<string, number>();
  records
    .filter((r) => r.familyId === family.id)
    .forEach((r) => {
      const book = books.find((b) => b.id === r.bookId);
      if (book) {
        book.themes.forEach((t) => {
          familyThemes.set(t, (familyThemes.get(t) || 0) + 1);
        });
      }
    });

  const results: RecommendResult[] = [];

  books
    .filter((b) => b.status === 'available')
    .forEach((book) => {
      let score = 0;
      const reasons: string[] = [];

      const ageScore = ageMatchScore(family.childAge, book.ageRange);
      if (ageScore > 0) {
        score += ageScore;
        if (ageScore === 40) {
          reasons.push(`适合${family.childAge}岁孩子`);
        } else {
          reasons.push(`年龄段相近`);
        }
      }

      let themeMatches = 0;
      book.themes.forEach((t) => {
        if (familyThemes.has(t)) {
          score += 15 * (familyThemes.get(t) || 1);
          themeMatches++;
        }
      });
      if (themeMatches > 0) {
        reasons.push(`符合孩子兴趣主题`);
      } else {
        score += 5;
      }

      const borrowCount = borrowedBookIds.filter((id) => id === book.id).length;
      if (borrowCount > 0) {
        score -= borrowCount * 25;
        if (borrowCount === 1) {
          reasons.push(`之前读过一次`);
        } else {
          reasons.push(`已重复读过${borrowCount}次`);
        }
      } else {
        score += 15;
        reasons.push('全新绘本');
      }

      score += Math.random() * 5;

      results.push({ book, score, reasons });
    });

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getPopularBooks(books: Book[], records: BorrowRecord[], limit: number = 5): (Book & { borrowCount: number })[] {
  const countMap = new Map<string, number>();
  records.forEach((r) => {
    countMap.set(r.bookId, (countMap.get(r.bookId) || 0) + 1);
  });

  return books
    .map((book) => ({
      ...book,
      borrowCount: countMap.get(book.id) || 0,
    }))
    .sort((a, b) => b.borrowCount - a.borrowCount)
    .slice(0, limit);
}
