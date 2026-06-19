import { Router } from "express";
import * as students from "../controllers/students.js";

const router = Router();

router.get("/", students.getStudents);
router.get("/:id", students.getStudent);
router.post("/", students.createStudent);
router.put("/:id", students.updateStudent);
router.delete("/:id", students.deleteStudent);

export default router;
