import React from 'react';
import styled from 'styled-components';
import Todo from './Todo';

const ListContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const TodoUl = styled.ul`
  padding: 0;
  margin: 0;
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  padding: 40px 20px;
`;

const TodoList = ({ todos, onToggle, onDelete }) => {
  return (
    <ListContainer>
      {todos.length === 0 ? (
        <EmptyMessage>No tasks yet! Add one to get started.</EmptyMessage>
      ) : (
        <TodoUl>
          {todos.map((todo) => (
            <Todo
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </TodoUl>
      )}
    </ListContainer>
  );
};

export default TodoList;
