import { getAssessmentStatus, getGradeColor } from '../utils/mockData'

function AssessmentCard({ assessment, onClick, onMarkComplete }) {
  const statusColors = {
    pending: 'bg-orange-100 text-orange-800 border-orange-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    urgent: 'bg-red-100 text-red-800 border-red-300',
    overdue: 'bg-red-200 text-red-900 border-red-400'
  }

  const statusStyle = statusColors[assessment.status] || statusColors.pending

  const percentage = assessment.earnedMarks !== null
    ? ((assessment.earnedMarks / assessment.totalMarks) * 100).toFixed(0)
    : null

  return (
    <div className="card border-l-4 border-blue-600 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">{assessment.title}</h3>
          <p className="text-sm text-gray-600">{assessment.courseName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle}`}>
          {assessment.status === 'completed' ? '✓ Done' : 'Pending'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <p className="text-gray-600">Due</p>
          <p className="font-semibold text-gray-900">{new Date(assessment.dueDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-gray-600">Days Left</p>
          <p className={`font-semibold ${assessment.daysLeft <= 3 ? 'text-red-600' : 'text-gray-900'}`}>
            {assessment.daysLeft} days
          </p>
        </div>
      </div>

      {assessment.earnedMarks !== null && (
        <div className="mb-4 bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Score</span>
            <span className="text-lg font-bold" style={{ color: getGradeColor(percentage) }}>
              {percentage}%
            </span>
          </div>
          <p className="text-xs text-gray-600">
            {assessment.earnedMarks} / {assessment.totalMarks}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {assessment.status === 'pending' && !assessment.earnedMarks && (
          <button onClick={onMarkComplete} className="btn-primary flex-1">
            Submit
          </button>
        )}
        <button onClick={onClick} className="btn-secondary flex-1">
          Details
        </button>
      </div>
    </div>
  )
}

export default AssessmentCard
