import Image from "next/image";
import logo from "@/assets/logo444.png";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import education from "@/assets/education.png";


export default function Home() {
  const {userId} = auth()

 // if(userId) redirect("/notes")


  return(
    <main  className="flex flex-col h-screen items-center justify-center gap-5 bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 animate-gradient-x text-coolGray-100">
    <Image 
  src="https://qph.cf2.quoracdn.net/main-qimg-2223d9b9c34c0f078b8993cff65b34b7" 
  alt="logo" 
  width={400} 
  height={400} 
  className="object-cover rounded-lg"
/>
      <div className="flex items-center gap-4">
        <Image src={logo} alt="logo" width={100} height={1000} />
        <span className="font-extrabold tracking-tight text-4xl lg:text-5xl">
          AI Tutor
        </span>
    

      </div>
      <p className="max-w-prose text-center">
        Our AI platform transforms education by analyzing uploaded study materials, creating visuals, answering questions, and generating quizzes.
      </p>
       <Button size="lg" asChild>
        <Link href="/notes">
        Note AI
        </Link>
       </Button>

       {/* <Button size="lg" asChild>
        <Link href="/pdf">
        PDF Chat
        </Link>
       </Button> */}

       <Button size="lg" asChild>
        <Link href="/aiQuiz">
        AI Quiz
        </Link>
       </Button>

    </main>
  )
}
