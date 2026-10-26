let projectData = [
  {
    title: 'Ishmael Munyalo Portfolio',
    category: 'Web Development',
    status: 'In Progress',
    description: 'A multi-page portfolio introducing my background, studies, and development interests.',
    problem: 'Create a clear, responsive online presence using plain HTML, CSS, and JavaScript.',
    features: ['Separate information pages', 'Responsive glassmorphism design', 'Light-green visual theme'],
    technologies: ['HTML', 'CSS', 'JavaScript'],
    repository: '',
    demo: ''
  }
];

function setupMobileNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const navigation = document.querySelector('.site-nav');

  if (!toggle || !navigation) return;

  const closeMenu = () => {
    navigation.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
  };

  toggle.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

function readSavedTheme() {
  try {
    const theme = localStorage.getItem('portfolio-theme');
    return theme === 'light' || theme === 'dark' ? theme : null;
  } catch (error) {
    console.warn('Could not read the saved theme preference.', error);
    return null;
  }
}

function setupThemeToggle() {
  const button = document.querySelector('.theme-toggle');
  if (!button) return;

  const root = document.documentElement;
  const initialTheme = readSavedTheme() || 'light';

  const applyTheme = (theme, persist = false) => {
    root.dataset.theme = theme;
    button.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    button.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);

    if (persist) {
      try {
        localStorage.setItem('portfolio-theme', theme);
      } catch (error) {
        console.warn('Could not save the theme preference.', error);
      }
    }
  };

  applyTheme(initialTheme);
  button.addEventListener('click', () => {
    applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
  });
}

function setupRevealAnimations() {
  const revealItems = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => observer.observe(item));
}

function renderProject(project) {
  const card = document.createElement('article');
  card.className = 'project-card glass';

  const visual = document.createElement('div');
  visual.className = 'project-visual';
  if (project.image) {
    const image = document.createElement('img');
    image.src = project.image;
    image.alt = `${project.title} project`;
    image.loading = 'lazy';
    visual.appendChild(image);
  } else {
    visual.textContent = 'Portfolio website';
  }

  const title = document.createElement('h2');
  title.textContent = project.title;

  const metadata = document.createElement('div');
  metadata.className = 'project-meta';
  [project.status, project.category].forEach((value) => {
    const tag = document.createElement('span');
    tag.textContent = value;
    metadata.appendChild(tag);
  });

  const description = document.createElement('p');
  description.textContent = project.description;
  const problem = document.createElement('p');
  problem.textContent = `Problem: ${project.problem}`;
  const features = document.createElement('p');
  features.textContent = `Features: ${project.features.join(', ')}`;

  const technologyList = document.createElement('div');
  technologyList.className = 'project-tech';
  project.technologies.forEach((technology) => {
    const tag = document.createElement('span');
    tag.textContent = technology;
    technologyList.appendChild(tag);
  });

  const links = document.createElement('div');
  links.className = 'project-links';
  if (project.repository) {
    links.appendChild(createProjectLink(project.repository, 'GitHub'));
  }
  if (project.demo) {
    links.appendChild(createProjectLink(project.demo, 'Live demo'));
  }

  card.append(visual, title, metadata, description, problem, features, technologyList, links);
  return card;
}

function createProjectLink(url, label) {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = label;
  return link;
}

function setupProjectFilters() {
  const grid = document.getElementById('projectGrid');
  if (!grid) return;

  const buttons = document.querySelectorAll('.filter-button');
  const emptyState = document.getElementById('emptyState');

  const render = (filter = 'all') => {
    grid.replaceChildren();
    const matches = filter === 'all'
      ? projectData
      : projectData.filter((project) => project.category === filter);

    matches.forEach((project) => grid.appendChild(renderProject(project)));
    if (emptyState) emptyState.hidden = matches.length > 0;
  };

  const knownCategories = new Set(Array.from(buttons, (button) => button.dataset.filter));
  [...new Set(projectData.map((project) => project.category))]
    .filter((category) => !knownCategories.has(category))
    .forEach((category) => {
      const button = document.createElement('button');
      button.className = 'filter-button';
      button.type = 'button';
      button.dataset.filter = category;
      button.setAttribute('aria-pressed', 'false');
      button.textContent = category;
      document.querySelector('.filter-row')?.appendChild(button);
    });

  const allButtons = document.querySelectorAll('.filter-button');
  allButtons.forEach((button) => {
    button.onclick = () => {
      allButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      render(button.dataset.filter);
    };
  });

  render();
}

function setupContactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form || !status) return;

  const fields = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    subject: document.getElementById('subject'),
    message: document.getElementById('message')
  };

  const validators = {
    name: (value) => value.trim().length >= 2 || 'Please enter your name.',
    email: (value) => /^\S+@\S+\.\S+$/.test(value) || 'Please enter a valid email address.',
    subject: (value) => value.trim().length >= 3 || 'Please add a subject.',
    message: (value) => value.trim().length >= 10 || 'Please enter a message of at least 10 characters.'
  };

  const showError = (name, message) => {
    const field = fields[name];
    const error = document.getElementById(`${name}Error`);
    field.classList.toggle('is-invalid', Boolean(message));
    field.setAttribute('aria-invalid', String(Boolean(message)));
    error.textContent = message || '';
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    let valid = true;

    Object.entries(fields).forEach(([name, field]) => {
      const result = validators[name](field.value);
      if (result !== true) {
        valid = false;
        showError(name, result);
      } else {
        showError(name, '');
      }
    });

    if (!valid) {
      status.textContent = 'Please correct the highlighted fields.';
      status.className = 'form-status is-error';
      return;
    }

    const submitButton = form.querySelector('[type="submit"]');
    const initialText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Sending your message…';
    status.className = 'form-status';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Contact endpoint returned HTTP ${response.status}.`);
      status.textContent = result.message;
      status.className = 'form-status is-success';
      form.reset();
    } catch (error) {
      console.error('Contact form submission failed.', error);
      status.textContent = error.message || 'Your message could not be sent. Please try again later or contact me directly.';
      status.className = 'form-status is-error';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = initialText;
      form.removeAttribute('aria-busy');
    }
  });
}

async function loadPortfolioData() {
  try {
    const response = await fetch('/api/public/portfolio');
    if (!response.ok) throw new Error(`Portfolio endpoint returned HTTP ${response.status}.`);
    const data = await response.json();

    if (Array.isArray(data.projects)) {
      projectData = data.projects;
      setupProjectFilters();
    }

    const profileImage = document.querySelector('[data-profile-image]');
    if (profileImage && typeof data.profileImage === 'string') {
      profileImage.src = data.profileImage;
    }
  } catch (error) {
    console.warn('Could not load saved portfolio content; showing the built-in portfolio content.', error);
  }
}

function setupCopyEmail() {
  const button = document.getElementById('copyEmailBtn');
  const email = document.querySelector('[data-email]')?.textContent.trim() || '';
  if (!button || !email || email.startsWith('[')) return;

  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard access is unavailable in this browser.');
      await navigator.clipboard.writeText(email);
      button.textContent = 'Email copied';
    } catch (error) {
      console.error('Could not copy the email address.', error);
      button.textContent = 'Copy failed';
    }
    window.setTimeout(() => {
      button.textContent = 'Copy email';
    }, 1800);
  });
}

function setupCurrentYear() {
  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}

setupMobileNavigation();
setupThemeToggle();
setupRevealAnimations();
setupProjectFilters();
setupContactForm();
setupCopyEmail();
setupCurrentYear();
document.documentElement.classList.add('js-enabled');
loadPortfolioData();
