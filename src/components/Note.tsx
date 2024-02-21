"use client"

import { Note as NoteModel } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useState } from "react";
import AddNoteDialog from "./AddNoteDialog";

interface NoteProps {
    note: NoteModel
}

export default function Note({note}: NoteProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const wasUpdated = note.updateAt > note.createAt;

  const createdUpdatedAtTimestamp = (
    wasUpdated ? note.updateAt : note.createAt
  ).toDateString();

  return(
    <>
    <Card className="cursor-pointer transition-shadow hover:shadow-lg p-6 rounded-lg bg-blue-100 shadow-md" 
    onClick={() => setShowEditDialog(true)}
    >
        <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-700">{note.title}</CardTitle>
            <CardDescription className="text-blue-500">
                {createdUpdatedAtTimestamp}
                {wasUpdated && " (updated)"}
                </CardDescription>       
                 </CardHeader>

                 <CardContent className="mt-4">
                    <p className="whitespace-pre-line">
                        {note.content}
                    </p>
                 </CardContent>
    </Card>

    <AddNoteDialog open={showEditDialog} setOpen={setShowEditDialog} noteToEdit={note} />

    </>
  )

}