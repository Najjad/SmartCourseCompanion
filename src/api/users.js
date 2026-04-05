const API_BASE = "http://127.0.0.1:5000/api/users";

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (error) {
    throw new Error("Cannot reach the backend. Start it from the backend folder with `node server.js`.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export function fetchUserByEmail(email) {
  if (!email) throw new Error("Email is required");
  return request(`/getByEmail/${encodeURIComponent(email)}`);
}

export function fetchUserDashboard(userId) {
  return request(`/${encodeURIComponent(userId)}/dashboard`);
}

export function fetchUserCourses(userId) {
  return request(`/${encodeURIComponent(userId)}/courses`);
}

export function fetchUserCourse(userId, courseId) {
  return request(`/${encodeURIComponent(userId)}/courses/${encodeURIComponent(courseId)}`);
}

export function createUserCourse(userId, payload) {
  return request(`/${encodeURIComponent(userId)}/courses`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUserCourse(userId, courseId, payload) {
  return request(`/${encodeURIComponent(userId)}/courses/${encodeURIComponent(courseId)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteUserCourse(userId, courseId) {
  return request(`/${encodeURIComponent(userId)}/courses/${encodeURIComponent(courseId)}`, {
    method: "DELETE",
  });
}

export function fetchCourseTemplates() {
  return request("/templates");
}

export function createCourseTemplate(payload) {
  return request("/templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createUserCourseFromTemplate(userId, templateId, payload) {
  return request(
    `/${encodeURIComponent(userId)}/courses/from-template/${encodeURIComponent(templateId)}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export function updateUserByEmail(email, updatedData) {
  return request(`/updateByEmail/${encodeURIComponent(email)}`, {
    method: "PUT",
    body: JSON.stringify(updatedData),
  });
}

export function fetchUserById(userId) {
  return request(`/${encodeURIComponent(userId)}`);
}

export function updateUserPassword(userId, currentPassword, newPassword) {
  return request(`/${encodeURIComponent(userId)}/password`, {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function deleteUserAccount(userId) {
  return request(`/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
}
