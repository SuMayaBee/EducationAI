

import { cn } from "@/lib/utils";
import { useChat } from "ai/react"
import { Bot, Trash, XCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Message } from "ai";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useRef } from "react";



function ChatMessage({message: {role, content}}: {message: Pick<Message, "role" | "content">}){

    const {user} = useUser();

    const isAiMessage = role === "assistant";

    return (
        <div className={cn("mb-3 flex items-center", isAiMessage ? "me-5 justify-start" : "justify-end ms-5")}>
           {isAiMessage && <Bot className="mr-2 shrink-0"/> }
           <p className={cn("whitespace-pre-line rounded-md border px-3 py-2",
           isAiMessage ? "bg-background" : "bg-primary text-primary-foreground",
           )} 
           >
                {content}
           </p>

           {!isAiMessage && user?.imageUrl && (
            <Image
              src={user.imageUrl}
              alt="Profile Picture"
                width={100}
                height={100}
                className="ml-2 rounded-full w-10 h-10 object-cover"
            />
           )}
        </div>
    )

}

interface AIChatBoxProps {
    open: boolean;
    onClose: () => void;
}


export default function AIChatBox({ open, onClose}: AIChatBoxProps) {
    const { 
        messages, 
        input,
        handleInputChange,
        handleSubmit,
        setMessages,
        isLoading,
        error,
     } = useChat();

     const inputRef = useRef<HTMLInputElement>(null);
     const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(()=>{
        if(scrollRef.current){
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }

    }, [messages])

    useEffect(()=>{
        if(open) {
            inputRef.current?.focus();
        }
    }, [open])

    const lastMessageIsUser = messages[messages.length - 1]?.role === "user";

  

    return (
        <div className={cn("bottom-0 right-0 z-10 w-full max-w-[500px] p-1 xl:right-36", open ? "fixed" : "hidden")}>
         
         <button onClick={onClose} className="mb-1 ms-auto block">
            <XCircle size={30} />
         </button>
        
         <div className="flex h-[600px] flex-col rounded bg-background border shadow-xl">
            <div className="h-full mt-3 px-3 overflow-y-auto " ref={scrollRef}>
                
                {messages.map((message)=>(
                    
                    <ChatMessage message={message} key={message.id}  />
                ))}
                {
                    isLoading && lastMessageIsUser && (
                        <ChatMessage
                        message={{
                            role: "assistant",
                            content: "Thinking..."
                        }} 
                        />
                    )
                }
                </div>
                {
                    error && (
                        <ChatMessage 
                        message={{
                            role: "assistant",
                            content: "An error occurred. Please try again."
                        }}
                        />
                    )
                }

                {
                    !error && messages.length ===0 && (
                        <div className="flex h-full items-center justify-center gap-3"> 
                            {/* <img src="https://mis.academy/images/7/7d/Mis-robot.gif" alt="MIS Robot" className="w-40 h-40" />  */}
                            <Bot />
                            <p className="text-center">Ask me anything!</p>

                        </div>
                    )
                }
            <form onSubmit={handleSubmit} className="m-3 flex gap-1">
                <Button
                title="Clear Chat"
                variant="outline"
                size="icon"
                className="shrink-0"
                type="button"
                onClick={()=>setMessages([])}
                >
                    <Trash />
                </Button>
                 <Input
                  value={input}
                   onChange={handleInputChange}
                    placeholder="Type a message..."
                    ref={inputRef}
                     />

                 <Button type="submit">Send</Button>
                </form>

         </div>
        </div>
    );
}


