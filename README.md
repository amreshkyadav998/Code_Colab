# CodeColab

CodeColab is a collaborative platform where users can post, edit, and share code snippets. Other users can like and comment on these snippets. The platform supports both light and dark themes and utilizes authentication for user management.


## Demo
[!>[Watch the video]](https://drive.google.com/file/d/1ND4r0Maf9xmxlZ5jJg9PLnYV17wCfE9E/view?usp=drive_link)
## Features
- **Post Code Snippets**: Share code snippets with syntax highlighting.
- **Edit Posts**: Users can edit their own posts.
- **Like & Comment**: Engage with the community by liking and commenting on snippets.
- **Light & Dark Mode**: Toggle between themes for better accessibility.
- **Authentication**: Secure authentication using `next-auth`.

## Tech Stack
- **Next.js** (TypeScript)
- **NextAuth.js** (Authentication)
- **Tailwind CSS** (Styling)
- **Prism.js & React Syntax Highlighter** (Code Highlighting)
- **Mongoose** (Database Management)

## Installation & Setup
1. Clone the repository:
   ```sh
   https://github.com/amreshkyadav998/Code_Colab.git
   cd codecolab
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables (`.env.local`):
   ```sh
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_key
   MONGODB_URI=your_mongodb_uri
   ```
4. Run the development server:
   ```sh
   npm run dev
   ```

## API Endpoints
### Authentication
- **`POST /api/auth/signin`** - Sign in a user
- **`POST /api/auth/signout`** - Sign out a user

### Snippet Operations
- **`GET /api/snippets`** - Fetch all code snippets
- **`POST /api/snippets`** - Create a new code snippet
- **`PUT /api/snippets/:id`** - Edit an existing snippet

### Like & Comment
- **`POST /api/snippets/:id/like`** - Like a snippet
- **`POST /api/snippets/:id/comment`** - Add a comment to a snippet


## License
This project is licensed under the MIT License.

## Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request.

