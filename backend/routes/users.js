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
      secure: false, // true if using HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    });

    res.status(201).json({
      message: "User created",
      userId: result.insertedId,
      email,
      role: newUser.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
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
    console.error(err);
    res.status(500).json({ error: "Server error" });
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
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


router.put("/updateByEmail/:email", async (req, res) => {

  try {

    const db = req.app.locals.db;

    const originalEmail =
      req.params.email;

    if (!originalEmail) {
      return res.status(400).json({
        error: "Email is required"
      });
    }

    const updatedData =
      req.body;

    delete updatedData.password;

    const result =
      await db.collection("users")
        .updateOne(
          { email: originalEmail },
          { $set: updatedData }
        );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    // If email changed, use new email
    const newEmail =
      updatedData.email || originalEmail;

    const updatedUser =
      await db.collection("users")
        .findOne({ email: newEmail });

    if (!updatedUser) {
      return res.status(404).json({
        error: "Updated user not found"
      });
    }

    const { password, ...safeUser } =
      updatedUser;

    res.json(safeUser);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error"
    });

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
    const { code, name, instructor, term } = validation.value;

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
      description: `${name} is now part of your student dashboard. Use this page to track progress, view assessment deadlines, and monitor your current standing.`,
      room: "TBA",
      schedule: "TBA",
      credit: 3,
      assessments: createStarterAssessments(code, name),
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

// Update password by user ID
router.put("/:id/password", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required" });
    }

    // Find the user by _id
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

// Delete user account by user ID
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

module.exports = router;
