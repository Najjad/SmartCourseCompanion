import { useParams, useNavigate } from 'react-router-dom'
import { mockCourseDetails } from '../utils/mockData'
import GradeTable from '../components/GradeTable'
import ProgressBar from '../components/ProgressBar'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useState } from 'react'
import Modal from '../components/Modal'

function CourseDetailPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [showDelete, setShowDelete] = useState(false)
  
  const course = mockCourseDetails[courseId] || mockCourseDetails['1']

  // Calculate category averages
  const categoryData = course.assessmentCategories.map(cat => {
    const catAssessments = course.assessments.filter(a => a.category === cat.name && a.earnedMarks !== null)
    const avg = catAssessments.length > 0
      ? catAssessments.reduce((sum, a) => sum + ((a.earnedMarks / a.totalMarks) * 100), 0) / catAssessments.length
      : 0
    return {
      name: cat.name.substring(0, 10),
      fullName: cat.name,
      average: parseFloat(avg.toFixed(1)),
      weight: cat.weight * 100
    }
  })

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  // Grade distribution
  const gradeDistribution = [
    { name: 'A (90-100%)', value: course.assessments.filter(a => a.earnedMarks && (a.earnedMarks/a.totalMarks)*100 >= 90).length },
    { name: 'B (80-89%)', value: course.assessments.filter(a => a.earnedMarks && (a.earnedMarks/a.totalMarks)*100 >= 80 && (a.earnedMarks/a.totalMarks)*100 < 90).length },
    { name: 'C (70-79%)', value: course.assessments.filter(a => a.earnedMarks && (a.earnedMarks/a.totalMarks)*100 >= 70 && (a.earnedMarks/a.totalMarks)*100 < 80).length },
    { name: 'D (60-69%)', value: course.assessments.filter(a => a.earnedMarks && (a.earnedMarks/a.totalMarks)*100 >= 60 && (a.earnedMarks/a.totalMarks)*100 < 70).length },
  ].filter(item => item.value > 0)

  const handleDelete = () => {
    alert(`✓ ${course.code} has been removed from your courses`)
    navigate('/student/courses')
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{course.code}</h1>
          <h2 className="text-2xl text-gray-600 mb-4">{course.name}</h2>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <p>👨‍🏫 <span className="font-semibold">{course.instructor}</span></p>
            <p>📍 <span className="font-semibold">{course.room}</span></p>
            <p>📅 <span className="font-semibold">{course.schedule}</span></p>
            <p>🎓 <span className="font-semibold">{course.credits} Credits</span></p>
          </div>
        </div>
        <div className="space-y-2">
          <button className="btn-secondary w-32">Edit Course</button>
          <button onClick={() => setShowDelete(true)} className="btn-danger w-32">
            Remove Course
          </button>
        </div>
      </div>

      {/* Main Grade Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left: Course Average & Description */}
        <div className="lg:col-span-2 card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Course Average</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl font-bold text-blue-600">{course.average}%</div>
              <div className="flex-1">
                <ProgressBar percentage={course.average} size="lg" />
              </div>
            </div>
            <p className="text-sm text-gray-600">Based on {course.assessments.filter(a => a.earnedMarks !== null).length} completed assessments</p>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Course Description</h3>
            <p className="text-gray-600">{course.description}</p>
          </div>
        </div>

        {/* Right: Category Weights */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Weights</h3>
          <div className="space-y-3">
            {course.assessmentCategories.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                  <span className="text-sm font-bold text-gray-900">{(cat.weight * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${cat.weight * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Category Performance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Bar dataKey="average" fill="#3b82f6" name="Average %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grade Distribution */}
        {gradeDistribution.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Grade Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Assessments Table */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Assessments</h2>
        <GradeTable assessments={course.assessments} />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Remove Course"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to remove <strong>{course.code}</strong> from your courses? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={handleDelete} className="btn-danger flex-1">
            Yes, Remove Course
          </button>
          <button onClick={() => setShowDelete(false)} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default CourseDetailPage
