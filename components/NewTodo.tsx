'use client';

import { useState } from "react";

type Props = {
  onAdd: (title: string) => void;
  pending: boolean;
}


export default function NewTodo({onAdd, pending}: Props) {

  const [inputValue, setInputValue] = useState('');

  
  const submit = (e: React.FormEvent)=>{
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setInputValue('');
  }

  
  return (
    <form onSubmit={submit}>
        <input 
          name='todo'
          type="text" 
          placeholder="Add New Todo" 
          value={inputValue}
          onChange={e=> setInputValue(e.target.value)}
          disabled={pending}  
          className=" w-full outline-0 border-b-2 border-gray-400"
        />
        <button className=" w-full bg-blue-500 text-white mt-2">
          {pending ? 'Adding...' : 'Add'}
        </button>
    </form>
  )
}
