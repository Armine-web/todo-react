'use client';

import { useEffect, useState, useRef } from "react";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

type Props = {
  todos: Todo[];
  loading: boolean;
  onUpdate: (id: number, title: string) => void;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

export default function TodoList({todos, loading, onUpdate,onToggle, onDelete}: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    if(editingId !== null && inputRef.current){
      inputRef.current.focus();
    }

  }, [editingId]);

  if(loading) return <p>Loading ...</p>;

  const startEditing = (todo: Todo)=>{
    setEditingId(todo.id);
    setEditingValue(todo.title);
  }

  const finishEditing = (id: number)=>{
    if(editingValue.trim()){
      onUpdate(id, editingValue);
      setEditingId(null);
    }
  };

  const cancelEditing = ()=>{
    setEditingId(null);
  };  



  return (
    <ul>
      {todos.map(todo=> <li key={todo.id} className="flex justify-between items-center border-2 m-2 p-2">
        <div>
            {editingId === todo.id ? <>
              
              <input 
                ref={inputRef}
                type="text" 
                value={editingValue}
                className="border-2 outline-0"
                onChange={(e)=> setEditingValue(e.target.value)}
                onBlur={()=> finishEditing(todo.id)}
                onKeyDown={e=>{
                  if(e.key === 'Enter') finishEditing(todo.id);
                  if(e.key === 'Escape') cancelEditing();
                }}
              />
              
            </>: <>
                
                <input 
                    type="checkbox"
                    checked={todo.completed}
                    onChange={()=> onToggle(todo.id, !todo.completed)}
                />
                <span onDoubleClick={()=> startEditing(todo)}>{todo.title}</span>
            
            </>}
        </div>
        <div>
                <button onClick={()=> onDelete(todo.id)}>Delete</button>
        </div>
      </li>)}
    </ul>
  )
}
