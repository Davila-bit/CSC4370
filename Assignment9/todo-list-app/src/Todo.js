import React from 'react';
import styled from 'styled-components';

const TodoItem = styled.li`
  background: ${props => props.completed
    ? 'linear-gradient(135deg, #a8a8a8 0%, #6e6e6e 100%)'
    : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'};
  color: white;
  padding: 20px 25px;
  margin-bottom: 15px;
  border-radius: 12px;
  list-style: none;
  font-size: 1.1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }

  &:nth-child(even):not([data-completed="true"]) {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  &:nth-child(3n):not([data-completed="true"]) {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }
`;

const TodoText = styled.span`
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
  opacity: ${props => props.completed ? '0.6' : '1'};
  flex: 1;
`;

const CheckButton = styled.button`
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  margin-right: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.5);
    transform: scale(1.1);
  }

  ${props => props.completed && `
    background: white;
    &::after {
      content: '✓';
      color: #43e97b;
      font-weight: bold;
      font-size: 18px;
    }
  `}
`;

const DeleteButton = styled.button`
  background: rgba(255, 0, 0, 0.6);
  border: none;
  color: white;
  padding: 8px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  margin-left: 10px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 0, 0, 0.8);
    transform: scale(1.05);
  }
`;

const Todo = ({ todo, onToggle, onDelete }) => {
  return (
    <TodoItem completed={todo.completed} data-completed={todo.completed}>
      <CheckButton
        completed={todo.completed}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(todo.id);
        }}
      />
      <TodoText completed={todo.completed}>
        {todo.text}
      </TodoText>
      <DeleteButton onClick={(e) => {
        e.stopPropagation();
        onDelete(todo.id);
      }}>
        Delete
      </DeleteButton>
    </TodoItem>
  );
};

export default Todo;
