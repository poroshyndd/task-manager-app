import { Storage } from '../utils/storage.js';

export class TaskManager {
  constructor() {
    this.tasks = Storage.loadTasks();
    this.currentId = this.tasks.length > 0
      ? Math.max(...this.tasks.map(t => t.id)) + 1
      : 1;
  }

  addTask(content, username, priority, category, deadline) {
  const task = {
    id: this.currentId++,
    content,
    username,
    priority,
    category,
    deadline: deadline ? new Date(deadline) : null,
    status: 'pending',
    createdAt: new Date()
  };
  this.tasks.push(task);
  this.save();
}


  editTask(id, updates) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      Object.assign(task, updates);
      if (updates.deadline) {
        task.deadline = new Date(updates.deadline);
      }
      this.save();
    }
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(task => task.id !== id);
    this.syncIds();
    this.save();
  }

  toggleDone(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.status = task.status === 'done' ? 'pending' : 'done';
      this.save();
    }
  }

  getAllTasks() {
    return this.tasks;
  }

  getSoonTasks(hours = 24) {
    const now = new Date();
    return this.tasks.filter(t =>
      t.deadline && t.status !== 'done' &&
      t.deadline > now &&
      (t.deadline - now) <= hours * 60 * 60 * 1000
    );
  }

  getOverdueTasks() {
    const now = new Date();
    return this.tasks.filter(t =>
      t.deadline && t.status !== 'done' && t.deadline < now
    );
  }

  getTaskById(id) {
    return this.tasks.find(task => task.id === id);
  }

  syncIds() {
    this.currentId = this.tasks.length > 0
      ? Math.max(...this.tasks.map(t => t.id)) + 1
      : 1;
  }

  save() {
    Storage.saveTasks(this.tasks);
  }
}
