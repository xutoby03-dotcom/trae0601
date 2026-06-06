export const exportToICS = (scheduledCourses, getCourseById, semesterName) => {
  const timeSlots = {
    1: { start: '080000', end: '084500' },
    2: { start: '085500', end: '094000' },
    3: { start: '100000', end: '104500' },
    4: { start: '105500', end: '114000' },
    5: { start: '140000', end: '144500' },
    6: { start: '145500', end: '154000' },
    7: { start: '160000', end: '164500' },
    8: { start: '165500', end: '174000' },
    9: { start: '190000', end: '194500' },
    10: { start: '195500', end: '204000' },
    11: { start: '205000', end: '213500' },
    12: { start: '214500', end: '223000' }
  }

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const getNextMonday = () => {
    const today = new Date()
    const day = today.getDay()
    const diff = day === 0 ? -6 : 1 - day
    const monday = new Date(today)
    monday.setDate(today.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    return monday
  }

  const baseMonday = getNextMonday()
  const events = []
  const uid = Date.now()

  scheduledCourses.forEach((sc, index) => {
    const course = getCourseById(sc.courseId)
    if (!course) return

    const dayOffset = sc.day - 1
    const eventDate = new Date(baseMonday)
    eventDate.setDate(baseMonday.getDate() + dayOffset)

    const startTime = timeSlots[sc.startPeriod].start
    const endTime = timeSlots[sc.endPeriod].end

    const dtStart = `${eventDate.getFullYear()}${String(eventDate.getMonth() + 1).padStart(2, '0')}${String(eventDate.getDate()).padStart(2, '0')}T${startTime}`
    const dtEnd = `${eventDate.getFullYear()}${String(eventDate.getMonth() + 1).padStart(2, '0')}${String(eventDate.getDate()).padStart(2, '0')}T${endTime}`

    const event = [
      'BEGIN:VEVENT',
      `UID:${uid}-${index}@schedule`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `RRULE:FREQ=WEEKLY;COUNT=16`,
      `SUMMARY:${course.name}`,
      `DESCRIPTION:教师: ${course.teacher}\\n学分: ${course.credits}\\n类别: ${course.category} ${course.type}`,
      `LOCATION:${sc.classroom || '待定'}`,
      'END:VEVENT'
    ]

    events.push(event.join('\r\n'))
  })

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//College Schedule//CN',
    `X-WR-CALNAME:${semesterName || '课程表'}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR'
  ].join('\r\n')

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${semesterName || '课程表'}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
