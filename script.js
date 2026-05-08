// ---------- DOM Elements ----------
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-task');
const todosList = document.getElementById('todos-list');
const emptyState = document.getElementById('empty-state');
const itemsLeftSpan = document.getElementById('items-left');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterButtons = document.querySelectorAll('.filter');
const dateDisplayElement = document.getElementById('date-display');
const timeDisplayElement = document.getElementById('time-display');
const taskDateInput = document.getElementById('date-input');
const taskTimeInput = document.getElementById('time-input');
const modeToggle = document.querySelector('.mode');
const themeButtons = document.querySelectorAll('.theme-btn');
const priorityOptions = document.querySelectorAll('.priority-option');
const searchInput = document.getElementById('search-input');
const categoryInput = document.getElementById('new-category');
const addCategoryBtn = document.getElementById('add-category-btn');
const categoriesList = document.getElementById('categories-list');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');

// ---------- State ----------
let todos = [];
let currentFilter = 'all';
let currentPriority = 'medium';
let isDarkMode = false;
let searchTerm = '';
let currentCategory = 'all';
let categories = [];
let history = [];

// ---------- Local Storage ----------
const STORAGE_KEY = 'modernTodoApp';

function loadTodos() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      todos = JSON.parse(stored);
    } catch (e) {
      todos = [];
    }
  } else {
    // Sample tasks
    todos = [
      { 
        id: crypto.randomUUID(), 
        text: 'Buy groceries', 
        completed: false,
        category: 'Shopping',
        recurring: 'none',
        notes: '',
        subtasks: [],
        reminder: null,
        order: 0
      },
      { 
        id: crypto.randomUUID(), 
        text: 'Finish project report', 
        completed: true,
        category: 'Work',
        recurring: 'none',
        notes: '',
        subtasks: [],
        reminder: null,
        order: 1
      },
    ];
  }
  loadCategories();
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  history.push(JSON.parse(JSON.stringify(todos)));
  if (history.length > 50) history.shift();
}

function loadCategories() {
  const stored = localStorage.getItem('todoCategories');
  if (stored) {
    categories = JSON.parse(stored);
  } else {
    categories = ['Shopping', 'Work', 'Personal', 'Health'];
  }
  renderCategories();
}

// ---------- Helpers ----------
function getFilteredTodos() {
  let filtered = todos;
  
  // Filter by status
  if (currentFilter === 'active') filtered = filtered.filter(t => !t.completed);
  if (currentFilter === 'completed') filtered = filtered.filter(t => t.completed);
  
  // Filter by search term
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(t => 
      t.text.toLowerCase().includes(term) || 
      (t.notes && t.notes.toLowerCase().includes(term))
    );
  }
  
  // Filter by category
  if (currentCategory !== 'all') {
    filtered = filtered.filter(t => t.category === currentCategory);
  }
  
  // Sort by order and priority
  filtered.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    return 0;
  });
  
  return filtered;
}

function updateUI() {
  renderTodos();
  updateItemsLeft();
  toggleEmptyState();
  updateStatistics();
}

function renderTodos() {
  todosList.innerHTML = '';
  const filtered = getFilteredTodos();

  filtered.forEach((todo, index) => {
    const priority = todo.priority || 'medium';
    const li = document.createElement('li');
    li.className = `todo-item priority-${priority}${todo.completed ? ' completed' : ''}`;
    li.dataset.id = todo.id;
    li.draggable = true;

    const subtasksHTML = todo.subtasks ? todo.subtasks.map((st, i) => `
      <div class="subtask ${st.completed ? 'completed' : ''}">
        <input type="checkbox" class="subtask-checkbox" data-subtask-index="${i}" ${st.completed ? 'checked' : ''}>
        <span>${escapeHTML(st.text)}</span>
      </div>
    `).join('') : '';

    li.innerHTML = `
      <label class="checkbox-container" aria-label="Toggle task completion">
        <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
        <span class="checkmark"></span>
      </label>
      <span class="todo-priority-dot ${priority}" aria-label="${priority} priority"></span>
      <div class="todo-content">
        <div class="todo-header">
          <span class="todo-item-text">${escapeHTML(todo.text)}</span>
          ${todo.category && todo.category !== 'all' ? `<span class="todo-category">${escapeHTML(todo.category)}</span>` : ''}
          ${todo.recurring && todo.recurring !== 'none' ? `<span class="todo-recurring" title="Recurring: ${todo.recurring}"><i class="fas fa-repeat"></i></span>` : ''}
        </div>
        ${todo.date || todo.time ? `<span class="todo-item-meta">${escapeHTML(formatTaskDateTime(todo.date, todo.time))}</span>` : ''}
        ${todo.notes ? `<span class="todo-notes">${escapeHTML(todo.notes)}</span>` : ''}
        ${subtasksHTML ? `<div class="subtasks-container">${subtasksHTML}</div>` : ''}
      </div>
      <div class="todo-actions">
        <button class="edit-notes-btn" title="Edit notes"><i class="fas fa-sticky-note"></i></button>
        <button class="add-subtask-btn" title="Add subtask"><i class="fas fa-list-check"></i></button>
        <button class="delete-btn" aria-label="Delete task">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
    `;

    // Event listeners
    const checkbox = li.querySelector('.todo-checkbox');
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    const subtaskCheckboxes = li.querySelectorAll('.subtask-checkbox');
    subtaskCheckboxes.forEach(cb => {
      cb.addEventListener('change', (e) => toggleSubtask(todo.id, parseInt(e.target.dataset.subtaskIndex)));
    });

    const editNotesBtn = li.querySelector('.edit-notes-btn');
    editNotesBtn.addEventListener('click', () => editNotes(todo));

    const addSubtaskBtn = li.querySelector('.add-subtask-btn');
    addSubtaskBtn.addEventListener('click', () => addSubtask(todo));

    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    // Double-click to edit
    const textSpan = li.querySelector('.todo-item-text');
    textSpan.addEventListener('dblclick', () => enterEditMode(li, todo));

    // Drag and drop
    li.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', e.currentTarget);
      e.currentTarget.classList.add('dragging');
    });

    li.addEventListener('dragend', (e) => {
      e.currentTarget.classList.remove('dragging');
    });

    li.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const dragging = document.querySelector('.dragging');
      if (dragging !== li) {
        li.parentNode.insertBefore(dragging, li);
      }
    });

    todosList.appendChild(li);
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatTaskDateTime(date, time) {
  if (!date && !time) return '';

  const parts = [];
  if (date) {
    const [year, month, day] = date.split('-');
    parts.push(`${day}/${month}/${year}`);
  }
  if (time) {
    parts.push(time);
  }
  return parts.join(' • ');
}

function toggleEmptyState() {
  const visible = getFilteredTodos().length === 0;
  emptyState.classList.toggle('hidden', !visible);
}

function updateItemsLeft() {
  const activeCount = todos.filter(t => !t.completed).length;
  itemsLeftSpan.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
}

// ---------- Statistics ----------
function updateStatistics() {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-completed').textContent = completed;
  document.getElementById('progress-fill').style.width = progress + '%';
}

// ---------- Search Function ----------
function handleSearch(term) {
  searchTerm = term;
  updateUI();
}

// ---------- Categories ----------
function renderCategories() {
  categoriesList.innerHTML = '<div class="category-item active" data-category="all">All</div>';
  categories.forEach(cat => {
    const div = document.createElement('div');
    div.className = 'category-item';
    div.dataset.category = cat;
    div.innerHTML = `
      <span>${escapeHTML(cat)}</span>
      <button class="remove-category" data-category="${cat}" title="Remove category">×</button>
    `;
    div.addEventListener('click', (e) => {
      if (!e.target.classList.contains('remove-category')) {
        setCategory(cat);
      }
    });
    div.querySelector('.remove-category').addEventListener('click', (e) => {
      e.stopPropagation();
      removeCategory(cat);
    });
    categoriesList.appendChild(div);
  });
  localStorage.setItem('todoCategories', JSON.stringify(categories));
}

function setCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.category-item').forEach(el => {
    el.classList.toggle('active', el.dataset.category === cat);
  });
  updateUI();
}

function addNewCategory() {
  const cat = categoryInput.value.trim();
  if (cat && !categories.includes(cat)) {
    categories.push(cat);
    renderCategories();
    categoryInput.value = '';
  }
}

function removeCategory(cat) {
  categories = categories.filter(c => c !== cat);
  todos.forEach(t => {
    if (t.category === cat) t.category = 'all';
  });
  saveTodos();
  renderCategories();
  updateUI();
}

// ---------- Notes and Details ----------
function editNotes(todo) {
  const notes = prompt('Add notes for this task:', todo.notes || '');
  if (notes !== null) {
    todo.notes = notes;
    saveTodos();
    updateUI();
  }
}

function addSubtask(todo) {
  if (!todo.subtasks) todo.subtasks = [];
  const text = prompt('Add a subtask:');
  if (text && text.trim()) {
    todo.subtasks.push({ text: text.trim(), completed: false });
    saveTodos();
    updateUI();
  }
}

function toggleSubtask(todoId, subtaskIndex) {
  const todo = todos.find(t => t.id === todoId);
  if (todo && todo.subtasks && todo.subtasks[subtaskIndex]) {
    todo.subtasks[subtaskIndex].completed = !todo.subtasks[subtaskIndex].completed;
    saveTodos();
    updateUI();
  }
}

// ---------- Recurring Tasks ----------
function setRecurring(todo) {
  const options = ['none', 'daily', 'weekly', 'monthly'];
  const current = todo.recurring || 'none';
  const message = `Current: ${current}\nSelect recurrence:\n1. none\n2. daily\n3. weekly\n4. monthly`;
  const response = prompt(message);
  if (response && options[parseInt(response) - 1]) {
    todo.recurring = options[parseInt(response) - 1];
    saveTodos();
    updateUI();
  }
}

// ---------- Export/Import ----------
function exportTasks() {
  const dataStr = JSON.stringify(todos, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `todos_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importTasks(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        todos = imported;
        saveTodos();
        updateUI();
        alert('Tasks imported successfully!');
      }
    } catch (error) {
      alert('Error importing tasks: ' + error.message);
    }
  };
  reader.readAsText(file);
}

// ---------- Keyboard Shortcuts ----------
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') {
        e.preventDefault();
        exportTasks();
      }
      if (e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    }
    if (e.key === 'Delete' && document.activeElement === todosList) {
      // Delete selected todo
    }
  });
}

// ---------- Todo Actions ----------
function addTodo() {
  const text = taskInput.value.trim();
  if (text === '') {
    taskInput.focus();
    return;
  }

  const newTodo = {
    id: crypto.randomUUID(),
    text: text,
    completed: false,
    priority: currentPriority || 'medium',
    date: taskDateInput ? taskDateInput.value : '',
    time: taskTimeInput ? taskTimeInput.value : '',
    category: currentCategory !== 'all' ? currentCategory : 'Personal',
    recurring: 'none',
    notes: '',
    subtasks: [],
    reminder: null,
    order: todos.length
  };

  todos.push(newTodo);
  saveTodos();
  taskInput.value = '';
  if (taskDateInput) taskDateInput.value = '';
  if (taskTimeInput) taskTimeInput.value = '';
  taskInput.focus();
  updateUI();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    if (todo.completed) {
      createCompletionEffect();
    }
    saveTodos();
    updateUI();
  }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  updateUI();
}

function clearCompleted() {
  const hasCompleted = todos.some(t => t.completed);
  if (!hasCompleted) return;

  todos = todos.filter(t => !t.completed);
  saveTodos();
  updateUI();
}

// ---------- Inline Editing ----------
function enterEditMode(li, todo) {
  if (li.classList.contains('editing')) return;

  li.classList.add('editing');
  const textSpan = li.querySelector('.todo-item-text');
  const currentText = todo.text;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-input';
  input.value = currentText;
  input.setAttribute('aria-label', 'Edit task description');

  textSpan.replaceWith(input);
  input.focus();
  input.select();

  function saveEdit() {
    const newText = input.value.trim();
    if (newText === '') {
      deleteTodo(todo.id);
      return;
    }
    todo.text = newText;
    saveTodos();
    updateUI();
  }

  input.addEventListener('blur', saveEdit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      input.blur(); // triggers save
    }
    if (e.key === 'Escape') {
      input.value = currentText; // revert
      input.blur();
    }
  });
}

// ---------- Filter Logic ----------
function setFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach(btn => {
    const isActive = btn.dataset.filter === filter;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive);
  });
  updateUI();
}

// ---------- Display Current Date ----------
function displayDate() {
  const now = new Date();
  
  // Format date as MM/DD/YYYY
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const year = now.getFullYear();
  const dateStr = `${month}/${day}/${year}`;
  
  // Format time as HH:MM AM/PM
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 24 ? 'PM' : 'AM';
  hours = hours % 24;
  hours = hours ? hours : 24;
  const timeStr = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  
  if (dateDisplayElement) dateDisplayElement.textContent = dateStr;
  if (timeDisplayElement) timeDisplayElement.textContent = timeStr;
}

// ---------- Dark Mode Toggle ----------
function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-mode', isDarkMode);
  localStorage.setItem('darkMode', isDarkMode);
  
  const icon = modeToggle.querySelector('i');
  if (isDarkMode) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
}

// Load dark mode preference
function loadDarkMode() {
  const saved = localStorage.getItem('darkMode');
  if (saved === 'true') {
    isDarkMode = true;
    document.body.classList.add('dark-mode');
    const icon = modeToggle.querySelector('i');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  }
}

// ---------- Theme Selector ----------
function setTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem('selectedTheme', theme);
  
  themeButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

// Load theme preference
function loadTheme() {
  const saved = localStorage.getItem('selectedTheme');
  if (saved) {
    setTheme(saved);
  }
}

// ---------- Priority Selector ----------
function setPriority(priority) {
  currentPriority = priority;
  localStorage.setItem('currentPriority', priority);
  
  priorityOptions.forEach(option => {
    option.classList.toggle('active', option.dataset.priority === priority);
  });
}

// Load priority preference
function loadPriority() {
  const saved = localStorage.getItem('currentPriority');
  if (saved) {
    setPriority(saved);
  } else {
    setPriority('medium');
  }
}

// ---------- Completion Effect ----------
function createCompletionEffect() {
  // Create celebratory animation
  const colors = ['#FF6B6B', '#FFB84D', '#51CF66', '#5B5BFF', '#9370DB'];
  const container = document.body;
  
  // Create multiple confetti pieces
  for (let i = 0; i < 15; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = '50%';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '9999';
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '-10px';
    
    container.appendChild(confetti);
    
    // Animate confetti falling
    const duration = 1.5 + Math.random() * 0.5;
    const xMove = (Math.random() - 0.5) * 200;
    
    confetti.animate([
      { transform: 'translateY(0) translateX(0) rotate(0deg)', opacity: 1 },
      { transform: `translateY(${window.innerHeight + 20}px) translateX(${xMove}px) rotate(360deg)`, opacity: 0 }
    ], {
      duration: duration * 1000,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
    
    setTimeout(() => confetti.remove(), duration * 1000);
  }
  
  // Play sound feedback
  playCompletionSound();
}

// ---------- Sound Effect ----------
function playCompletionSound() {
  // Create a simple beep sound using Web Audio API
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
}

// ---------- Event Listeners ----------
addBtn.addEventListener('click', addTodo);
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

clearCompletedBtn.addEventListener('click', clearCompleted);

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

// Search
searchInput.addEventListener('input', (e) => handleSearch(e.target.value));

// Categories
addCategoryBtn.addEventListener('click', addNewCategory);
categoryInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addNewCategory();
});

// Export/Import
exportBtn.addEventListener('click', exportTasks);
importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', (e) => {
  if (e.target.files[0]) {
    importTasks(e.target.files[0]);
  }
});

// Mode toggle
modeToggle.addEventListener('click', toggleDarkMode);

// Theme selector
themeButtons.forEach(btn => {
  btn.addEventListener('click', () => setTheme(btn.dataset.theme));
});

// Priority selector
priorityOptions.forEach(option => {
  option.addEventListener('click', () => setPriority(option.dataset.priority));
});

// ---------- Init ----------
function init() {
  loadDarkMode();
  loadTheme();
  loadPriority();
  displayDate();
  loadTodos();
  setupKeyboardShortcuts();
  updateUI();
  setFilter('all');
  setCategory('all');
}

init();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.warn('Service Worker registration failed:', err));
  });
}