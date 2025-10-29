import React, { useState } from 'react';
import styled from 'styled-components';
import TodoList from './TodoList';
import AddTodo from './AddTodo';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Title = styled.h1`
  text-align: center;
  color: #ffffff;
  font-size: 3.5rem;
  margin-bottom: 20px;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  font-weight: 700;
  letter-spacing: 1px;
`;

const Subtitle = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin-bottom: 40px;
`;

function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Complete React assignment', completed: false },
    { id: 2, text: 'Study for CSC4370 exam', completed: false },
    { id: 3, text: 'Build a todo list app', completed: true },
    { id: 4, text: 'Learn styled-components', completed: false },
    { id: 5, text: 'Practice React props', completed: false }
  ]);

  const addTodo = (text) => {
    const newTodo = {
      id: Date.now(),
      text: text,
      completed: false
    };
    setTodos([...todos, newTodo]);
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <AppContainer>
      <Title>✨ My Todo List ✨</Title>
      <Subtitle>Stay organized and get things done!</Subtitle>
      <AddTodo onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
    </AppContainer>
  );
}

export default App;
