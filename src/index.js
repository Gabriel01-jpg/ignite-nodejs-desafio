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
  if(!user){
    return response.status(400).json({ error: 'User not exists'})
  }
  
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  
  const userAlreadyExist = users.some(user => user.name === name || user.username === username );
  if(userAlreadyExist){
    return response.status(400).json({ error: "User already exists "});
  }
  
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  
  users.push(newUser)
  return response.send(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  return response.send(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    createdAt: new Date()
  }
  
  user.todos.push(newTodo)
  
  return response.status(201).json(newTodo)
  
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  
  const todoExists = user.todos.find(todo => {
    return todo.id === id;
  })
  
  if(!todoExists){
    return response.status(404).json( { error: "Todo not exists" } )
  }
  
  todoExists.title = title;
  todoExists.deadline = new Date(deadline)

  return response.send();
  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoExists = user.todos.find(todo => {
    return todo.id === id;
  })

  if(!todoExists){
    return response.status(404).json( { error: "Todo not exists" } )
  }
  
  todoExists.done = true;
  
  return response.send();
  
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params
  
  const todoToDelete = user.todos.find(todo => todo.id === id)
  
  if(!todoToDelete) {
    return  response.status(404).json({ error: "Todo not exists" })
  }
  
  user.todos.splice(todoToDelete, 1)
  
  return response.send();
});

module.exports = app;