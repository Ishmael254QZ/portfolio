const loginForm = document.getElementById('loginForm');
const loginPanel = document.getElementById('loginPanel');
const dashboard = document.getElementById('adminDashboard');
const loginStatus = document.getElementById('loginStatus');
const dashboardStatus = document.getElementById('dashboardStatus');
const projectForm = document.getElementById('projectForm');
const projectList = document.getElementById('projectList');
const messageList = document.getElementById('messageList');
const projectImageInput = document.getElementById('projectImage');

async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);
  if (response.status === 204) return null;
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || `Request failed with HTTP ${response.status}.`);
  return result;
}

function showDashboard(admin) {
  loginPanel.hidden = true;
  dashboard.hidden = false;
  document.getElementById('adminUsername').textContent = admin.username;
  Promise.all([loadProjects(), loadMessages(), loadSettings()])
    .catch((error) => showStatus(dashboardStatus, error.message, true));
}

function showStatus(element, message, isError = false) {
  element.textContent = message;
  element.className = isError ? 'form-status is-error' : 'form-status is-success';
}

function addText(parent, tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  parent.appendChild(element);
  return element;
}

async function loadProjects() {
  const { projects } = await apiRequest('/api/admin/projects');
  projectList.replaceChildren();
  if (projects.length === 0) {
    addText(projectList, 'p', 'No projects have been added yet.');
    return;
  }

  projects.forEach((project) => {
    const card = document.createElement('article');
    card.className = 'glass admin-list-card';
    addText(card, 'h3', project.title);
    addText(card, 'p', `${project.category} · ${project.status}`);
    if (project.image) {
      const image = document.createElement('img');
      image.src = project.image;
      image.alt = '';
      image.className = 'admin-thumbnail';
      card.appendChild(image);
    }

    const actions = document.createElement('div');
    actions.className = 'button-row';
    const editButton = addText(actions, 'button', 'Edit');
    editButton.type = 'button';
    editButton.className = 'button button-secondary';
    editButton.addEventListener('click', () => populateProjectForm(project));
    const deleteButton = addText(actions, 'button', 'Delete');
    deleteButton.type = 'button';
    deleteButton.className = 'button button-secondary';
    deleteButton.addEventListener('click', async () => {
      if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
      try {
        await apiRequest(`/api/admin/projects/${project.id}`, { method: 'DELETE' });
        await loadProjects();
        showStatus(dashboardStatus, 'Project deleted.');
      } catch (error) {
        showStatus(dashboardStatus, error.message, true);
      }
    });
    card.appendChild(actions);
    projectList.appendChild(card);
  });
}

function populateProjectForm(project) {
  const fields = projectForm.elements;
  fields.id.value = project.id;
  fields.title.value = project.title;
  fields.category.value = project.category;
  fields.status.value = project.status;
  fields.description.value = project.description;
  fields.problem.value = project.problem;
  fields.features.value = project.features.join('\n');
  fields.technologies.value = project.technologies.join('\n');
  fields.repository.value = project.repository;
  fields.demo.value = project.demo;
  fields.imagePath.value = project.image;
  document.getElementById('projectFormTitle').textContent = `Edit: ${project.title}`;
  document.getElementById('cancelEditButton').hidden = false;
  document.getElementById('projectFormTitle').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetProjectForm() {
  projectForm.reset();
  projectForm.elements.id.value = '';
  projectForm.elements.imagePath.value = '';
  document.getElementById('projectFormTitle').textContent = 'Add a project';
  document.getElementById('cancelEditButton').hidden = true;
  document.getElementById('projectImageStatus').textContent = '';
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  return apiRequest('/api/admin/images', { method: 'POST', body: formData });
}

async function loadSettings() {
  const { profileImage } = await apiRequest('/api/admin/settings');
  document.getElementById('profileImage').dataset.currentImage = profileImage;
}

async function loadMessages() {
  const { messages } = await apiRequest('/api/admin/messages');
  messageList.replaceChildren();
  if (messages.length === 0) {
    addText(messageList, 'p', 'No contact messages yet.');
    return;
  }

  messages.forEach((message) => {
    const card = document.createElement('article');
    card.className = 'glass admin-list-card';
    addText(card, 'h3', message.subject);
    addText(card, 'p', `${message.name} · ${message.email}`);
    addText(card, 'p', message.message);
    addText(card, 'time', new Date(`${message.createdAt}Z`).toLocaleString());
    messageList.appendChild(card);
  });
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginStatus.textContent = 'Signing in…';
  try {
    const { admin } = await apiRequest('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(loginForm)))
    });
    showDashboard(admin);
  } catch (error) {
    showStatus(loginStatus, error.message, true);
  }
});

projectImageInput.addEventListener('change', async () => {
  const file = projectImageInput.files[0];
  if (!file) return;
  const status = document.getElementById('projectImageStatus');
  status.textContent = 'Uploading image…';
  try {
    const { image } = await uploadImage(file);
    projectForm.elements.imagePath.value = image;
    showStatus(status, 'Image uploaded. Save the project to publish it.');
  } catch (error) {
    showStatus(status, error.message, true);
    projectImageInput.value = '';
  }
});

document.getElementById('profileImageForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const status = document.getElementById('dashboardStatus');
  try {
    status.textContent = 'Uploading profile photo…';
    const { image } = await uploadImage(document.getElementById('profileImage').files[0]);
    await apiRequest('/api/admin/settings/profile-image', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image })
    });
    showStatus(status, 'Profile photo updated.');
  } catch (error) {
    showStatus(status, error.message, true);
  }
});

projectForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = projectForm.elements;
  const project = {
    title: form.namedItem('title').value,
    category: form.namedItem('category').value,
    status: form.namedItem('status').value,
    description: form.namedItem('description').value,
    problem: form.namedItem('problem').value,
    features: form.namedItem('features').value.split('\n').map((item) => item.trim()).filter(Boolean),
    technologies: form.namedItem('technologies').value.split('\n').map((item) => item.trim()).filter(Boolean),
    repository: form.namedItem('repository').value,
    demo: form.namedItem('demo').value,
    image: form.namedItem('imagePath').value
  };

  try {
    const id = form.namedItem('id').value;
    await apiRequest(id ? `/api/admin/projects/${id}` : '/api/admin/projects', {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    resetProjectForm();
    await loadProjects();
    showStatus(dashboardStatus, id ? 'Project updated.' : 'Project added.');
  } catch (error) {
    showStatus(dashboardStatus, error.message, true);
  }
});

document.getElementById('cancelEditButton').addEventListener('click', resetProjectForm);
document.getElementById('logoutButton').addEventListener('click', async () => {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    dashboard.hidden = true;
    loginPanel.hidden = false;
    loginForm.reset();
    loginStatus.textContent = 'You have signed out.';
  } catch (error) {
    showStatus(dashboardStatus, error.message, true);
  }
});

apiRequest('/api/auth/me')
  .then(({ admin }) => {
    if (admin) showDashboard(admin);
  })
  .catch((error) => showStatus(loginStatus, error.message, true));
