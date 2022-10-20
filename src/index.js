const express = require('express');
const cors = require('cors');
const { v4: uuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// middlewares
function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;
  const user = users.find((user) => {
    return user.username === username;
  });
  if(!user) {
    return res.status(404).json({ error: 'Username not found' });
  };
  req.user = user;
  return next();
};

// criar usuário
app.post('/users', (req, res) => {
  const { name, username } = req.body;
  const userExists = users.find((user) => {
    return user.username === username;
  });
  if(userExists) {
    return res.status(400).json({ error: 'User Already Exists!' });
  };
  users.push({
    id: uuid(),
    name,
    username,
    todos: []
  });
  return res.status(201).json(users);
});

// listar usuário
app.get('/users', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  return res.status(201).json(user);
});

// listar tarefas
app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  return res.json(user.todos);
});

// criar tarefas
app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body;
  const { user } = req;
  const todos = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };
  user.todos.push(todos);
  return res.status(201).json(todos);
});

// atualizar tarefa
app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body;
  const { id } = req.params;
  const { user } = req;
  const todo = user.todos.find(todo => todo.id === id);
  if(!todo) {
    return res.status(404).json({ error: 'Not Found' });
  };
  todo.title = title;
  todo.deadline = new Date(deadline);
  return res.status(201).json(todo);
});

// tarefa pronta
app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const { user } = req;
  const todo = user.todos.find(todo => todo.id === id);
  if(!todo) {
    return res.status(404).json({ error: 'Not Found' });
  };
  todo.done = true;
  return res.status(201).json(todo);
});

// deletar tarefas
app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const { user } = req;
  const todos = user.todos.findIndex(todo => todo.id === id);
  if(todos === -1) {
    return res.status(404).json({ error: 'Not Found' });
  };
  user.todos.splice(todos, 1);
  return res.status(204).json();
});

module.exports = app;