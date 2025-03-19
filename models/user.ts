import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  password: {
    type: String,
  },
  image: {
    type: String,
  },
  provider: {
    type: String,
    default: "credentials",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export const User = mongoose.models.User || mongoose.model("User", UserSchema)

