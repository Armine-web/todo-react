import { NextResponse } from "next/server";
import {prisma} from '@/lib/prisma';
import {z} from 'zod';


const createTodoSchema = z.object({
    title: z.string().min(1, 'Title must not be empty'),
});

const updateTodoSchema = z.object({
    id: z.union([z.string(), z.number()]).transform(val => Number(val)),
    title: z.string().optional(),
    completed: z.boolean().optional(),
});

const deleteTodoSchema = z.object({
    id: z.union([z.string(), z.number()]).transform(val => Number(val)),
});


export async function GET(){
    try{    

        const todos = await prisma.todo.findMany({
            orderBy: {createdAt: 'desc'}
        });
        return NextResponse.json(todos, {status: 200});

    }catch(e){
        console.error('Error fetching Todos', e);
        return NextResponse.json(
            {error: 'Failed to fetch Todo List. Please try again later'},
            {status: 500}
        )
    }
}

export async function POST(req: Request){
    try{

        const body = await req.json();
        const parsed = createTodoSchema.safeParse(body);

        console.log(body); // {title: 'hayk'}
        console.log(parsed); // {success: true, data: {title: 'hayk'}}

        if(!parsed.success){
            const msg = parsed.error.errors.map(e => e.message).join(', ');
            return NextResponse.json(
                {error: msg},
                {status: 400}
            );
        }
        const {title} = parsed.data;
        const todo = await prisma.todo.create({data: {title}});
        return NextResponse.json(todo, {status: 201});

    }catch(e){
        console.error('Error creating Todo', e);
        return NextResponse.json(
            {error: 'Failed to create Todo. Please try again later'},
            {status: 500}
        )
    }
}

export async function PUT(req: Request){
    try{

        const body = await req.json();
        const parsed = updateTodoSchema.safeParse(body);
        if(!parsed.success){
            const msg = parsed.error.errors.map(e => e.message).join(', ');
            return NextResponse.json(
                {error: msg},
                {status: 400}
            );
        }
        const {id, title, completed} = parsed.data;
        const existing = await prisma.todo.findUnique({where: {id}});
        if(!existing){
            return NextResponse.json(
                {error: 'Todo Not Found'},
                {status: 404}
            );
        }
        const dataToUpdate: {title?: string, completed?: boolean} = {};
        if(typeof title === 'string'){
            dataToUpdate.title = title;
        }
        if(typeof completed === 'boolean'){
            dataToUpdate.completed = completed;
        }
        const updated = await prisma.todo.update({
            where: {id},
            data: dataToUpdate,
        });
        return NextResponse.json(updated, {status: 200});

    }catch(e){
        console.error('Error updating Todo', e);
        return NextResponse.json(
            {error: 'Failed to update Todo. Please try again later'},
            {status: 500}
        )
    }
}

export async function DELETE(req: Request){
    try{

        const body = await req.json();
        const parsed = deleteTodoSchema.safeParse(body);
        if(!parsed.success){
            const msg = parsed.error.errors.map( e => e.message).join(', ');
            return NextResponse.json(
                {error: msg},
                {status: 400}
            )
        }
        const {id} = parsed.data;
        const existing = await prisma.todo.findUnique({where: {id}});
        if(!existing){
            return NextResponse.json(
                {error: 'Todo Not Found'},
                {status: 404}
            );
        }
        await prisma.todo.delete({where: {id}});
        return new NextResponse(null, {status: 204});

    }catch(e){
        console.error('Error deleting Todo', e);
        return NextResponse.json(
            {error: 'Failed to delete Todo. Please try again later.'},
            {status: 500}
        );
        
    }
}