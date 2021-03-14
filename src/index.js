const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(400).json({ error: 'User not found' });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists!' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
  
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todoCreated = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todoCreated);

  return response.status(201).json(todoCreated);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const { title, deadline } = request.body;

  const todoId = user.todos.find(todo => todo.id === id);

  if (!todoId) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  todoId.title = title;
  todoId.deadline = deadline;

  return response.status(201).json(todoId);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  // const { done } = request.body;
  const { id } = request.params;

  const todoId = user.todos.find(todo => todo.id === id);

  if (!todoId) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  todoId.done = true;

  return response.status(201).json(todoId);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoId = user.todos.find(todo => todo.id === id);

  if (!todoId) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  user.todos.splice(todoId, 1);

  return response.status(204).json();
});

module.exports = app;