import { createNotesSchema } from "@/lib/validation/notes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import LoadingButton from "./ui/loading-button";
import { useRouter } from "next/navigation";
import { Note } from "@prisma/client";
import { useState } from "react";
import { set } from "zod";

interface AddNoteDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  noteToEdit?: Note;
}

export default function AddNoteDialog({ open, setOpen, noteToEdit }: AddNoteDialogProps) {

  const [deleteInProgress, setDeleteInProgress] = useState(false);

    const router = useRouter()

  const form = useForm<createNotesSchema>({
    resolver: zodResolver(createNotesSchema),
    defaultValues: {
        title: noteToEdit?.title || "",
        content: noteToEdit?.content || "",
    }
  });

  class HttpError extends Error {
    status: number;
    statusText: string;
  
    constructor(status: number, statusText: string, message?: string) {
      super(message);
      this.status = status;
      this.statusText = statusText;
    }
  }
  
  async function onSubmit(input: createNotesSchema) {
    try {
      let response;
      if(noteToEdit) {
        response = await fetch("api/notes", {
          method: "PUT",
          body: JSON.stringify({
            id: noteToEdit.id,
            ...input
          })
        });
      } else {
        response = await fetch("/api/notes", {
          method: "POST",
          body: JSON.stringify(input),
        });
      }

      console.log(response)
  
      if(!response.ok) {
        throw new HttpError(response.status, response.statusText, `Status code: ${response.status}`);
      }
  
      form.reset();
      router.refresh();
      setOpen(false);
    } catch(error) {
      console.error(error);
      if (error instanceof HttpError) {
        console.log(`An error occurred: ${error.status} ${error.statusText}. Please try again.`);
      } else {
        console.log("An unexpected error occurred. Please try again.");
      }
    }
  }

  async function onDelete() {
    if(!noteToEdit) {
      return;
    }
    setDeleteInProgress(true)

    try{
      const response = await fetch("/api/notes", {
        method: "DELETE",
        body: JSON.stringify({
          id: noteToEdit.id
        })
      })

      if(!response.ok) {
        throw Error("Status code: " + response.status)
      }

      router.refresh()
      setOpen(false)

    } catch(error) {
      console.error(error)
      console.log("An error occurred. Please try again.")
    } finally{
      setDeleteInProgress(false)
      
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>{noteToEdit ? "Edit Note": "Add Note"}</DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note title</FormLabel>
                  <FormControl>
                    <Input placeholder="Note title" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                         <FormItem>
                            <FormLabel>
                                Note content
                            </FormLabel>
                            <FormControl>
                                <Textarea placeholder="Note content" {...field} />
                            </FormControl>

                            <FormMessage />


                         </FormItem>
                        )} />

                        <DialogFooter className="gap-1 sm:gap-0">
                          {noteToEdit && (
                            <LoadingButton
                            variant="destructive"
                            loading={deleteInProgress}
                            disabled={form.formState.isSubmitting}
                            onClick={onDelete}
                            type="button"
                            >
                              Delete Note
                            </LoadingButton>
                          )}
                           <LoadingButton type="submit"
                            loading={form.formState.isSubmitting}
                            disabled={deleteInProgress}
                            >
                            Submit
                           </LoadingButton>
                        </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
