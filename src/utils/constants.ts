import type { Employee, MeetingRoom } from '../types'

export const employees: Employee[] = [
  { id: 'emp-001', name: '张明', department: '技术部', position: '技术总监', phone: '13800001001' },
  { id: 'emp-002', name: '李娜', department: '市场部', position: '市场经理', phone: '13800001002' },
  { id: 'emp-003', name: '王磊', department: '产品部', position: '产品总监', phone: '13800001003' },
  { id: 'emp-004', name: '赵婷', department: '人事部', position: 'HR经理', phone: '13800001004' },
  { id: 'emp-005', name: '陈浩', department: '技术部', position: '前端工程师', phone: '13800001005' },
  { id: 'emp-006', name: '刘芳', department: '财务部', position: '财务主管', phone: '13800001006' },
  { id: 'emp-007', name: '孙伟', department: '技术部', position: '后端工程师', phone: '13800001007' },
  { id: 'emp-008', name: '周雪', department: '市场部', position: '品牌专员', phone: '13800001008' },
  { id: 'emp-009', name: '吴刚', department: '产品部', position: '产品经理', phone: '13800001009' },
  { id: 'emp-010', name: '郑琳', department: '人事部', position: '招聘专员', phone: '13800001010' },
]

export const meetingRooms: MeetingRoom[] = [
  { id: 'room-001', name: '朝阳厅', floor: '3F', capacity: 8 },
  { id: 'room-002', name: '星空厅', floor: '5F', capacity: 12 },
  { id: 'room-003', name: '碧海厅', floor: '3F', capacity: 6 },
  { id: 'room-004', name: '紫云厅', floor: '7F', capacity: 20 },
  { id: 'room-005', name: '翡翠厅', floor: '5F', capacity: 4 },
  { id: 'room-006', name: '晨曦厅', floor: '7F', capacity: 10 },
]
