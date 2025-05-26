export class Storage {
  static loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    return tasks.map(task => ({
      ...task,
      deadline: task.deadline ? new Date(task.deadline) : null,
      createdAt: task.createdAt ? new Date(task.createdAt) : new Date()
    }));
  }

  static saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
}
