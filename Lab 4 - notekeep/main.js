let notes = [];

class Note {
  constructor({ title, content, color, pin, tags, remindAt, done, createdAt }) {
    this.title = title || '';
    this.content = content || '';
    this.color = color || '#ffffff';
    this.pin = !!pin;
    this.tags = Array.isArray(tags) ? tags : [];
    this.remindAt = remindAt || null;
    this.done = !!done;
    this.createdAt = createdAt || new Date().toISOString();
  }
}

function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes));
  renderNotes();
}

function loadNotes() {
  const data = localStorage.getItem('notes');
  notes = data ? JSON.parse(data).map(n => new Note(n)) : [];
  renderNotes();
  setInterval(checkReminders, 10000);
}

function showForm(index = null) {
  const container = document.getElementById('form-container');
  const note = index !== null ? notes[index] : null;

  container.innerHTML = `
    <form class="note-form" onsubmit="submitForm(event, ${index})">
      <input name="title" placeholder="Tytuł" required value="${note?.title || ''}" />
      <textarea name="content" placeholder="Treść">${note?.content || ''}</textarea>
      <label for="color">Kolor: </label>
      <input name="color" type="color" value="${note?.color || '#ffffff'}" />
      <label><input name="pin" type="checkbox" ${note?.pin ? 'checked' : ''} /> Przypnij</label>
      <label><input name="done" type="checkbox" ${note?.done ? 'checked' : ''} /> Oznacz jako wykonane</label>
      <input name="tags" placeholder="tag1, tag2" value="${note?.tags?.join(', ') || ''}" />
      <input name="remindAt" type="datetime-local" value="${note?.remindAt ? new Date(note.remindAt).toISOString().slice(0,16) : ''}" />
      <button type="submit">Zapisz</button>
      <button type="button" class="danger" onclick="hideForm()">Anuluj</button>
    </form>
  `;
}

function hideForm() {
  document.getElementById('form-container').innerHTML = '';
}

function submitForm(e, index) {
  e.preventDefault();
  const f = e.target;
  const noteData = {
    title: f.title.value.trim(),
    content: f.content.value.trim(),
    color: f.color.value,
    pin: f.pin.checked,
    done: f.done.checked,
    tags: f.tags.value.split(',').map(t => t.trim()).filter(Boolean),
    remindAt: f.remindAt.value ? new Date(f.remindAt.value).toISOString() : null,
    createdAt: index !== null ? notes[index].createdAt : undefined
  };

  if (index !== null) {
    notes[index] = new Note(noteData);
  } else {
    notes.push(new Note(noteData));
  }

  saveNotes();
  hideForm();
}

function renderNotes() {
  const container = document.getElementById('notes-list');
  const doneContainer = document.getElementById('done-notes-list');
  container.innerHTML = '';
  doneContainer.innerHTML = '';
  const search = document.getElementById('searchInput').value.toLowerCase();

  const filtered = notes.filter(note =>
    note.title.toLowerCase().includes(search) ||
    note.content.toLowerCase().includes(search) ||
    note.tags.some(tag => tag.toLowerCase().includes(search))
  );

  const active = filtered.filter(n => !n.done);
  const done = filtered.filter(n => n.done);

  const sorted = active.sort((a, b) => {
    if (a.pin && !b.pin) return -1;
    if (!a.pin && b.pin) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  sorted.forEach((note, index) => renderNoteCard(note, index, container));
  done.forEach((note, index) => renderNoteCard(note, index, doneContainer));
}

function renderNoteCard(note, index, target) {
  const div = document.createElement('div');
  div.className = `note-card${note.pin ? ' pinned' : ''}${note.done ? ' done-note' : ''}`;
  div.style.borderLeftColor = note.color;
  div.innerHTML = `
    <h3>${note.title}</h3>
    <p>${note.content}</p>
    <small>Utworzono: ${new Date(note.createdAt).toLocaleString()}</small><br/>
    ${note.remindAt ? `<strong>Przypomnienie:</strong> ${new Date(note.remindAt).toLocaleString()}<br/>` : ''}
    ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}
    <button onclick="showForm(${index})">Edytuj</button>
    <button onclick="toggleDone(${index})">${note.done ? 'Cofnij' : 'Wykonane'}</button>
    <button class="danger" onclick="deleteNote(${index})">Usuń</button>
  `;
  target.appendChild(div);
}

function toggleDone(index) {
  notes[index].done = !notes[index].done;
  saveNotes();
}

function deleteNote(index) {
  if (confirm('Usunąć tę notatkę?')) {
    notes.splice(index, 1);
    saveNotes();
  }
}

function checkReminders() {
  const now = new Date();
  notes.forEach(note => {
    if (note.remindAt && new Date(note.remindAt) <= now && !note.reminded && !note.done) {
      alert(`Przypomnienie: ${note.title}`);
      note.reminded = true;
    }
  });
  saveNotes();
}

loadNotes();
