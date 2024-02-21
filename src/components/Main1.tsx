"use client";

import React from "react";
import {useState, useEffect} from "react"
//import { OpenAI } from "langchain/llms/openai"
import { BufferMemory } from "langchain/memory"
import { ConversationChain } from "langchain/chains"
import { OpenAI } from "@langchain/openai"


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




const Main1 = () => {

    const [input, setInput] = useState("");
    const [response, setResponse] = useState("");
    const [catagory, setCatagory] = useState("");

    const [questionNumber, setQuestionNumber] = useState(1);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [correctAnswer, setCorrectAnswer] = useState("");

    const askQuestion = async () => {
        const question = await run(
            `Ask a trivia question in the ${catagory} category.`
        );
        // Assume the AI also provides the correct answer, which we store
        const { questionText, answer } = question;
        setResponse(questionText);
        setCorrectAnswer(answer);
    };

    useEffect(() => {
        if (catagory !== "") {
            askQuestion();
        }
    }, [catagory]);

    const handleSubmit = async(event: React.FormEvent)=>{
        event.preventDefault();

        // Check if the user's answer is correct
        if (input === correctAnswer) {
            setCorrectAnswers(correctAnswers + 1);
        }

        // Move on to the next question
        if (questionNumber < 10) {
            setQuestionNumber(questionNumber + 1);
            askQuestion();
        } else {
            // Game over, show the number of correct answers
            setResponse(`Game over! You got ${correctAnswers} out of 10 questions correct.`);
        }

        setInput("");
    }


    return (
        <div className="container mx-auto p-4 w-full sm:w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2">
            <h1 className="text-2xl font-bold md-4">AI Quiz</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={input} onChange={(e)=>setInput(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded" placeholder="Your answer"/>
                <select value={catagory} onChange={(e)=>setCatagory(e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                    <option value="">Select a catagory</option>
                    {catagories.map((catagory)=>(
                        <option key={catagory.value} value={catagory.value}>
                            {catagory.label}
                            </option>
                    ))}
                    </select>
                    <button type="submit" className="w-full p-2 bg-blue-600 text-white font-semibold rounded">
                        Submit
                    </button>
            </form>

            {response && (
                <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded"> 
                {response}

                    </div>
            )}
        
        </div>
    );
} 

export default Main1;