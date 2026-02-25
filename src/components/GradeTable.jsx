function GradeTable({ assessments }) {
  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50'
    if (percentage >= 80) return 'text-blue-600 bg-blue-50'
    if (percentage >= 70) return 'text-amber-600 bg-amber-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-300 bg-gray-50">
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Assessment</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Category</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-900">Marks</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-900">Grade</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-900">Due Date</th>
          </tr>
        </thead>
        <tbody>
          {assessments.map((assessment, idx) => {
            const percentage = assessment.earnedMarks !== null
              ? Math.round((assessment.earnedMarks / assessment.totalMarks) * 100)
              : null
            
            return (
              <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="py-3 px-4">
                  <p className="font-semibold text-gray-900">{assessment.title}</p>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{assessment.category}</td>
                <td className="py-3 px-4 text-center">
                  {assessment.earnedMarks !== null ? (
                    <span className="font-semibold">
                      {assessment.earnedMarks}/{assessment.totalMarks}
                    </span>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {percentage !== null ? (
                    <span className={`px-3 py-1 rounded-full font-bold text-sm ${getGradeColor(percentage)}`}>
                      {percentage}%
                    </span>
                  ) : (
                    <span className="text-gray-400">Pending</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center text-sm text-gray-600">
                  {new Date(assessment.dueDate).toLocaleDateString()}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default GradeTable
