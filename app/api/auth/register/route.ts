import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/models/user"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      provider: "credentials",
    })

    // Remove password from response
    const newUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    }

    return NextResponse.json({ message: "User registered successfully", user: newUser }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "An error occurred during registration" }, { status: 500 })
  }
}

