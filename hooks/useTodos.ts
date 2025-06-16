'use client';

import { useEffect, useState, useTransition, useOptimistic } from "react";

type CreateTodo = {title: string};
type Todo = {id:number, title: string, completed: boolean};

type Action = 
    | { type: 'ADD', todo: Todo }
    | {type: 'RESET', todos: Todo[]}


export default function useTodos(){
    const [todos, setTodos] = useState<Todo[]>([]);
    const [isPending, startTransition] = useTransition();
    const [loading, setLoading] = useState(true);

    const [optimisticTodos, applyOpimistic] = useOptimistic<Todo[], Action>(
        todos,
        (prev, action) =>{
            switch(action.type){
                case 'ADD':
                    return [ action.todo, ...prev];
                case 'RESET':
                    return action.todos;
                default:
                    return prev;
            }
        }
    );

    useEffect(()=>{
        startTransition(async()=>{
            try{
                const res = await fetch('/api/todos');
                if(!res.ok) throw new Error(`Fetch failed ${res.status}`);
                const todos = (await res.json()) as Todo[];
                setTodos(todos);
            }catch(e){
                console.error('Error fetching todo', e);
            }finally{
                setLoading(false);
            }
        });

    }, [applyOpimistic, startTransition]);


    const addTodo = (title: string) =>{
        const tempId = Date.now();
        const tempTodo: Todo = {id: tempId, title, completed: false};

        startTransition(async()=>{
            applyOpimistic({type: 'ADD', todo: tempTodo});
            try{
                await new Promise(r => setTimeout(r, 5000));
                const res = await fetch('/api/todos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title })
                });
                if(!res.ok) throw new Error(`POST failed ${res.status}`);
                const newTodo = (await res.json()) as Todo;
                setTodos(prev=> [newTodo, ...prev]);
            }catch(e){
                console.error('Error adding todo ', e);    
                applyOpimistic({type: 'RESET', todos});            
            }
        });
    }

    const updatedTodo = (id: number, title: string)=>{
        startTransition(async()=>{

            try{

                const res = await fetch('/api/todos',{
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({id, title})
                });
                if(!res.ok) throw new Error(`PUT failed ${res.status}`);
                const updatedTodo = (await res.json()) as Todo;
                setTodos(prev=> prev.map(t => t.id === id ? updatedTodo: t));

            }catch(e){
                console.error(e);
            }

        });
    } 


    const toggleTodo = (id: number, completed: boolean)=>{
        startTransition(async()=>{

            try{

                const res = await fetch('/api/todos',{
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({id, completed})
                });
                if(!res.ok) throw new Error(`PUT failed ${res.status}`);
                const updatedTodo = (await res.json()) as Todo;
                setTodos(prev=> prev.map(t => t.id === id ? updatedTodo: t));

            }catch(e){
                console.error(e);
            }

        });
    } 

    const deleteTodo = (id: number) =>{
        startTransition(async()=>{

            try{
                const res = await fetch('/api/todos', {
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({id})
                });
                if(!res.ok) throw new Error(`DELETE failed ${res.status}`);
                setTodos(prev=> prev.filter(t=> t.id !== id));
            }catch(e){
                console.error(e);
            }
        });
    }


    return {
        todos: optimisticTodos,
        loading,
        isPending, // useTransition
        addTodo,
        updatedTodo,
        toggleTodo,
        deleteTodo
    }
}    