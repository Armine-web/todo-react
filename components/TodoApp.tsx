'use client';

import useTodos from "@/hooks/useTodos";
import NewTodo from "./NewTodo";
import TodoList from "./TodoList";


export default function TodoApp() {
  
  const {todos, loading, isPending, addTodo, updatedTodo, toggleTodo, deleteTodo} =  useTodos();
  
  return (
    <div className=" mx-auto w-[600px] mt-[200px] bg-gray-200 p-4 rounded-md">
      <NewTodo onAdd={addTodo} pending={isPending}  />
      <TodoList 
        todos={todos}
        loading={loading}
        onUpdate={updatedTodo}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
      />
    </div>
  )
}
