function CourseCard({ course, onClick, type = 'compact' }) {
  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600'
    if (grade >= 80) return 'text-blue-600'
    if (grade >= 70) return 'text-amber-600'
    return 'text-red-600'
  }

  const getProgressColor = (grade) => {
    if (grade >= 90) return 'bg-green-600'
    if (grade >= 80) return 'bg-blue-600'
    if (grade >= 70) return 'bg-amber-600'
    return 'bg-red-600'
  }

  return (
    <div
      onClick={onClick}
      className="card hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{course.code}</h3>
        <p className="text-sm text-gray-600">{course.name}</p>
      </div>

      {/* Instructor & Term */}
      <div className="text-xs text-gray-500 mb-3 space-y-1">
        <p>👨‍🏫 {course.instructor}</p>
        <p>📅 {course.term}</p>
      </div>

      {/* Grade Display */}
      {type === 'compact' && (
        <>
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Course Average</span>
              <span className={`text-lg font-bold ${getGradeColor(course.average)}`}>
                {course.average}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${getProgressColor(course.average)} h-2 rounded-full transition-all`}
                style={{ width: `${course.average}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between text-xs text-gray-600 mb-4">
            <span>{course.assessments} assessments</span>
            <span>{course.credit} credits</span>
          </div>
        </>
      )}

      <button className="btn-primary w-full">View Course</button>
    </div>
  )
}

export default CourseCard
