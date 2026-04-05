const express = require("express");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

const router = express.Router();

function parseUserId(userId) {
  if (!ObjectId.isValid(userId)) {
    return null;
  }

  return new ObjectId(userId);
}

function daysUntil(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(dateString);
  dueDate.setHours(0, 0, 0, 0);

  return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
}

function normalizeAssessmentStatus(assessment) {
  const daysLeft = daysUntil(assessment.dueDate);

  if (assessment.status === "completed") {
    return {
      ...assessment,
      daysLeft,
      status: "completed",
    };
  }

  if (daysLeft < 0) {
    return { ...assessment, daysLeft, status: "overdue" };
  }

  if (daysLeft <= 3) {
    return { ...assessment, daysLeft, status: "urgent" };
  }

  return {
    ...assessment,
    daysLeft,
    status: "pending",
  };
}

function createStarterAssessments(courseCode, courseName) {
  const now = new Date();
  const inDays = (days) => {
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + days);
    return nextDate.toISOString().split("T")[0];
  };

  return [
    {
      id: new ObjectId().toString(),
      title: `${courseCode} Intro Quiz`,
      category: "Quiz",
      weight: 10,
      dueDate: inDays(5),
      totalMarks: 20,
      earnedMarks: 17,
      status: "completed",
    },
    {
      id: new ObjectId().toString(),
      title: `${courseName} Assignment 1`,
      category: "Assignment",
      weight: 20,
      dueDate: inDays(8),
      totalMarks: 100,
      earnedMarks: null,
      status: "pending",
    },
    {
      id: new ObjectId().toString(),
      title: `${courseCode} Project Checkpoint`,
      category: "Project",
      weight: 25,
      dueDate: inDays(14),
      totalMarks: 100,
      earnedMarks: null,
      status: "pending",
    },
  ];
}

function normalizeTemplateCategories(categories) {
  if (!Array.isArray(categories) || categories.length === 0) {
    return { error: "Add at least one assessment category" };
  }

  const normalizedCategories = categories
    .map((category) => ({
      id: category.id || new ObjectId().toString(),
      name: String(category.name || "").trim(),
      weight: Number(category.weight),
    }))
    .filter((category) => category.name);

  if (!normalizedCategories.length) {
    return { error: "Add at least one valid assessment category" };
  }

  const invalidWeight = normalizedCategories.some(
    (category) => !Number.isFinite(category.weight) || category.weight <= 0
  );

  if (invalidWeight) {
    return { error: "Each template category must have a weight greater than 0" };
  }

  const totalWeight = normalizedCategories.reduce((sum, category) => sum + category.weight, 0);

  if (totalWeight !== 100) {
    return { error: "Template category weights must add up to 100%" };
  }

  return { value: normalizedCategories };
}

function parseAndValidateTemplateInput({ name, description, categories }) {
  const normalizedName = String(name || "").trim();
  const normalizedDescription = String(description || "").trim();

  if (!normalizedName) {
    return { error: "Template name is required" };
  }

  const categoryValidation = normalizeTemplateCategories(categories);
  if (categoryValidation.error) {
    return categoryValidation;
  }

  return {
    value: {
      name: normalizedName,
      description: normalizedDescription,
      categories: categoryValidation.value,
    },
  };
}

function buildAssessmentsFromTemplate(template, courseCode, courseName) {
  const now = new Date();

  return (template.categories || []).map((category, index) => {
    const dueDate = new Date(now);
    dueDate.setDate(now.getDate() + (index + 1) * 7);

    return {
      id: new ObjectId().toString(),
      title: `${courseCode} ${category.name}`,
      category: category.name,
      weight: Number(category.weight),
      dueDate: dueDate.toISOString().split("T")[0],
      totalMarks: 100,
      earnedMarks: index === 0 ? 84 : null,
      status: index === 0 ? "completed" : "pending",
      templateSource: template.name,
      notes: `${courseName} follows the ${template.name} structure.`,
    };
  });
}

function parseAndValidateCourseInput({ code, name, instructor, term }) {
  const normalizedCode = (code || "").trim().toUpperCase();
  const normalizedName = (name || "").trim();
  const normalizedInstructor = (instructor || "").trim();
  const normalizedTerm = (term || "").trim();

  if (!normalizedCode || !normalizedName || !normalizedInstructor || !normalizedTerm) {
    return { error: "Course code, name, instructor, and term are required" };
  }

  if (!/^[A-Z]{4}\d{3}$/.test(normalizedCode)) {
    return { error: "Course code must be 4 letters followed by 3 digits" };
  }

  const termMatch = normalizedTerm.match(/^(Winter|Summer|Fall)\s+(\d{4})$/);
  if (!termMatch) {
    return { error: "Term must be Winter, Summer, or Fall followed by a year" };
  }

  const year = Number(termMatch[2]);
  if (year < 2026) {
    return { error: "Year must be 2026 or later" };
  }

  return {
    value: {
      code: normalizedCode,
      name: normalizedName,
      instructor: normalizedInstructor,
      term: `${termMatch[1]} ${year}`,
    },
  };
}

function parseAndValidateCategories(categories) {
  if (!Array.isArray(categories) || categories.length === 0) {
    return { error: "At least one assessment category is required" };
  }

  const normalizedCategories = categories.map((category) => ({
    name: (category.name || "").trim(),
    weight: Number(category.weight),
  }));

  for (const category of normalizedCategories) {
    if (!category.name) {
      return { error: "Each category must have a name" };
    }

    if (!Number.isFinite(category.weight) || category.weight <= 0) {
      return { error: "Each category weight must be a number greater than 0" };
    }
  }

  const totalWeight = normalizedCategories.reduce(
    (sum, category) => sum + category.weight,
    0
  );

  if (totalWeight !== 100) {
    return { error: "Category weights must add up to 100" };
  }

  return { value: normalizedCategories };
}

function summarizeCourse(course) {
  const assessments = (course.assessments || []).map(normalizeAssessmentStatus);
  const gradedAssessments = assessments.filter(
    (assessment) =>
      assessment.earnedMarks !== null &&
      assessment.earnedMarks !== undefined &&
      Number(assessment.totalMarks) > 0
  );

  const average = gradedAssessments.length
    ? gradedAssessments.reduce((sum, assessment) => {
        return sum + (Number(assessment.earnedMarks) / Number(assessment.totalMarks)) * 100;
      }, 0) / gradedAssessments.length
    : 0;

  return {
    ...course,
    assessments,
    assessmentsCount: assessments.length,
    completedAssessments: gradedAssessments.length,
    pendingAssessments: assessments.filter((assessment) => assessment.status !== "completed").length,
    average: Number(average.toFixed(1)),
    progress: assessments.length
      ? Number(((gradedAssessments.length / assessments.length) * 100).toFixed(1))
      : 0,
    nextAssessment:
      assessments
        .filter((assessment) => assessment.status !== "completed")
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0] || null,
  };
}

function buildDashboard(user) {
  const courses = (user.courses || []).map(summarizeCourse);
  const upcomingAssessments = courses
    .flatMap((course) =>
      (course.assessments || [])
        .filter((assessment) => assessment.status !== "completed")
        .map((assessment) => ({
          ...assessment,
          courseId: course.id,
          courseCode: course.code,
          courseName: course.name,
        }))
    )
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const overallAverage = courses.length
    ? courses.reduce((sum, course) => sum + course.average, 0) / courses.length
    : 0;

  return {
    overview: {
      courseCount: courses.length,
      overallAverage: Number(overallAverage.toFixed(1)),
      upcomingCount: upcomingAssessments.length,
      completedCount: courses.reduce((sum, course) => sum + course.completedAssessments, 0),
    },
    courses,
    upcomingAssessments,
  };
}

function buildUsageStats(users, templates) {
  const normalizedUsers = users || [];
  const normalizedTemplates = templates || [];
  const studentUsers = normalizedUsers.filter((user) => user.role !== "admin");
  const adminUsers = normalizedUsers.filter((user) => user.role === "admin");

  const allCourses = studentUsers.flatMap((user) =>
    (user.courses || []).map((course) => ({
      ...summarizeCourse(course),
      ownerId: String(user._id),
      ownerEmail: user.email,
    }))
  );

  const allAssessments = allCourses.flatMap((course) => course.assessments || []);
  const templateCourses = allCourses.filter((course) => course.templateId || course.templateName);
  const completedAssessments = allAssessments.filter((assessment) => assessment.status === "completed");
  const urgentAssessments = allAssessments.filter((assessment) => assessment.status === "urgent");
  const overdueAssessments = allAssessments.filter((assessment) => assessment.status === "overdue");
  const pendingAssessments = allAssessments.filter((assessment) => assessment.status === "pending");

  const averageCourseProgress = allCourses.length
    ? allCourses.reduce((sum, course) => sum + Number(course.progress || 0), 0) / allCourses.length
    : 0;

  const averageCourseAverage = allCourses.length
    ? allCourses.reduce((sum, course) => sum + Number(course.average || 0), 0) / allCourses.length
    : 0;

  const adoptionRate = allCourses.length
    ? (templateCourses.length / allCourses.length) * 100
    : 0;

  const courseRollups = new Map();

  for (const course of allCourses) {
    const existing = courseRollups.get(course.code) || {
      code: course.code,
      name: course.name,
      studentsEnrolled: 0,
      totalAverage: 0,
      totalProgress: 0,
      completedAssessments: 0,
      pendingAssessments: 0,
      templateCount: 0,
      manualCount: 0,
    };

    existing.studentsEnrolled += 1;
    existing.totalAverage += Number(course.average || 0);
    existing.totalProgress += Number(course.progress || 0);
    existing.completedAssessments += Number(course.completedAssessments || 0);
    existing.pendingAssessments += Number(course.pendingAssessments || 0);

    if (course.templateId || course.templateName) {
      existing.templateCount += 1;
    } else {
      existing.manualCount += 1;
    }

    courseRollups.set(course.code, existing);
  }

  const courseBreakdown = Array.from(courseRollups.values())
    .map((course) => ({
      ...course,
      averageGrade: Number((course.totalAverage / course.studentsEnrolled).toFixed(1)),
      averageProgress: Number((course.totalProgress / course.studentsEnrolled).toFixed(1)),
    }))
    .sort((left, right) => right.studentsEnrolled - left.studentsEnrolled || right.averageProgress - left.averageProgress);

  const templateUsageCounts = new Map(
    normalizedTemplates.map((template) => [template.name, {
      id: String(template._id),
      name: template.name,
      description: template.description || "",
      categoryCount: (template.categories || []).length,
      coursesCreated: 0,
    }])
  );

  for (const course of templateCourses) {
    const key = course.templateName || "Unknown Template";
    const existing = templateUsageCounts.get(key) || {
      id: key,
      name: key,
      description: "",
      categoryCount: 0,
      coursesCreated: 0,
    };

    existing.coursesCreated += 1;
    templateUsageCounts.set(key, existing);
  }

  const templateAdoption = Array.from(templateUsageCounts.values())
    .map((template) => ({
      ...template,
      shareOfTemplateCourses: templateCourses.length
        ? Number(((template.coursesCreated / templateCourses.length) * 100).toFixed(1))
        : 0,
    }))
    .sort((left, right) => right.coursesCreated - left.coursesCreated || left.name.localeCompare(right.name));

  const studentEngagement = [
    {
      label: "No Courses Yet",
      value: studentUsers.filter((user) => (user.courses || []).length === 0).length,
      helper: "Students who signed up but have not added a course.",
    },
    {
      label: "1-2 Courses",
      value: studentUsers.filter((user) => {
        const count = (user.courses || []).length;
        return count >= 1 && count <= 2;
      }).length,
      helper: "Students getting started with a lighter workload.",
    },
    {
      label: "3+ Courses",
      value: studentUsers.filter((user) => (user.courses || []).length >= 3).length,
      helper: "Students actively using the planner across multiple classes.",
    },
  ];

  const assessmentStatus = [
    {
      label: "Completed",
      value: completedAssessments.length,
      color: "#16a34a",
    },
    {
      label: "Pending",
      value: pendingAssessments.length,
      color: "#2563eb",
    },
    {
      label: "Urgent",
      value: urgentAssessments.length,
      color: "#d97706",
    },
    {
      label: "Overdue",
      value: overdueAssessments.length,
      color: "#dc2626",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    overview: {
      totalUsers: normalizedUsers.length,
      studentCount: studentUsers.length,
      adminCount: adminUsers.length,
      totalCourses: allCourses.length,
      templateCount: normalizedTemplates.length,
      templateBasedCourses: templateCourses.length,
      adoptionRate: Number(adoptionRate.toFixed(1)),
      averageCourseProgress: Number(averageCourseProgress.toFixed(1)),
      averageCourseAverage: Number(averageCourseAverage.toFixed(1)),
      completedAssessments: completedAssessments.length,
      pendingAssessments: pendingAssessments.length,
      urgentAssessments: urgentAssessments.length,
      overdueAssessments: overdueAssessments.length,
    },
    assessmentStatus,
    courseBreakdown: courseBreakdown.slice(0, 8),
    templateAdoption,
    studentEngagement,
  };
}

async function findUserById(db, userId) {
  const objectId = parseUserId(userId);
  if (!objectId) {
    return null;
  }

  return db.collection("users").findOne({ _id: objectId });
}

router.post("/register", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { role, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      role: role || "student",
      email,
      password: hashedPassword,
      courses: [],
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    res.cookie("userEmail", email, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24
    });

    res.status(201).json({
      message: "User created",
      userId: result.insertedId,
      email,
      role: newUser.role,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      userId: user._id,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/getByEmail/:email", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const email = req.params.email;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password, ...userData } = user;
    res.json(userData);
  } catch (err) {
    console.error("GET EMAIL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/updateByEmail/:email", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const originalEmail = req.params.email;

    if (!originalEmail) {
      return res.status(400).json({ error: "Email is required" });
    }

    const updatedData = req.body;
    delete updatedData.password;

    const result = await db.collection("users").updateOne(
      { email: originalEmail },
      { $set: updatedData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const newEmail = updatedData.email || originalEmail;
    const updatedUser = await db.collection("users").findOne({ email: newEmail });

    if (!updatedUser) {
      return res.status(404).json({ error: "Updated user not found" });
    }

    const { password, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:userId/dashboard", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = await findUserById(db, req.params.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(buildDashboard(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:userId/courses", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = await findUserById(db, req.params.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      courses: (user.courses || []).map(summarizeCourse),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:userId/courses/:courseId", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = await findUserById(db, req.params.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const course = (user.courses || []).find((entry) => entry.id === req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({
      course: summarizeCourse(course),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:userId/courses", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const objectId = parseUserId(req.params.userId);

    if (!objectId) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const validation = parseAndValidateCourseInput(req.body);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const categoriesValidation = parseAndValidateCategories(req.body.categories);
    if (categoriesValidation.error) {
      return res.status(400).json({ error: categoriesValidation.error });
    }

    const { code, name, instructor, term } = validation.value;
    const categories = categoriesValidation.value;

    const existingUser = await db.collection("users").findOne({ _id: objectId });
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const duplicateCourse = (existingUser.courses || []).find(
      (course) => course.code.trim().toUpperCase() === code
    );

    if (duplicateCourse) {
      return res.status(409).json({ error: "You already added that course code" });
    }

    const newCourse = {
      id: new ObjectId().toString(),
      code,
      name,
      instructor,
      term,
      categories,
      description: `${name} is now part of your student dashboard. Use this page to track progress, view assessment deadlines, and monitor your current standing.`,
      room: "TBA",
      schedule: "TBA",
      credit: 3,
      assessments: createStarterAssessments(code, name),
      enabled:true,
    };

    await db.collection("users").updateOne(
      { _id: objectId },
      { $push: { courses: newCourse } }
    );

    res.status(201).json({
      course: summarizeCourse(newCourse),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
router.put("/:userId/courses/:courseId", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const objectId = parseUserId(req.params.userId);

    if (!objectId) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const user = await db.collection("users").findOne({ _id: objectId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const courseIndex = (user.courses || []).findIndex((entry) => entry.id === req.params.courseId);
    if (courseIndex === -1) {
      return res.status(404).json({ error: "Course not found" });
    }

    const existingCourse = user.courses[courseIndex];
    const validation = parseAndValidateCourseInput({
      code: req.body.code ?? existingCourse.code,
      name: req.body.name ?? existingCourse.name,
      instructor: req.body.instructor ?? existingCourse.instructor,
      term: req.body.term ?? existingCourse.term,
    });
   
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }
     const enabled =
  req.body.enabled === undefined
    ? existingCourse.enabled ?? true
    : Boolean(req.body.enabled);
    

    const { code, name, instructor, term } = validation.value;
    const duplicateCourse = (user.courses || []).find(
      (course) =>
        course.id !== req.params.courseId &&
        course.code.trim().toUpperCase() === code
    );

    if (duplicateCourse) {
      return res.status(409).json({ error: "Another course already uses that code" });
    }

    const updatedCourse = {
  ...existingCourse,
  code,
  name,
  instructor,
  term,
  enabled,
};

  
    const nextCourses = [...user.courses];
    nextCourses[courseIndex] = updatedCourse;

    await db.collection("users").updateOne(
      { _id: objectId },
      { $set: { courses: nextCourses } }
    );

    res.json({
      course: summarizeCourse(updatedCourse),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:userId/courses/:courseId", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const objectId = parseUserId(req.params.userId);

    if (!objectId) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    await db.collection("users").updateOne(
      { _id: objectId },
      { $pull: { courses: { id: req.params.courseId } } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id/password", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required" });
    }

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ error: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedPassword } }
    );

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.params.id;

    const result = await db.collection("users").deleteOne({ _id: new ObjectId(userId) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "User not found" });

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:userId/courses/:courseId/assessments", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = await findUserById(db, req.params.userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    const course = user.courses.find((c) => c.id === req.params.courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const { title, category, weight, dueDate, totalMarks } = req.body;

    const newAssessment = {
      id: new ObjectId().toString(),
      title,
      category,
      weight,
      dueDate,
      totalMarks,
      earnedMarks: null,
      status: "pending"
     
    };

    course.assessments.push(newAssessment);

    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { courses: user.courses } }
    );

    res.json(newAssessment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:userId/courses/:courseId/assessments/:assessmentId", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = await findUserById(db, req.params.userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    const course = user.courses.find((c) => c.id === req.params.courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const assessment = course.assessments.find((a) => a.id === req.params.assessmentId);
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });

    const { earnedMarks, status } = req.body;

    if (earnedMarks !== undefined) {
      assessment.earnedMarks = Number(earnedMarks);
    }

    if (status) {
      assessment.status = status;
    }

    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { courses: user.courses } }
    );

    res.json(assessment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/templates", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const templates = await db
      .collection("courseTemplates")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      templates: templates.map((template) => ({
        ...template,
        id: String(template._id),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/admin/usage-stats", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const [users, templates] = await Promise.all([
      db.collection("users").find({}).toArray(),
      db.collection("courseTemplates").find({}).toArray(),
    ]);

    res.json(buildUsageStats(users, templates));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/templates", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const validation = parseAndValidateTemplateInput(req.body);

    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const { name, description, categories } = validation.value;
    const duplicate = await db.collection("courseTemplates").findOne({ name });

    if (duplicate) {
      return res.status(409).json({ error: "A template with that name already exists" });
    }

    const template = {
      name,
      description,
      categories,
      createdAt: new Date(),
    };

    const result = await db.collection("courseTemplates").insertOne(template);

    res.status(201).json({
      template: {
        ...template,
        id: String(result.insertedId),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:userId/courses/from-template/:templateId", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const objectId = parseUserId(req.params.userId);

    if (!objectId) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    if (!ObjectId.isValid(req.params.templateId)) {
      return res.status(400).json({ error: "Invalid template id" });
    }

    const user = await db.collection("users").findOne({ _id: objectId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const template = await db
      .collection("courseTemplates")
      .findOne({ _id: new ObjectId(req.params.templateId) });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    const validation = parseAndValidateCourseInput(req.body);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const { code, name, instructor, term } = validation.value;
    const duplicateCourse = (user.courses || []).find(
      (course) => course.code.trim().toUpperCase() === code
    );

    if (duplicateCourse) {
      return res.status(409).json({ error: "You already added that course code" });
    }

   const newCourse = {
  id: new ObjectId().toString(),
  code,
  name,
  instructor,
  term,
  enabled: true,
  categories: template.categories,
  description:
    template.description ||
    `${name} was added from the ${template.name} template. Use this page to track progress and assessments.`,
  room: "TBA",
  schedule: "TBA",
  credit: 3,
  templateId: String(template._id),
  templateName: template.name,
  assessments: buildAssessmentsFromTemplate(template, code, name),
};


    await db.collection("users").updateOne(
      { _id: objectId },
      { $push: { courses: newCourse } }
    );

    res.status(201).json({
      course: summarizeCourse(newCourse),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
