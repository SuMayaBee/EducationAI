"use client"

import React from "react";
import {useState, useEffect} from "react"
import { OpenAI } from "langchain/llms/openai"
import { BufferMemory } from "langchain/memory"
import { ConversationChain } from "langchain/chains"
import nodemailer from 'nodemailer';
import { sendMail } from "@/lib/mail";


const model = new OpenAI({
    openAIApiKey: "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",
    temperature: 0.9,

});

const memory = new BufferMemory();
const chain = new ConversationChain({llm:model, memory:memory});

const run = async (input: string) => {
    const response = await chain.call({input: input});
    return response.response;
}

const catagories = [
    { label: "Chemistry", value: "chemistry" },
    { label: "Math", value: "math" },
    { label: "Biology", value: "biology" },
    { label: "Physics", value: "physics" },
];




const Main = ({ send }: { send: (subject: string, message: string) => Promise<void> }) => {

    const [input, setInput] = useState("");
    const [response, setResponse] = useState("");
    const [catagory, setCatagory] = useState("");
    const [questionNumber, setQuestionNumber] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
  //  const [subject, setSubject] = useState("");

     const handleSend = () => {
          send(subject, message);
     };


    const askFirstQuestion = async () => {
        const firstQuestion = await run(
            `Ask a trivia question in the ${catagory} catagory.`
        );
        setResponse(firstQuestion);

    };

    useEffect(() => {
        if (catagory !== "") {
            askFirstQuestion();
        }
    }, [catagory]);

    const handleSubmit = async(event: React.FormEvent)=>{
        event.preventDefault();

        const result = await run(
            `AI: ${response}\nYou: ${input}\nAI: Evaluate the answer and ask a relevant trivia question at the end.`
        );



        if (result.includes('correct! ') || result.includes('Correct! ') || result.includes('Great job') || result.includes('Good job')) {
            setCorrectAnswers(correctAnswers+1);
        }

        setResponse(result);
        setInput("");
    // Check if the last character of the response is a question mark
    if (result.trim().endsWith('?')) {
        setQuestionNumber(questionNumber + 1);
    }
   
    }

    const [subject, setSubject] = useState('yu');
    const [message, setMessage] = useState('yu');


    useEffect(() => {
        // Check if we've asked 10 questions
        if (questionNumber >= 5) {
            // Game over, show the number of correct answers
            const gameResult = `Game over! You got ${correctAnswers} out of 5 questions correct.`;
            setResponse(gameResult);
            setSubject('AI Quiz Results');
            setMessage(gameResult);
        
            // Send email
            send('AI Quiz Results', gameResult);
        }
    }, [questionNumber]);

    return (
        <div className="container mx-auto p-6 w-full sm:w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 bg-gray-200 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-4 text-center text-blue-700">AI Quiz</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-lg font-semibold">Question {questionNumber}</p>
                <p className="text-lg font-semibold">Correct Answer: {correctAnswers}</p>

                <input type="text" value={input} onChange={(e)=>setInput(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Your answer"/>
                <select value={catagory} onChange={(e)=>setCatagory(e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                    <option value="">Select a catagory</option>
                    {catagories.map((catagory)=>(
                        <option key={catagory.value} value={catagory.value}>
                            {catagory.label}
                            </option>
                    ))}
                    </select>

                    <button type="submit" className="w-full p-3 bg-blue-700 text-white font-semibold rounded-lg">
                        Submit
                    </button>
            </form>


            {response && (
                <div className="mt-6 p-4 bg-gray-300 border border-gray-400 rounded-lg"> 
                {response}

                    </div>
            )}
        
        </div>
    );
} 

export default Main;