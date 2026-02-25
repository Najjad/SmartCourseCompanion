import { calculateGPA, getGPALetterGrade } from '../utils/mockData'

function GPACard({ courses }) {
  const gpa = calculateGPA(courses)
  const letterGrade = getGPALetterGrade(gpa)

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Current GPA</h3>
      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-blue-600 mb-2">{gpa}</div>
        <div className="text-2xl font-semibold text-gray-700">{letterGrade}</div>
        <p className="text-sm text-gray-600 mt-2">Based on {courses.length} courses</p>
      </div>
      
      <div className="space-y-3 border-t pt-4">
        <p className="text-xs text-gray-600 mb-3">Grade breakdown:</p>
        {courses.map((course) => (
          <div key={course.id} className="flex justify-between items-center text-sm">
            <span className="text-gray-700">{course.code}</span>
            <span className="font-semibold">{course.average}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GPACard
