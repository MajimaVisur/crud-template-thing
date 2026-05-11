# bun-react-tailwind-shadcn-template

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun dev
```

To run for production:

```bash
bun start
```

To run migrations:

```bash
bun run migrate
```

This project was created using `bun init` in bun v1.3.13. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## API Routes

All API endpoints are served under `/api/*`. JSON bodies and `Authorization: Bearer <token>` are used where noted.

- **POST /api/auth/register** — Register a new user. Body: `{ username, email, password }`. Returns `{ user, token }`.
- **POST /api/auth/login** — Login. Body: `{ emailOrUsername, password }`. Returns `{ user, token }`.
- **GET /api/auth/me** — Get current user. Header: `Authorization: Bearer <token>`.

- **GET /api/users/me** — Protected. Returns current user's basic profile.
- **GET /api/users/favorites** — Protected. Returns current user's favorites list.
- **GET /api/users/posts** — Protected. Returns posts created by the current user.

Admin (requires authenticated user with `is_admin`):

- **POST /api/admin/users/:id/block** — Block a user by id.
- **POST /api/admin/posts/:id/block** — Block a post by id.
- **POST /api/admin/categories** — Create a category. Body: `{ name, description }`.

Public / Posts / Comments / Favorites:

- **GET /api/posts** — List posts. Query params: `page`, `limit`, `category`, `q` (search). Returns `{ posts: [...] }`.
- **GET /api/posts/:id** — Get post details (includes comments and `favorited` flag when authenticated).
- **POST /api/posts** — Protected. Create a post. Body: `{ title, category_id, description, price, image_url }`.
- **PUT /api/posts/:id** — Protected. Update a post (owner or admin). Body: partial fields to update.
- **DELETE /api/posts/:id** — Protected. Delete a post (owner or admin).
- **POST /api/posts/:id/favorite** — Protected. Add post to favorites for current user.
- **DELETE /api/posts/:id/favorite** — Protected. Remove favorite for current user.
- **GET /api/posts/:id/comments** — List comments for a post (public).
- **POST /api/posts/:id/comments** — Add a comment. Body: `{ content }`. Authenticated users are attributed; anonymous comments are allowed (stored with `user_id = null`).
- **DELETE /api/comments/:id** — Protected. Delete (mark removed) a comment. Allowed for comment author, post owner, or admin.

Notes:

- All request and response bodies use `application/json`.
- Authentication is via JWT tokens returned by the login/register endpoints. Set `Authorization: Bearer <token>` on protected requests.
