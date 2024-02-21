import { notesIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import { getEmbedding } from "@/lib/openai";
import { createNotesSchema, deleteNotesSchema, updateNotesSchema } from "@/lib/validation/notes"
import { auth } from "@clerk/nextjs";

export async function POST(req: Request) {
    try{
        const body = await req.json()

        const parseResult = createNotesSchema.safeParse(body);

        if(!parseResult.success) {
            console.error(parseResult.error)
            return Response.json({error: "Invalid Input"}, {status: 400})
        }

        const {title, content} = parseResult.data;
        const {userId} = auth();
       // console.log(userId)

        if(!userId){
            return Response.json({error: "Unauthorized"}, {status: 401})
        }

        const embedding = await getEmbeddingForNote(title, content);

        const note = await prisma.$transaction(async (tx) => {
            const note = await prisma.note.create({
                data: {
                    title,
                    content,
                    userId
                },
            });

            await notesIndex.upsert([{
                id: note.id,
                values: embedding,
                metadata: {userId}
                
            }
        ])
        return note;
        })

      

        return Response.json(note, {status: 201})
       

    } catch(e) {
        console.error(e)
        return Response.json({error: "Internal server error"}, {status: 500})
    }
}

export async function PUT(req: Request) {
    try{
        const body = await req.json()

        const parseResult = updateNotesSchema.safeParse(body);

        if(!parseResult.success) {
            console.error(parseResult.error)
            return Response.json({error: "Invalid Input"}, {status: 400})
        }

        const {id, title, content} = parseResult.data;

        const note = await prisma.note.findUnique({where: {id}})

        if(!note) {
            return Response.json({error: "Note not found"}, {status: 404})
        }


        const {userId} = auth();

        if(!userId || note.userId !== userId){
            return Response.json({error: "Unauthorized"}, {status: 401})
        }

        const embedding = await getEmbeddingForNote(title, content);

        const updateNote = await prisma.$transaction(async (tx) => {
            const updatedNote = await tx.note.update({
                where: {id},
                data: {
                    title,
                    content
                }});

            await notesIndex.upsert([{
                id,
                values: embedding,
                metadata: {userId}
                
            }
        ])

        return updatedNote;

            

        } );

        return Response.json(updateNote, {status: 200})

    } catch(e) {
        console.error(e)
        return Response.json({error: "Internal server error"}, {status: 500})
    }
}


export async function DELETE(req: Request) {
    try{
        const body = await req.json()

        const parseResult = deleteNotesSchema.safeParse(body);

        if(!parseResult.success) {
            console.error(parseResult.error)
            return Response.json({error: "Invalid Input"}, {status: 400})
        }

        const {id} = parseResult.data;

        const note = await prisma.note.findUnique({where: {id}})

        if(!note) {
            return Response.json({error: "Note not found"}, {status: 404})
        }

        const {userId} = auth();

        if(!userId || note.userId !== userId){
            return Response.json({error: "Unauthorized"}, {status: 401})
        }

        await prisma.$transaction(async (tx) => {
            await tx.note.delete({where: {id}})
            await notesIndex.deleteOne(id)

        })


        return Response.json({message: "Note deleted"}, {status: 200})

    } catch(e) {
        console.error(e)
        return Response.json({error: "Internal server error"}, {status: 500})
    }
}

async function getEmbeddingForNote(title: string, content: string | undefined) {
    return getEmbedding(title + "\n\n" + content ?? "") 
}