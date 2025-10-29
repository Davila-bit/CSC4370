import React, { useState } from 'react';
import styled from 'styled-components';

const AddTodoContainer = styled.div`
  max-width: 600px;
  margin: 0 auto 30px;
  background: rgba(255, 255, 255, 0.15);
  padding: 25px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 15px 20px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
  }

  &::placeholder {
    color: #999;
  }
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const AddTodo = ({ onAdd }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onAdd(input);
      setInput('');
    }
  };

  return (
    <AddTodoContainer>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Add a new task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <AddButton type="submit">Add</AddButton>
      </Form>
    </AddTodoContainer>
  );
};

export default AddTodo;
