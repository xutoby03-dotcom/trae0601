import type { Classroom, Seat, Student, Reservation } from '../types';

export function generateInitialClassrooms(): Classroom[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'class-001',
      building: '教学楼A',
      roomNumber: '301',
      seatCount: 30,
      openTime: '18:00',
      closeTime: '22:00',
      teacherInCharge: '张老师',
      photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20classroom%20interior%20with%20desks%20and%20chairs%20bright%20lighting&image_size=landscape_16_9',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'class-002',
      building: '教学楼A',
      roomNumber: '302',
      seatCount: 25,
      openTime: '18:00',
      closeTime: '22:00',
      teacherInCharge: '李老师',
      photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=study%20room%20with%20rows%20of%20desks%20whiteboard%20clean%20modern&image_size=landscape_16_9',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'class-003',
      building: '教学楼B',
      roomNumber: '205',
      seatCount: 40,
      openTime: '18:30',
      closeTime: '22:30',
      teacherInCharge: '王老师',
      photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=quiet%20study%20hall%20with%20individual%20seats%20warm%20lighting&image_size=landscape_16_9',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function generateSeatsForClassroom(classroomId: string, seatCount: number): Seat[] {
  const seats: Seat[] = [];
  for (let i = 1; i <= seatCount; i++) {
    seats.push({
      id: `seat-${classroomId}-${i}`,
      classroomId,
      seatNumber: i,
      hasPowerOutlet: i % 3 === 0,
      isActive: true,
    });
  }
  return seats;
}

export function generateInitialSeats(classrooms: Classroom[]): Seat[] {
  const seats: Seat[] = [];
  classrooms.forEach(c => {
    seats.push(...generateSeatsForClassroom(c.id, c.seatCount));
  });
  return seats;
}

export function generateInitialStudents(): Student[] {
  const classList = ['高一(1)班', '高一(2)班', '高一(3)班', '高二(1)班', '高二(2)班', '高三(1)班', '高三(2)班'];
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑一', '冯二', '陈三', '楚四'];
  const students: Student[] = [];
  const now = new Date().toISOString();

  classList.forEach((className, ci) => {
    names.slice(0, 5).forEach((name, ni) => {
      students.push({
        id: `student-${ci}-${ni}`,
        className,
        name,
        noShowCount: Math.floor(Math.random() * 4),
        createdAt: now,
      });
    });
  });

  return students;
}

export function generateInitialReservations(classrooms: Classroom[], students: Student[]): Reservation[] {
  const today = new Date().toISOString().split('T')[0];
  const timeSlots = ['18:00-19:30', '19:40-21:10', '21:20-22:30'];
  const reservations: Reservation[] = [];
  const now = new Date();

  const statuses: Array<'pending' | 'checked_in' | 'no_show'> = ['pending', 'checked_in', 'pending', 'checked_in', 'no_show'];

  for (let i = 0; i < 25; i++) {
    const classroom = classrooms[i % classrooms.length];
    const student = students[i % students.length];
    const seatNumber = (i % classroom.seatCount) + 1;
    const status = statuses[i % statuses.length];
    const createdAt = new Date(now.getTime() - Math.random() * 3600000).toISOString();

    const [startTime] = timeSlots[i % timeSlots.length].split('-');
    const [hours, minutes] = startTime.split(':').map(Number);
    const expiresAt = new Date(today);
    expiresAt.setHours(hours, minutes + 15, 0, 0);

    reservations.push({
      id: `res-${i + 1}`,
      classroomId: classroom.id,
      seatId: `seat-${classroom.id}-${seatNumber}`,
      studentId: student.id,
      className: student.className,
      studentName: student.name,
      reservationDate: today,
      timeSlot: timeSlots[i % timeSlots.length],
      needsPowerOutlet: seatNumber % 3 === 0,
      status,
      createdAt,
      expiresAt: expiresAt.toISOString(),
    });
  }

  return reservations;
}
