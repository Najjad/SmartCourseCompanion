// Mock data for development
export const mockStudentCourses = [
  {
    id: '1',
    code: 'SOEN287',
    name: 'Web Programming',
    instructor: 'Dr. Margaret Kwan',
    term: 'Winter 2026',
    average: 87,
    credit: 3,
    assessments: 5
  },
  {
    id: '2',
    code: 'COMP248',
    name: 'Object-Oriented Programming II',
    instructor: 'Prof. Neil Baird',
    term: 'Winter 2026',
    average: 92,
    credit: 4,
    assessments: 6
  },
  {
    id: '3',
    code: 'MATH203',
    name: 'Discrete Structures II',
    instructor: 'Dr. Abdullatif Tawil',
    term: 'Winter 2026',
    average: 78,
    credit: 3,
    assessments: 4
  },
  {
    id: '4',
    code: 'ENGR301',
    name: 'Engineering Leadership',
    instructor: 'Prof. Michael Lee',
    term: 'Winter 2026',
    average: 85,
    credit: 2,
    assessments: 3
  }
]

export const mockAssessments = [
  {
    id: '1',
    courseCode: 'SOEN287',
    courseName: 'Web Programming',
    title: 'Lab 1: HTML & CSS',
    dueDate: '2026-02-15',
    daysLeft: 3,
    status: 'pending',
    category: 'Laboratory',
    totalMarks: 50,
    earnedMarks: null,
    weight: 0.15
  },
  {
    id: '2',
    courseCode: 'SOEN287',
    courseName: 'Web Programming',
    title: 'Assignment 1: JavaScript Basics',
    dueDate: '2026-02-20',
    daysLeft: 8,
    status: 'pending',
    category: 'Assignment',
    totalMarks: 100,
    earnedMarks: 87,
    weight: 0.25
  },
  {
    id: '3',
    courseCode: 'COMP248',
    courseName: 'Object-Oriented Programming II',
    title: 'Quiz 1: Inheritance & Polymorphism',
    dueDate: '2026-02-18',
    daysLeft: 6,
    status: 'completed',
    category: 'Quiz',
    totalMarks: 20,
    earnedMarks: 18,
    weight: 0.10
  },
  {
    id: '4',
    courseCode: 'MATH203',
    courseName: 'Discrete Structures II',
    title: 'Problem Set 2: Graphs & Trees',
    dueDate: '2026-02-25',
    daysLeft: 13,
    status: 'pending',
    category: 'Problem Set',
    totalMarks: 40,
    earnedMarks: null,
    weight: 0.20
  },
  {
    id: '5',
    courseCode: 'COMP248',
    courseName: 'Object-Oriented Programming II',
    title: 'Assignment 1: Bank System Design',
    dueDate: '2026-03-05',
    daysLeft: 21,
    status: 'pending',
    category: 'Assignment',
    totalMarks: 100,
    earnedMarks: null,
    weight: 0.35
  },
]

export const mockCourseDetails = {
  '1': {
    id: '1',
    code: 'SOEN287',
    name: 'Web Programming',
    instructor: 'Dr. Margaret Kwan',
    instructorEmail: 'margaret.kwan@concordia.ca',
    term: 'Winter 2026',
    credits: 3,
    description: 'Learn to build modern web applications using HTML, CSS, JavaScript, and frameworks.',
    room: 'EV 2.237',
    schedule: 'MWF 10:45 AM - 12:15 PM',
    average: 87,
    assessmentCategories: [
      { name: 'Labs', weight: 0.15 },
      { name: 'Assignments', weight: 0.25 },
      { name: 'Quizzes', weight: 0.10 },
      { name: 'Midterm Exam', weight: 0.20 },
      { name: 'Final Project', weight: 0.30 }
    ],
    assessments: [
      {
        id: 'a1',
        title: 'Lab 1: HTML & CSS',
        category: 'Labs',
        totalMarks: 50,
        earnedMarks: null,
        dueDate: '2026-02-15',
        status: 'pending'
      },
      {
        id: 'a2',
        title: 'Assignment 1: JavaScript Basics',
        category: 'Assignments',
        totalMarks: 100,
        earnedMarks: 87,
        dueDate: '2026-02-20',
        status: 'completed'
      },
      {
        id: 'a3',
        title: 'Lab 2: React Introduction',
        category: 'Labs',
        totalMarks: 50,
        earnedMarks: 48,
        dueDate: '2026-02-25',
        status: 'completed'
      },
      {
        id: 'a4',
        title: 'Quiz 1: DOM & Events',
        category: 'Quizzes',
        totalMarks: 20,
        earnedMarks: 19,
        dueDate: '2026-03-02',
        status: 'completed'
      }
    ]
  },
  '2': {
    id: '2',
    code: 'COMP248',
    name: 'Object-Oriented Programming II',
    instructor: 'Prof. Neil Baird',
    instructorEmail: 'neil.baird@concordia.ca',
    term: 'Winter 2026',
    credits: 4,
    description: 'Advanced object-oriented concepts including inheritance, polymorphism, and design patterns.',
    room: 'H 301',
    schedule: 'TTh 2:45 PM - 4:15 PM',
    average: 92,
    assessmentCategories: [
      { name: 'Labs', weight: 0.20 },
      { name: 'Assignments', weight: 0.35 },
      { name: 'Quizzes', weight: 0.15 },
      { name: 'Final Exam', weight: 0.30 }
    ],
    assessments: [
      {
        id: 'b1',
        title: 'Lab 1: Inheritance',
        category: 'Labs',
        totalMarks: 50,
        earnedMarks: 49,
        dueDate: '2026-02-14',
        status: 'completed'
      },
      {
        id: 'b2',
        title: 'Quiz 1: Inheritance & Polymorphism',
        category: 'Quizzes',
        totalMarks: 20,
        earnedMarks: 18,
        dueDate: '2026-02-18',
        status: 'completed'
      }
    ]
  }
}

export const mockInstructorCourses = [
  {
    id: '1',
    code: 'SOEN287',
    name: 'Web Programming',
    term: 'Winter 2026',
    students: 35,
    assessments: 8,
    avgGrade: 82.5
  },
  {
    id: '2',
    code: 'SOEN331',
    name: 'Software Architecture',
    term: 'Winter 2026',
    students: 28,
    assessments: 6,
    avgGrade: 85.2
  },
  {
    id: '3',
    code: 'SOEN345',
    name: 'Software Design',
    term: 'Winter 2026',
    students: 32,
    assessments: 7,
    avgGrade: 79.8
  }
]

export const mockStudentUser = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@student.concordia.ca',
  role: 'student',
  gpa: 3.75,
  enrolledCourses: 4,
  completedAssignments: 8,
  pendingAssignments: 5
}

export const mockInstructorUser = {
  id: '2',
  firstName: 'Margaret',
  lastName: 'Kwan',
  email: 'margaret.kwan@concordia.ca',
  role: 'instructor',
  totalStudents: 95,
  totalCourses: 3,
  totalAssignments: 21
}

export const calculateDaysUntilDue = (dueDate) => {
  const today = new Date('2026-02-12')
  const due = new Date(dueDate)
  const diffTime = due - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const getAssessmentStatus = (daysLeft) => {
  if (daysLeft < 0) return 'overdue'
  if (daysLeft === 0) return 'today'
  if (daysLeft <= 3) return 'urgent'
  if (daysLeft <= 7) return 'soon'
  return 'normal'
}

export const getGradeColor = (percentage) => {
  if (percentage >= 90) return '#16a34a' // green
  if (percentage >= 80) return '#2563eb' // blue
  if (percentage >= 70) return '#f59e0b' // amber
  return '#dc2626' // red
}

// GPA Calculation: Convert percentage grades to 4.0 scale
export const percentageToGPA = (percentage) => {
  if (percentage >= 90) return 4.0
  if (percentage >= 85) return 3.9
  if (percentage >= 80) return 3.7
  if (percentage >= 77) return 3.3
  if (percentage >= 73) return 3.0
  if (percentage >= 70) return 2.7
  if (percentage >= 67) return 2.3
  if (percentage >= 63) return 2.0
  if (percentage >= 60) return 1.7
  if (percentage >= 57) return 1.3
  if (percentage >= 53) return 1.0
  return 0.0
}

// Calculate GPA from courses with credit weights
export const calculateGPA = (courses) => {
  if (courses.length === 0) return 0

  let totalCredits = 0
  let totalPoints = 0

  courses.forEach(course => {
    const gpa = percentageToGPA(course.average)
    const credit = course.credit || 3
    totalPoints += gpa * credit
    totalCredits += credit
  })

  return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0
}

// Get GPA letter grade
export const getGPALetterGrade = (gpa) => {
  if (gpa >= 3.9) return 'A+'
  if (gpa >= 3.7) return 'A'
  if (gpa >= 3.3) return 'A-'
  if (gpa >= 3.0) return 'B+'
  if (gpa >= 2.7) return 'B'
  if (gpa >= 2.3) return 'B-'
  if (gpa >= 2.0) return 'C+'
  if (gpa >= 1.7) return 'C'
  if (gpa >= 1.3) return 'C-'
  if (gpa >= 1.0) return 'D'
  return 'F'
}
