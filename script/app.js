import { TaskManager } from './models/TaskManager.js';

const manager = new TaskManager();

const form = document.getElementById('task-form');
const taskInput = document.getElementById('task-content');
const priorityInput = document.getElementById('task-priority'); 
const categoryInput = document.getElementById('task-category');
const deadlineInput = document.getElementById('task-deadline');
const sortSelect = document.getElementById('sort-tasks');
const searchInput = document.getElementById('search-input');
const taskList = document.getElementById('task-list');
const statTotal = document.getElementById('stat-total');
const statDone = document.getElementById('stat-done');
const statPending = document.getElementById('stat-pending');

let currentSort = 'date-desc';
let currentFilter = 'all';
let currentCategory = 'all';
let searchQuery = '';

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:10px 20px;border-radius:5px;opacity:1;transition:opacity 0.3s';
  setTimeout(() => toast.style.opacity = '0', 2000);
}

function updateStats() {
  const tasks = manager.getAllTasks();
  statTotal.textContent = tasks.length;
  statDone.textContent = tasks.filter(t => t.status === 'done').length;
  statPending.textContent = tasks.filter(t => t.status !== 'done').length;
}

function renderTaskList() {
  taskList.innerHTML = '';
  const tasks = manager.getAllTasks()
    .filter(task => {
      if (currentFilter === 'done') return task.status === 'done';
      if (currentFilter === 'pending') return task.status === 'pending';
      if (currentFilter === 'overdue') return task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';
      if (currentFilter === 'soon') return task.deadline && new Date(task.deadline) - new Date() < 86400000 && task.status !== 'done';
      return true;
    })
    .filter(task => currentCategory === 'all' || task.category === currentCategory)
    .filter(task => task.content.toLowerCase().includes(searchQuery));

  tasks.sort((a, b) => {
    if (currentSort === 'date-desc') return new Date(b.createdAt) - new Date(a.createdAt);
    if (currentSort === 'date-asc') return new Date(a.createdAt) - new Date(b.createdAt);
    if (currentSort === 'priority') return ['low', 'medium', 'high'].indexOf(a.priority) - ['low', 'medium', 'high'].indexOf(b.priority);
    if (currentSort === 'deadline-asc') return new Date(a.deadline || Infinity) - new Date(b.deadline || Infinity);
    if (currentSort === 'deadline-desc') return new Date(b.deadline || 0) - new Date(a.deadline || 0);
    return 0;
  });

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';

   if (task.deadline) {
  const deadlineDate = new Date(task.deadline);
  const now = new Date();
  if (deadlineDate < now && task.status !== 'done') {
    li.classList.add('task-overdue');
  } else if ((deadlineDate - now) < 86400000 && task.status !== 'done') {
    li.classList.add('task-soon');
  } else {
    li.classList.add('task-ok');
  }
} else {
  li.classList.add('task-ok');
}


    li.innerHTML = `
  <span style="text-decoration: ${task.status === 'done' ? 'line-through' : 'none'};">
    ${task.content}
    <strong>[${task.priority.toUpperCase()}]</strong>
    <span>(${task.category})</span>
    ${task.deadline ? '⏰ do ' + new Date(task.deadline).toLocaleDateString('pl-PL') : ''}
  </span>
  <button data-id="${task.id}" class="done-btn">✅</button>
  <button data-id="${task.id}" class="delete-btn">❌</button>
`;
    taskList.appendChild(li);
  });

  document.querySelectorAll('.done-btn').forEach(btn =>
    btn.onclick = () => { manager.toggleDone(+btn.dataset.id); renderTaskList(); updateStats(); });

  document.querySelectorAll('.delete-btn').forEach(btn =>
    btn.onclick = () => { manager.deleteTask(+btn.dataset.id); renderTaskList(); updateStats(); });

  updateStats();
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const content = taskInput.value.trim();
  const priority = priorityInput.value;
  const category = categoryInput.value;
  const deadline = deadlineInput.value ? new Date(deadlineInput.value) : null;
  if (content) {
    manager.addTask(content, 'user', priority, category, deadline);
    form.reset();
    renderTaskList();
    updateStats();
    showToast('Zadanie zostało dodane');
  }
});

searchInput.oninput = () => {
  searchQuery = searchInput.value.toLowerCase();
  renderTaskList();
};

sortSelect.onchange = () => {
  currentSort = sortSelect.value;
  renderTaskList();
};

document.querySelectorAll('#filters button').forEach(btn => {
  btn.onclick = () => {
    currentFilter = btn.dataset.filter;
    renderTaskList();
  };
});

document.querySelectorAll('#category-filters button').forEach(btn => {
  btn.onclick = () => {
    currentCategory = btn.dataset.category;
    renderTaskList();
  };
});

renderTaskList();
updateStats();
