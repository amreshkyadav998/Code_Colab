import { Button } from "@/components/ui/button";
import { CodeIcon, Share2Icon, UsersIcon, GithubIcon, TwitterIcon, LinkedinIcon, HeartIcon } from "lucide-react";
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
      
      {/* Footer Section */}
      <footer className="relative mt-24 bg-gray-100 dark:bg-gray-800 rounded-t-3xl z-10">
        {/* Decorative Wave */}
        <div className="absolute -top-8 left-0 right-0 h-8 overflow-hidden">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-24 transform rotate-180">
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              fill="currentColor"
              className="text-gray-100 dark:text-gray-800"
            />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-16">
            {/* Brand Section */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">CodeSnippets</h3>
              <p className="text-gray-600 dark:text-gray-400">The modern platform for developers to share and discover code snippets.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  <GithubIcon className="h-6 w-6" />
                </a>
                <a href="https://x.com/amreshky997?s=08" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  <TwitterIcon className="h-6 w-6" />
                </a>
                <a href="https://www.linkedin.com/in/amresh-yadav-223656257" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  <LinkedinIcon className="h-6 w-6" />
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Links</h4>
              <ul className="space-y-2">
                {["Home", "Explore", "Create Snippet", "Dashboard", "My Snippets"].map((link) => (
                  <li key={link}>
                    <Link href={`/${link.toLowerCase().replace(/\s+/g, "-")}`} className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Resources */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Resources</h4>
              <ul className="space-y-2">
                {["Documentation", "API Reference", "Keyboard Shortcuts", "Community", "Help Center"].map((resource) => (
                  <li key={resource}>
                    <Link href={`/${resource.toLowerCase().replace(/\s+/g, "-")}`} className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                      {resource}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Newsletter */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Stay Updated</h4>
              <p className="text-gray-600 dark:text-gray-400">Subscribe to our newsletter for the latest features and updates.</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 rounded-l-md shadow-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full"
                />
                <Button className="rounded-l-none ml-2 p-2 bg-blue-500 hover:bg-blue-600 text-white">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          
          {/* Divider */}
          <div className="h-px bg-gray-300 dark:bg-gray-700 my-8" />
          
          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-600 dark:text-gray-400 text-sm">
            <div className="flex items-center space-x-1">
              <span>© {new Date().getFullYear()} CodeSnippets. Made with</span>
              <HeartIcon className="h-4 w-4 text-red-500" />
              <span>for developers.</span>
            </div>
            <div className="flex mt-4 md:mt-0 space-x-6">
              <Link href="/privacy" className="hover:text-blue-500 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-blue-500 transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-blue-500 transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}