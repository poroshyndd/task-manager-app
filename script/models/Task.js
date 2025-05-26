export class Task {
  constructor(
    id,
    content,
    username,
    status = 'pending',
    createdAt = new Date(),
    priority = 'medium',
    category = 'work',
    deadline = null
  ) {
    this.id = id;
    this.content = content;
    this.username = username;
    this.status = status;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.priority = priority;
    this.category = category;
    this.deadline = deadline ? (deadline instanceof Date ? deadline : new Date(deadline)) : null;
  }
}
