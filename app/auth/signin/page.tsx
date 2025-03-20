"use client"
import React, { useState } from "react";
import { CodeIcon, GithubIcon, Loader2Icon, LockIcon, MailIcon, UserIcon } from "lucide-react";
import { TabsList, TabsTrigger, TabsContent, Tabs } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";


export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: loginEmail,
        password: loginPassword,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (registerPassword !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email: registerEmail,
          password: registerPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      // Auto login after successful registration
      await signIn("credentials", {
        redirect: false,
        email: registerEmail,
        password: registerPassword,
      })

      router.push("/")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGithubSignIn = () => {
    signIn("github", { callbackUrl: "/" })
  }

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <div className="w-full mx-5 max-w-md relative h-[10px] mb-[300px]">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-75"></div>
        
        <Card className="w-full max-w-md border border-blue-500/20 shadow-lg relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardHeader className="space-y-2 text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-blue-500/10 rounded-full ring-2 ring-blue-500/20">
                <CodeIcon className="h-10 w-10 text-blue-500" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              CodeSnippets
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-400">
              Sign in or create an account to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-gray-100/50 dark:bg-gray-800/50">
                <TabsTrigger value="login" className="text-sm py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-500 data-[state=active]:shadow-sm">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="text-sm py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-500 data-[state=active]:shadow-sm">
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                {error && (
                  <Alert variant="destructive" className="mb-4 border-red-500/20 bg-red-500/10">
                    <AlertDescription className="text-red-500">{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 bg-gray-100/30 dark:bg-gray-800/30 border-gray-300/30 dark:border-gray-700/30 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</Label>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 bg-gray-100/30 dark:bg-gray-800/30 border-gray-300/30 dark:border-gray-700/30 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full py-2 bg-blue-500 hover:bg-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/25"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                {error && (
                  <Alert variant="destructive" className="mb-4 border-red-500/20 bg-red-500/10">
                    <AlertDescription className="text-red-500">{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 bg-gray-100/30 dark:bg-gray-800/30 border-gray-300/30 dark:border-gray-700/30 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="name@example.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="pl-10 bg-gray-100/30 dark:bg-gray-800/30 border-gray-300/30 dark:border-gray-700/30 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</Label>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="pl-10 bg-gray-100/30 dark:bg-gray-800/30 border-gray-300/30 dark:border-gray-700/30 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</Label>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 bg-gray-100/30 dark:bg-gray-800/30 border-gray-300/30 dark:border-gray-700/30 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full py-2 bg-blue-500 hover:bg-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/25"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full bg-gray-100/30 hover:bg-gray-200/50 dark:bg-gray-800/30 dark:hover:bg-gray-700/50 border-gray-300/50 dark:border-gray-700/50 hover:border-gray-400 transition-all duration-200 py-5 shadow-sm"
              onClick={handleGithubSignIn}
            >
              <GithubIcon className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </CardContent>
          
          <CardFooter className="flex justify-center px-6 pt-0 pb-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-4 hover:text-blue-500 transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-blue-500 transition-colors">
                Privacy Policy
              </Link>
              .
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}