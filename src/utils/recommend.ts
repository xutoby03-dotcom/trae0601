import type { Student, ClothingCategory } from "@/types";

export function recommendSize(student: Student, category: ClothingCategory): string {
  const { height, weight } = student;
  const bmi = weight / ((height / 100) ** 2);

  if (category === "上衣") {
    if (height < 150) return bmi < 18 ? "XS" : bmi < 24 ? "S" : "M";
    if (height < 160) return bmi < 18 ? "S" : bmi < 24 ? "M" : "L";
    if (height < 170) return bmi < 18 ? "M" : bmi < 24 ? "L" : "XL";
    if (height < 180) return bmi < 18 ? "L" : bmi < 24 ? "XL" : "XXL";
    return bmi < 24 ? "XXL" : "XXXL";
  }

  if (category === "裙裤") {
    if (height < 150) return bmi < 18 ? "XS" : bmi < 24 ? "S" : "M";
    if (height < 160) return bmi < 18 ? "S" : bmi < 24 ? "M" : "L";
    if (height < 170) return bmi < 18 ? "M" : bmi < 24 ? "L" : "XL";
    if (height < 180) return bmi < 18 ? "L" : bmi < 24 ? "XL" : "XXL";
    return bmi < 24 ? "XXL" : "XXXL";
  }

  if (category === "鞋子") {
    return String(student.shoeSize);
  }

  if (category === "领结") {
    return "均码";
  }

  if (category === "发饰") {
    return "均码";
  }

  return "M";
}
