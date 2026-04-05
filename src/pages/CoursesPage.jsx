import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  createUserCourseFromTemplate,
  createUserCourse,
  deleteUserCourse,
  fetchCourseTemplates,
  fetchUserCourses,
  updateUserCourse,
} from "../api/users";
import CourseCard from "../components/CourseCard";
import CourseFormModal from "../components/CourseFormModal";
import Modal from "../components/Modal";

function CoursesPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [templates, setTemplates] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateCourseForm, setTemplateCourseForm] = useState({
    code: "",
    name: "",
    instructor: "",
    term: "",
  });

  const filteredCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [courses, searchTerm]
  );

  useEffect(() => {
    async function loadCourses() {
      if (!user?.userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const response = await fetchUserCourses(user.userId);
        setCourses(response.courses);
      } catch (err) {
        setError(err.message || "Unable to load courses");
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, [user?.userId]);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const response = await fetchCourseTemplates();
        setTemplates(response.templates || []);
      } catch (err) {
        console.error(err);
      }
    }

    loadTemplates();
  }, []);

  const refreshCourses = async () => {
    const response = await fetchUserCourses(user.userId);
    setCourses(response.courses);
  };

  const handleSaveCourse = async (form) => {
    try {
      setIsSaving(true);
      setError("");

      if (selectedCourse) {
        await updateUserCourse(user.userId, selectedCourse.id, form);
        setSuccessMessage(`${form.code.toUpperCase()} was updated.`);
      } else {
        await createUserCourse(user.userId, form);
        setSuccessMessage(`${form.code.toUpperCase()} was added to your courses.`);
      }

      await refreshCourses();
      setSelectedCourse(null);
      setShowCourseModal(false);
    } catch (err) {
      setError(err.message || "Unable to save course");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async (course) => {
    if (!window.confirm(`Delete ${course.code} - ${course.name}?`)) {
      return;
    }

    try {
      setError("");
      await deleteUserCourse(user.userId, course.id);
      await refreshCourses();
      setSuccessMessage(`${course.code} was removed from your courses.`);
    } catch (err) {
      setError(err.message || "Unable to delete course");
    }
  };

  const handleAddFromTemplate = async () => {
    if (!selectedTemplateId) {
      setError("Choose a template first");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      await createUserCourseFromTemplate(user.userId, selectedTemplateId, templateCourseForm);
      await refreshCourses();
      setShowTemplateModal(false);
      setSelectedTemplateId("");
      setTemplateCourseForm({
        code: "",
        name: "",
        instructor: "",
        term: "",
      });

      const template = templates.find((entry) => entry.id === selectedTemplateId);
      setSuccessMessage(
        `${templateCourseForm.code.toUpperCase()} was added from ${template?.name || "the selected template"}.`
      );
    } catch (err) {
      setError(err.message || "Unable to add course from template");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <div className="card">Please log in to manage courses.</div>;
  }

  return (
    <div className="student-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Course Management</p>
          <h1 className="page-title">My Courses</h1>
          <p className="page-subtitle">Search, add, edit, and remove the courses saved on your account.</p>
        </div>
       
        <button
          onClick={() => {
            setError("");
            setShowTemplateModal(true);
          }}
          className="btn-secondary"
          type="button"
        >
          Add From Template
        </button>
      </div>

      {successMessage ? <div className="alert-box success-alert">{successMessage}</div> : null}
      {error ? <div className="alert-box error-alert">{error}</div> : null}

      <div className="card">
        <div className="section-heading">
          <div>
            <h2>Search Courses</h2>
            <p>You are enrolled in {courses.length} courses.</p>
          </div>
        </div>
        <input
          type="text"
          placeholder="Search by code, name, or instructor..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="input-field"
        />
      </div>

      {isLoading ? (
        <div className="card">Loading courses...</div>
      ) : filteredCourses.length === 0 ? (
        <div className="card empty-state">
          <p>No courses found for "{searchTerm}".</p>
          <button onClick={() => setSearchTerm("")} className="btn-secondary">
            Clear Search
          </button>
        </div>
      ) : (
        <div className="course-grid">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => navigate(`/courses/${course.id}`)}
              onEdit={() => {
                setSelectedCourse(course);
                setShowCourseModal(true);
              }}
              onDelete={() => handleDeleteCourse(course)}
            />
          ))}
        </div>
      )}

      <CourseFormModal
        isOpen={showCourseModal}
        onClose={() => {
          setShowCourseModal(false);
          setSelectedCourse(null);
          setError("");
        }}
        onSubmit={handleSaveCourse}
        initialValues={
          selectedCourse || {
            code: "",
            name: "",
            instructor: "",
            term: "",
          }
        }
        title={selectedCourse ? "Edit Course" : "Add Course"}
        submitLabel={selectedCourse ? "Save Changes" : "Create Course"}
        isSubmitting={isSaving}
        error={error}
      />

      <Modal
        isOpen={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false);
          setSelectedTemplateId("");
        }}
        title="Add Course From Template"
        size="lg"
      >
        <div className="template-picker-layout">
          <div>
            <label className="field-label" htmlFor="template-select">
              Choose template
            </label>
            <select
              id="template-select"
              className="input-field"
              value={selectedTemplateId}
              onChange={(event) => setSelectedTemplateId(event.target.value)}
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>

            {selectedTemplateId ? (
              <div className="template-preview-card">
                <h3>{templates.find((template) => template.id === selectedTemplateId)?.name}</h3>
                <p>{templates.find((template) => template.id === selectedTemplateId)?.description}</p>
                <div className="template-category-list">
                  {(templates.find((template) => template.id === selectedTemplateId)?.categories || []).map((category) => (
                    <div key={category.id || category.name} className="template-category-row">
                      <span>{category.name}</span>
                      <strong>{category.weight}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="template-form-grid">
            <label className="field-label" htmlFor="template-course-code">
              Course code
            </label>
            <input
              id="template-course-code"
              className="input-field"
              value={templateCourseForm.code}
              onChange={(event) =>
                setTemplateCourseForm((current) => ({
                  ...current,
                  code: event.target.value.toUpperCase(),
                }))
              }
              placeholder="SOEN287"
            />

            <label className="field-label" htmlFor="template-course-name">
              Course name
            </label>
            <input
              id="template-course-name"
              className="input-field"
              value={templateCourseForm.name}
              onChange={(event) =>
                setTemplateCourseForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Web Programming"
            />

            <label className="field-label" htmlFor="template-course-instructor">
              Instructor
            </label>
            <input
              id="template-course-instructor"
              className="input-field"
              value={templateCourseForm.instructor}
              onChange={(event) =>
                setTemplateCourseForm((current) => ({
                  ...current,
                  instructor: event.target.value,
                }))
              }
              placeholder="Dr. Margaret Kwan"
            />

            <label className="field-label" htmlFor="template-course-term">
              Term
            </label>
            <input
              id="template-course-term"
              className="input-field"
              value={templateCourseForm.term}
              onChange={(event) =>
                setTemplateCourseForm((current) => ({
                  ...current,
                  term: event.target.value,
                }))
              }
              placeholder="Fall 2026"
            />

            <div className="modal-actions">
              <button type="button" className="btn-primary" onClick={handleAddFromTemplate} disabled={isSaving}>
                {isSaving ? "Adding..." : "Create From Template"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowTemplateModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CoursesPage;
