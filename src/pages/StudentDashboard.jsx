import { useState } from 'react'
import { mockStudentCourses, mockAssessments, mockStudentUser } from '../utils/mockData'
import StatCard from '../components/StatCard'
import AssessmentCard from '../components/AssessmentCard'
import GPACard from '../components/GPACard'
import { useNavigate } from 'react-router-dom'

function StudentDashboard() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  const urgentAssessments = mockAssessments.filter(a => a.daysLeft <= 7 && a.status === 'pending')
  const completedAssessments = mockAssessments.filter(a => a.status === 'completed')
  const overallAverage = (mockStudentCourses.reduce((sum, c) => sum + c.average, 0) / mockStudentCourses.length).toFixed(1)

  const filteredAssessments = filter === 'urgent' 
    ? urgentAssessments 
    : filter === 'completed' 
    ? completedAssessments 
    : mockAssessments

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {mockStudentUser.firstName}! 👋</h1>
        <p className="text-gray-600">Here's your academic overview for this semester</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="📚" label="Active Courses" value={mockStudentUser.enrolledCourses} color="blue" />
        <StatCard icon="✓" label="Completed Work" value={mockStudentUser.completedAssignments} color="green" />
        <StatCard icon="⏳" label="Pending Items" value={mockStudentUser.pendingAssignments} color="orange" />
        <StatCard icon="📊" label="Overall Average" value={`${overallAverage}%`} color="purple" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Upcoming Assessments */}
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Assessments</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('urgent')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === 'urgent'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Urgent ({urgentAssessments.length})
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === 'completed'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Completed ({completedAssessments.length})
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredAssessments.length > 0 ? (
                filteredAssessments.map((assessment) => (
                  <AssessmentCard
                    key={assessment.id}
                    assessment={assessment}
                    onClick={() => navigate(`/student/assessments?id=${assessment.id}`)}
                  />
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No assessments to display</p>
              )}
            </div>
          </div>
        </div>

        {/* Middle Column - GPA Calculator */}
        <div>
          <GPACard courses={mockStudentCourses} />
        </div>

        {/* Right Column - Course Summary */}
        <div>
          <div className="card sticky top-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Summary</h2>
            <div className="space-y-4">
              {mockStudentCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/student/courses/${course.id}`)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:shadow-md transition cursor-pointer"
                >
                  <p className="font-semibold text-gray-900 mb-1">{course.code}</p>
                  <p className="text-xs text-gray-600 mb-3">{course.name}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold" style={{
                      color: course.average >= 80 ? '#16a34a' : course.average >= 70 ? '#f59e0b' : '#dc2626'
                    }}>
                      {course.average}%
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${course.average}%`,
                          backgroundColor: course.average >= 80 ? '#16a34a' : course.average >= 70 ? '#f59e0b' : '#dc2626'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
