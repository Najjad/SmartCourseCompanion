import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockStudentCourses } from '../utils/mockData'
import CourseCard from '../components/CourseCard'
import Modal from '../components/Modal'

function CoursesPage() {
  const navigate = useNavigate()
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    instructor: '',
    term: ''
  })

  const filteredCourses = mockStudentCourses.filter(course =>
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddCourse = () => {
    if (newCourse.code && newCourse.name) {
      // In Phase 2, this will call the backend API
      alert(`✓ Successfully added ${newCourse.code}: ${newCourse.name}`)
      setShowAddModal(false)
      setNewCourse({ code: '', name: '', instructor: '', term: '' })
    } else {
      alert('Please fill in all required fields')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-2">You are enrolled in {mockStudentCourses.length} courses</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          + Add Course
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search courses by code or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field w-full"
        />
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onClick={() => navigate(`/student/courses/${course.id}`)}
          />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No courses found matching "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm('')}
            className="btn-secondary"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Add Course Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add a New Course"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Code *
            </label>
            <input
              type="text"
              placeholder="e.g., SOEN287"
              value={newCourse.code}
              onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Web Programming"
              value={newCourse.name}
              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructor
            </label>
            <input
              type="text"
              placeholder="e.g., Dr. Margaret Kwan"
              value={newCourse.instructor}
              onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Term
            </label>
            <input
              type="text"
              placeholder="e.g., Winter 2026"
              value={newCourse.term}
              onChange={(e) => setNewCourse({ ...newCourse, term: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleAddCourse}
              className="btn-primary flex-1"
            >
              Add Course
            </button>
            <button
              onClick={() => setShowAddModal(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CoursesPage
