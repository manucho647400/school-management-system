const state = {
  token: localStorage.getItem('schoolToken') || '',
  user: null,
  activeTab: 'dashboard',
};

const els = {
  loginView: document.getElementById('loginView'),
  appView: document.getElementById('appView'),
  loginForm: document.getElementById('loginForm'),
  loginMessage: document.getElementById('loginMessage'),
  welcomeText: document.getElementById('welcomeText'),
  logoutBtn: document.getElementById('logoutBtn'),
  navBtns: [...document.querySelectorAll('.nav-btn')],
  tabPanels: [...document.querySelectorAll('.tab-panel')],
  totalStudents: document.getElementById('totalStudents'),
  totalTeachers: document.getElementById('totalTeachers'),
  totalCourses: document.getElementById('totalCourses'),
  averageScore: document.getElementById('averageScore'),
  collectedFees: document.getElementById('collectedFees'),
  attendanceRate: document.getElementById('attendanceRate'),
  studentsTableBody: document.getElementById('studentsTableBody'),
  teachersTableBody: document.getElementById('teachersTableBody'),
  coursesTableBody: document.getElementById('coursesTableBody'),
  gradesTableBody: document.getElementById('gradesTableBody'),
  attendanceTableBody: document.getElementById('attendanceTableBody'),
  feesTableBody: document.getElementById('feesTableBody'),
  teacherSelect: document.getElementById('teacherSelect'),
  gradeStudentSelect: document.getElementById('gradeStudentSelect'),
  gradeCourseSelect: document.getElementById('gradeCourseSelect'),
  attendanceStudentSelect: document.getElementById('attendanceStudentSelect'),
  attendanceCourseSelect: document.getElementById('attendanceCourseSelect'),
  feeStudentSelect: document.getElementById('feeStudentSelect'),
  studentForm: document.getElementById('studentForm'),
  teacherForm: document.getElementById('teacherForm'),
  courseForm: document.getElementById('courseForm'),
  gradeForm: document.getElementById('gradeForm'),
  attendanceForm: document.getElementById('attendanceForm'),
  feeForm: document.getElementById('feeForm'),
};

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${state.token}`,
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: authHeaders(),
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

function setMessage(element, text, isError = true) {
  element.textContent = text;
  element.style.color = isError ? '#b42318' : '#166534';
}

function showApp() {
  els.loginView.classList.add('hidden');
  els.appView.classList.remove('hidden');
  els.welcomeText.textContent = `Welcome, ${state.user?.username || 'admin'}`;
  switchTab(state.activeTab);
}

function showLogin() {
  els.appView.classList.add('hidden');
  els.loginView.classList.remove('hidden');
}

async function loginUser(event) {
  event.preventDefault();
  const form = new FormData(els.loginForm);
  const username = form.get('username');
  const password = form.get('password');

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('schoolToken', state.token);
    setMessage(els.loginMessage, 'Login successful.', false);
    showApp();
    await loadAllData();
  } catch (error) {
    setMessage(els.loginMessage, error.message || 'Login failed.');
  }
}

async function logout() {
  try {
    if (state.token) {
      await fetchJson('/api/logout', { method: 'POST' });
    }
  } catch (error) {
    console.warn('Logout request failed:', error.message);
  }

  state.token = '';
  state.user = null;
  localStorage.removeItem('schoolToken');
  showLogin();
}

function switchTab(tab) {
  state.activeTab = tab;
  els.navBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  els.tabPanels.forEach((panel) => {
    panel.classList.toggle('active', panel.id === tab);
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function htmlStatus(value, baseClass = '') {
  const normalized = String(value || '').toLowerCase();
  const className = normalized === 'paid' || normalized === 'active' ? 'status-' + normalized : 'status-' + normalized;
  return `<span class="status-label ${className}">${value || '—'}</span>`;
}

function renderSelectOptions(selectEl, items, optionText, valueKey = 'id', labelKey = 'name') {
  selectEl.innerHTML = ''; // no options yet

  if (!items || !items.length) {
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = `No ${optionText} available`;
    selectEl.appendChild(placeholder);
    return;
  }

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = `Select ${optionText}`;
  selectEl.appendChild(defaultOption);

  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item[valueKey];
    option.textContent = item[labelKey];
    selectEl.appendChild(option);
  });
}

async function loadAllData() {
  try {
    await Promise.all([
      loadOverview(),
      loadStudents(),
      loadTeachers(),
      loadCourses(),
      loadGrades(),
      loadAttendance(),
      loadFees(),
    ]);
  } catch (error) {
    console.error('Failed to load data:', error.message);
  }
}

async function loadOverview() {
  const data = await fetchJson('/api/overview');
  els.totalStudents.textContent = data.totalStudents || 0;
  els.totalTeachers.textContent = data.totalTeachers || 0;
  els.totalCourses.textContent = data.totalCourses || 0;
  els.averageScore.textContent = `${Number(data.averageScore || 0).toFixed(1)}%`;
  els.collectedFees.textContent = formatCurrency(data.collectedFees || 0);
  els.attendanceRate.textContent = `${Number(data.attendanceRate || 0).toFixed(1)}%`;
}

async function loadStudents() {
  const students = await fetchJson('/api/students');
  els.studentsTableBody.innerHTML = students.map((student) => `
    <tr>
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>${student.phone || '—'}</td>
      <td>${student.guardian_name || '—'}</td>
      <td>${htmlStatus(student.status || 'active')}</td>
      <td>
        <button class="action-btn edit-btn" data-action="edit-student" data-id="${student.id}">Edit</button>
        <button class="action-btn delete-btn" data-action="delete-student" data-id="${student.id}">Delete</button>
      </td>
    </tr>
  `).join('');

  renderSelectOptions(els.gradeStudentSelect, students, 'student', 'id', 'name');
  renderSelectOptions(els.attendanceStudentSelect, students, 'student', 'id', 'name');
  renderSelectOptions(els.feeStudentSelect, students, 'student', 'id', 'name');
}

async function loadTeachers() {
  const teachers = await fetchJson('/api/teachers');
  els.teachersTableBody.innerHTML = teachers.map((teacher) => `
    <tr>
      <td>${teacher.name}</td>
      <td>${teacher.email}</td>
      <td>${teacher.subject}</td>
      <td>${htmlStatus(teacher.status || 'active')}</td>
      <td>
        <button class="action-btn edit-btn" data-action="edit-teacher" data-id="${teacher.id}">Edit</button>
        <button class="action-btn delete-btn" data-action="delete-teacher" data-id="${teacher.id}">Delete</button>
      </td>
    </tr>
  `).join('');

  renderSelectOptions(els.teacherSelect, teachers, 'teacher', 'id', 'name');
}

async function loadCourses() {
  const courses = await fetchJson('/api/courses');
  els.coursesTableBody.innerHTML = courses.map((course) => `
    <tr>
      <td>${course.course_name}</td>
      <td>${course.code}</td>
      <td>${course.teacher_name || '—'}</td>
      <td>${course.credits || 0}</td>
      <td>${course.schedule || '—'}</td>
      <td>
        <button class="action-btn edit-btn" data-action="edit-course" data-id="${course.id}">Edit</button>
        <button class="action-btn delete-btn" data-action="delete-course" data-id="${course.id}">Delete</button>
      </td>
    </tr>
  `).join('');

  renderSelectOptions(els.gradeCourseSelect, courses, 'course', 'id', 'course_name');
  renderSelectOptions(els.attendanceCourseSelect, courses, 'course', 'id', 'course_name');
}

async function loadGrades() {
  const grades = await fetchJson('/api/grades');
  els.gradesTableBody.innerHTML = grades.map((grade) => `
    <tr>
      <td>${grade.student_name}</td>
      <td>${grade.course_name}</td>
      <td>${grade.exam}</td>
      <td>${grade.score}</td>
      <td>${grade.remarks || '—'}</td>
    </tr>
  `).join('');
}

async function loadAttendance() {
  const attendance = await fetchJson('/api/attendance');
  els.attendanceTableBody.innerHTML = attendance.map((entry) => `
    <tr>
      <td>${entry.student_name}</td>
      <td>${entry.course_name}</td>
      <td>${entry.date}</td>
      <td>${htmlStatus(entry.present ? 'Present' : 'Absent')}</td>
    </tr>
  `).join('');
}

async function loadFees() {
  const fees = await fetchJson('/api/fees');
  els.feesTableBody.innerHTML = fees.map((fee) => `
    <tr>
      <td>${fee.student_name}</td>
      <td>${formatCurrency(fee.amount)}</td>
      <td>${fee.due_date}</td>
      <td>${htmlStatus(fee.status || 'pending')}</td>
      <td>${fee.notes || '—'}</td>
      <td>
        <button class="action-btn edit-btn" data-action="mark-paid" data-id="${fee.id}">Mark paid</button>
      </td>
    </tr>
  `).join('');
}

async function handleStudentSubmit(event) {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(els.studentForm).entries());
  const id = document.getElementById('studentId').value;

  try {
    if (id) {
      await fetchJson(`/api/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
    } else {
      await fetchJson('/api/students', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
    }

    els.studentForm.reset();
    document.getElementById('studentId').value = '';
    document.getElementById('cancelStudentEdit').classList.add('hidden');
    await loadAllData();
  } catch (error) {
    alert(error.message);
  }
}

async function handleTeacherSubmit(event) {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(els.teacherForm).entries());
  const id = document.getElementById('teacherId').value;

  try {
    if (id) {
      await fetchJson(`/api/teachers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
    } else {
      await fetchJson('/api/teachers', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
    }

    els.teacherForm.reset();
    document.getElementById('teacherId').value = '';
    document.getElementById('cancelTeacherEdit').classList.add('hidden');
    await loadAllData();
  } catch (error) {
    alert(error.message);
  }
}

async function handleCourseSubmit(event) {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(els.courseForm).entries());
  const id = document.getElementById('courseId').value;

  try {
    if (id) {
      await fetchJson(`/api/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
    } else {
      await fetchJson('/api/courses', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
    }

    els.courseForm.reset();
    document.getElementById('courseId').value = '';
    document.getElementById('cancelCourseEdit').classList.add('hidden');
    await loadAllData();
  } catch (error) {
    alert(error.message);
  }
}

async function handleGradeSubmit(event) {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(els.gradeForm).entries());

  try {
    await fetchJson('/api/grades', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    els.gradeForm.reset();
    await loadAllData();
  } catch (error) {
    alert(error.message);
  }
}

async function handleAttendanceSubmit(event) {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(els.attendanceForm).entries());

  try {
    await fetchJson('/api/attendance', {
      method: 'POST',
      body: JSON.stringify(
        {
          ...formData,
          present: formData.present === '1',
        }
      ),
    });

    els.attendanceForm.reset();
    await loadAllData();
  } catch (error) {
    alert(error.message);
  }
}

async function handleFeeSubmit(event) {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(els.feeForm).entries());

  try {
    await fetchJson('/api/fees', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    els.feeForm.reset();
    await loadAllData();
  } catch (error) {
    alert(error.message);
  }
}

async function handleTableAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const { action, id } = target.dataset;
  if (!action || !id) return;

  try {
    if (action === 'delete-student') {
      await fetchJson(`/api/students/${id}`, { method: 'DELETE' });
      await loadAllData();
      return;
    }

    if (action === 'edit-student') {
      const students = await fetchJson('/api/students');
      const student = students.find((entry) => String(entry.id) === String(id));
      if (!student) return;

      Object.entries(student).forEach(([key, value]) => {
        const field = els.studentForm.elements.namedItem(key);
        if (field) field.value = value || '';
      });

      document.getElementById('studentId').value = student.id;
      document.getElementById('cancelStudentEdit').classList.remove('hidden');
      switchTab('students');
      return;
    }

    if (action === 'delete-teacher') {
      await fetchJson(`/api/teachers/${id}`, { method: 'DELETE' });
      await loadAllData();
      return;
    }

    if (action === 'edit-teacher') {
      const teachers = await fetchJson('/api/teachers');
      const teacher = teachers.find((entry) => String(entry.id) === String(id));
      if (!teacher) return;

      Object.entries(teacher).forEach(([key, value]) => {
        const field = els.teacherForm.elements.namedItem(key);
        if (field) field.value = value || '';
      });

      document.getElementById('teacherId').value = teacher.id;
      document.getElementById('cancelTeacherEdit').classList.remove('hidden');
      switchTab('teachers');
      return;
    }

    if (action === 'delete-course') {
      await fetchJson(`/api/courses/${id}`, { method: 'DELETE' });
      await loadAllData();
      return;
    }

    if (action === 'edit-course') {
      const courses = await fetchJson('/api/courses');
      const course = courses.find((entry) => String(entry.id) === String(id));
      if (!course) return;

      Object.entries(course).forEach(([key, value]) => {
        const field = els.courseForm.elements.namedItem(key);
        if (field) field.value = value || '';
      });

      document.getElementById('courseId').value = course.id;
      document.getElementById('cancelCourseEdit').classList.remove('hidden');
      switchTab('courses');
      return;
    }

    if (action === 'mark-paid') {
      await fetchJson(`/api/fees/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'paid' }),
      });
      await loadAllData();
    }
  } catch (error) {
    alert(error.message);
  }
}

function bindEventListeners() {
  els.loginForm.addEventListener('submit', loginUser);
  els.logoutBtn.addEventListener('click', logout);

  els.navBtns.forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  els.studentForm.addEventListener('submit', handleStudentSubmit);
  els.teacherForm.addEventListener('submit', handleTeacherSubmit);
  els.courseForm.addEventListener('submit', handleCourseSubmit);
  els.gradeForm.addEventListener('submit', handleGradeSubmit);
  els.attendanceForm.addEventListener('submit', handleAttendanceSubmit);
  els.feeForm.addEventListener('submit', handleFeeSubmit);

  document.addEventListener('click', handleTableAction);

  document.getElementById('cancelStudentEdit').addEventListener('click', () => {
    els.studentForm.reset();
    document.getElementById('studentId').value = '';
    document.getElementById('cancelStudentEdit').classList.add('hidden');
  });

  document.getElementById('cancelTeacherEdit').addEventListener('click', () => {
    els.teacherForm.reset();
    document.getElementById('teacherId').value = '';
    document.getElementById('cancelTeacherEdit').classList.add('hidden');
  });

  document.getElementById('cancelCourseEdit').addEventListener('click', () => {
    els.courseForm.reset();
    document.getElementById('courseId').value = '';
    document.getElementById('cancelCourseEdit').classList.add('hidden');
  });
}

async function initialize() {
  bindEventListeners();

  if (!state.token) {
    showLogin();
    return;
  }

  try {
    const me = await fetchJson('/api/me');
    state.user = me.user;
    showApp();
    await loadAllData();
  } catch (error) {
    state.token = '';
    localStorage.removeItem('schoolToken');
    showLogin();
  }
}

initialize();
