const express = require('express');
const cors = require('cors');
const { v4: uuidV4} = require('uuid')

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username)

  if (!user)
    return response.status(400).json({ message: 'User not found!' })
  
  request.user = user

  return next()
}

function getTodo(id, todos) {
  const todo = todos.find((todo) => todo.id === id)
  return todo
}

function verifyUserExists(request, response, next) {
  const { username } = request.body;
  const user = users.find((user) => user.username === username)
  
  if (user)
    return response.status(400).json({ error: 'Username already exist!' })

  return next()
}

app.post('/users', verifyUserExists, (request, response) => {
  const { name, username } = request.body;
  const id = uuidV4()

  const user = {
    id,
    name,
    username,
    todos: [],
    created_at: new Date()
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const id = uuidV4();

  const todo = {
    id,
    title,
    done: false, 
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  let todo = getTodo(id, user.todos);  
  if (!todo)
    return response.status(404).json({ error: 'todo not founded!' })

  todo.title = title;
  todo.deadline = new Date(deadline);
  
  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  let todo = getTodo(id, user.todos);
  if (!todo)
    return response.status(404).json({ error: 'todo not founded!' })

  todo.done = true
  
  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {  
  const { user } = request;
  const { id } = request.params;

  let todo = getTodo(id, user.todos);
  if (!todo)
    return response.status(404).json({ error: 'todo not founded!' })

  todo.done = true

  user.todos.splice(todo, 1)
  
  return response.status(204).send()
});

module.exports = app;