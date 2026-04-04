// ============================================================
// Configuration Supabase
// ============================================================
// IMPORTANT : Remplacez ces valeurs par celles de votre projet Supabase
// (Settings > API dans le dashboard Supabase)
const SUPABASE_URL = 'https://lqmtugoubczposyktxtz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxbXR1Z291YmN6cG9zeWt0eXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTU5NzMsImV4cCI6MjA5MDgzMTk3M30.lqz2bh6YAaErxiv6gS_zurAaqqNZqq0GNHmVdJkwr5w';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// State
// ============================================================
let currentSection = 'notes';
let notesCache = [];
let tasksCache = [];

// ============================================================
// DOM References
// ============================================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// Sections
const notesSection = $('#notes-section');
const tasksSection = $('#tasks-section');

// Navigation
const navItems = $$('.nav-item');

// Notes
const notesList = $('#notes-list');
const noteModal = $('#note-modal');
const noteForm = $('#note-form');
const noteModalTitle = $('#note-modal-title');
const notesSearch = $('#notes-search');
const notesFilterCategory = $('#notes-filter-category');
const notesFilterDate = $('#notes-filter-date');

// Tasks
const tasksList = $('#tasks-list');
const taskModal = $('#task-modal');
const taskForm = $('#task-form');
const taskModalTitle = $('#task-modal-title');
const tasksSearch = $('#tasks-search');
const tasksFilterCategory = $('#tasks-filter-category');
const tasksFilterStatus = $('#tasks-filter-status');
const tasksFilterDate = $('#tasks-filter-date');

// ============================================================
// Mobile menu
// ============================================================
(function initMobileMenu() {
  const btn = document.createElement('button');
  btn.className = 'mobile-menu-btn';
  btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
  document.body.prepend(btn);
  const sidebar = $('.sidebar');

  btn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Close sidebar when clicking a nav item on mobile
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) sidebar.classList.remove('open');
    });
  });
})();

// ============================================================
// Navigation
// ============================================================
navItems.forEach((item) => {
  item.addEventListener('click', () => {
    navItems.forEach((n) => n.classList.remove('active'));
    item.classList.add('active');
    const section = item.dataset.section;
    currentSection = section;
    notesSection.classList.toggle('hidden', section !== 'notes');
    tasksSection.classList.toggle('hidden', section !== 'tasks');
  });
});

// ============================================================
// Toast
// ============================================================
function showToast(message) {
  const container = $('#toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 2500);
}

// ============================================================
// Helpers
// ============================================================
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function truncate(text, max = 120) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '...' : text;
}

// ============================================================
// NOTES — CRUD
// ============================================================
async function loadNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    showToast('Erreur de chargement des notes');
    console.error(error);
    return;
  }
  notesCache = data || [];
  updateNotesCategories();
  renderNotes();
}

function updateNotesCategories() {
  const cats = [...new Set(notesCache.map((n) => n.category).filter(Boolean))];
  const current = notesFilterCategory.value;
  notesFilterCategory.innerHTML = '<option value="">Toutes les catégories</option>';
  cats.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    notesFilterCategory.appendChild(opt);
  });
  notesFilterCategory.value = current;
}

function getFilteredNotes() {
  const search = notesSearch.value.toLowerCase().trim();
  const cat = notesFilterCategory.value;
  const date = notesFilterDate.value;

  return notesCache.filter((note) => {
    if (search && !note.title.toLowerCase().includes(search) && !(note.content || '').toLowerCase().includes(search)) return false;
    if (cat && note.category !== cat) return false;
    if (date && note.created_at.slice(0, 10) !== date) return false;
    return true;
  });
}

function renderNotes() {
  const filtered = getFilteredNotes();
  if (filtered.length === 0) {
    notesList.innerHTML = '<div class="empty-state">Aucune note trouvée.</div>';
    return;
  }

  notesList.innerHTML = filtered
    .map(
      (note) => `
    <div class="list-item" data-id="${note.id}" onclick="openEditNote('${note.id}')">
      <div class="list-item-content">
        <div class="list-item-title">${escapeHtml(note.title)}</div>
        <div class="list-item-meta">
          <span>${formatDate(note.created_at)}</span>
          <span class="category-tag">${escapeHtml(note.category || 'Général')}</span>
        </div>
        <div class="list-item-preview">${escapeHtml(truncate(note.content))}</div>
      </div>
      <div class="list-item-actions">
        <button class="btn-icon danger" title="Supprimer" onclick="event.stopPropagation(); deleteNote('${note.id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>`
    )
    .join('');
}

function openNoteModal(note = null) {
  $('#note-id').value = note ? note.id : '';
  $('#note-title').value = note ? note.title : '';
  $('#note-category').value = note ? note.category || 'Général' : 'Général';
  $('#note-content').value = note ? note.content || '' : '';
  noteModalTitle.textContent = note ? 'Modifier la note' : 'Nouvelle note';
  noteModal.classList.add('active');
}

function closeNoteModal() {
  noteModal.classList.remove('active');
  noteForm.reset();
}

function openEditNote(id) {
  const note = notesCache.find((n) => n.id === id);
  if (note) openNoteModal(note);
}

// Make accessible globally for onclick handlers
window.openEditNote = openEditNote;

async function deleteNote(id) {
  if (!confirm('Supprimer cette note ?')) return;
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) {
    showToast('Erreur lors de la suppression');
    console.error(error);
    return;
  }
  showToast('Note supprimée');
  loadNotes();
}
window.deleteNote = deleteNote;

noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('#note-id').value;
  const payload = {
    title: $('#note-title').value.trim(),
    category: $('#note-category').value.trim() || 'Général',
    content: $('#note-content').value,
  };

  let error;
  if (id) {
    ({ error } = await supabase.from('notes').update(payload).eq('id', id));
  } else {
    ({ error } = await supabase.from('notes').insert(payload));
  }

  if (error) {
    showToast('Erreur lors de l\'enregistrement');
    console.error(error);
    return;
  }
  showToast(id ? 'Note modifiée' : 'Note créée');
  closeNoteModal();
  loadNotes();
});

// Note modal buttons
$('#btn-add-note').addEventListener('click', () => openNoteModal());
$('#btn-close-note').addEventListener('click', closeNoteModal);
$('#btn-cancel-note').addEventListener('click', closeNoteModal);

// Note filters
notesSearch.addEventListener('input', renderNotes);
notesFilterCategory.addEventListener('change', renderNotes);
notesFilterDate.addEventListener('change', renderNotes);

// ============================================================
// TASKS — CRUD
// ============================================================
async function loadTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    showToast('Erreur de chargement des tâches');
    console.error(error);
    return;
  }
  tasksCache = data || [];
  updateTasksCategories();
  renderTasks();
}

function updateTasksCategories() {
  const cats = [...new Set(tasksCache.map((t) => t.category).filter(Boolean))];
  const current = tasksFilterCategory.value;
  tasksFilterCategory.innerHTML = '<option value="">Toutes les catégories</option>';
  cats.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    tasksFilterCategory.appendChild(opt);
  });
  tasksFilterCategory.value = current;
}

function getFilteredTasks() {
  const search = tasksSearch.value.toLowerCase().trim();
  const cat = tasksFilterCategory.value;
  const status = tasksFilterStatus.value;
  const date = tasksFilterDate.value;

  return tasksCache.filter((task) => {
    if (search && !task.title.toLowerCase().includes(search) && !(task.description || '').toLowerCase().includes(search)) return false;
    if (cat && task.category !== cat) return false;
    if (status && task.status !== status) return false;
    if (date && task.due_date !== date) return false;
    return true;
  });
}

function renderTasks() {
  const filtered = getFilteredTasks();
  if (filtered.length === 0) {
    tasksList.innerHTML = '<div class="empty-state">Aucune tâche trouvée.</div>';
    return;
  }

  tasksList.innerHTML = filtered
    .map(
      (task) => `
    <div class="list-item" data-id="${task.id}" onclick="openEditTask('${task.id}')">
      <div class="list-item-content">
        <div class="list-item-title">${escapeHtml(task.title)}</div>
        <div class="list-item-meta">
          <span class="status-badge" data-status="${escapeHtml(task.status)}">${escapeHtml(task.status)}</span>
          <span class="category-tag">${escapeHtml(task.category || 'Général')}</span>
          ${task.due_date ? `<span>Échéance : ${formatDate(task.due_date)}</span>` : ''}
        </div>
        ${task.description ? `<div class="list-item-preview">${escapeHtml(truncate(task.description))}</div>` : ''}
      </div>
      <div class="list-item-actions">
        <button class="btn-icon danger" title="Supprimer" onclick="event.stopPropagation(); deleteTask('${task.id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>`
    )
    .join('');
}

function openTaskModal(task = null) {
  $('#task-id').value = task ? task.id : '';
  $('#task-title').value = task ? task.title : '';
  $('#task-category').value = task ? task.category || 'Général' : 'Général';
  $('#task-status').value = task ? task.status : 'À faire';
  $('#task-due-date').value = task ? task.due_date || '' : '';
  $('#task-description').value = task ? task.description || '' : '';
  taskModalTitle.textContent = task ? 'Modifier la tâche' : 'Nouvelle tâche';
  taskModal.classList.add('active');
}

function closeTaskModal() {
  taskModal.classList.remove('active');
  taskForm.reset();
}

function openEditTask(id) {
  const task = tasksCache.find((t) => t.id === id);
  if (task) openTaskModal(task);
}
window.openEditTask = openEditTask;

async function deleteTask(id) {
  if (!confirm('Supprimer cette tâche ?')) return;
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) {
    showToast('Erreur lors de la suppression');
    console.error(error);
    return;
  }
  showToast('Tâche supprimée');
  loadTasks();
}
window.deleteTask = deleteTask;

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('#task-id').value;
  const payload = {
    title: $('#task-title').value.trim(),
    category: $('#task-category').value.trim() || 'Général',
    status: $('#task-status').value,
    due_date: $('#task-due-date').value || null,
    description: $('#task-description').value,
  };

  let error;
  if (id) {
    ({ error } = await supabase.from('tasks').update(payload).eq('id', id));
  } else {
    ({ error } = await supabase.from('tasks').insert(payload));
  }

  if (error) {
    showToast('Erreur lors de l\'enregistrement');
    console.error(error);
    return;
  }
  showToast(id ? 'Tâche modifiée' : 'Tâche créée');
  closeTaskModal();
  loadTasks();
});

// Task modal buttons
$('#btn-add-task').addEventListener('click', () => openTaskModal());
$('#btn-close-task').addEventListener('click', closeTaskModal);
$('#btn-cancel-task').addEventListener('click', closeTaskModal);

// Task filters
tasksSearch.addEventListener('input', renderTasks);
tasksFilterCategory.addEventListener('change', renderTasks);
tasksFilterStatus.addEventListener('change', renderTasks);
tasksFilterDate.addEventListener('change', renderTasks);

// ============================================================
// Close modals on overlay click or Escape
// ============================================================
noteModal.addEventListener('click', (e) => {
  if (e.target === noteModal) closeNoteModal();
});
taskModal.addEventListener('click', (e) => {
  if (e.target === taskModal) closeTaskModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeNoteModal();
    closeTaskModal();
  }
});

// ============================================================
// Init
// ============================================================
loadNotes();
loadTasks();
