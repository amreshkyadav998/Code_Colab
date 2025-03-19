import { Button } from "@/components/ui/button";
import { CodeIcon, Share2Icon, UsersIcon } from "lucide-react";
import Link from "next/link";
import FeaturedSnippets from "@/components/featured-snippets";

export default function Home() {
  return (
    <div className="relative container mx-auto px-4 py-12 min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white overflow-hidden transition-colors">
      {/* Torchlight Effect (Dark Mode) */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-blue-500/40 via-transparent to-transparent blur-3xl opacity-70 dark:block hidden" />

      {/* Hero Section */}
      <section className="relative py-12 md:py-24 lg:py-32 flex flex-col items-center text-center z-10">
        <div className="space-y-6 max-w-3xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-blue-500 via-gray-800 to-purple-500 dark:from-blue-400 dark:via-white dark:to-purple-400 text-transparent bg-clip-text">
            Share Code Snippets. <span className="text-blue-600 dark:text-blue-500">Collaborate.</span> Build Together.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-[700px] mx-auto">
            Create, store, and share your code snippets with syntax highlighting, comments, and version history.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
            <Button asChild size="lg" className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-400/50 dark:bg-blue-600 dark:hover:bg-blue-700">
              <Link href="/snippets/new">Create Snippet</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white">
              <Link href="/explore">Explore Snippets</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-12 md:py-24 z-10">
        <div className="container px-4 md:px-6 grid gap-8 lg:grid-cols-3 lg:gap-16">
          {[
            { icon: CodeIcon, title: "Syntax Highlighting", desc: "Support for over 100 programming languages with beautiful syntax highlighting." },
            { icon: Share2Icon, title: "Easy Sharing", desc: "Share your snippets with a unique link or embed them directly in your projects." },
            { icon: UsersIcon, title: "Collaboration", desc: "Work together with comments, version history, and access controls." }
          ].map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="flex flex-col items-center space-y-4 text-center bg-gray-100 dark:bg-gray-800/50 p-6 rounded-xl shadow-lg shadow-gray-300 dark:shadow-gray-700 hover:scale-105 transition-transform duration-300">
              <div className="p-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 shadow-md dark:from-blue-500 dark:to-purple-500">
                <Icon className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Snippets */}
      <section className="relative py-12 z-10">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter mb-8 text-center text-gray-900 dark:text-white">Featured Snippets</h2>
          <FeaturedSnippets />
        </div>
      </section>
    </div>
  );
}
