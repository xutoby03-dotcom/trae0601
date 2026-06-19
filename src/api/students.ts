import { http } from "./client";
import type {
  Student,
  CreateStudentDto,
  UpdateStudentDto,
} from "@/types";

export const studentsApi = {
  getAll: (params?: { className?: string; search?: string }) =>
    http.get<Student[]>("/students", params),

  getOne: (id: string) => http.get<Student>(`/students/${id}`),

  create: (data: CreateStudentDto) => http.post<Student>("/students", data),

  update: (id: string, data: UpdateStudentDto) =>
    http.put<Student>(`/students/${id}`, data),

  delete: (id: string) => http.delete<{ id: string }>(`/students/${id}`),
};
