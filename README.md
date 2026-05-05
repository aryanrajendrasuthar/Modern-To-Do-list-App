# Modern To-Do List App

A full-stack task management app with Notion-like features — multiple views, rich text, subtasks, comments, recurring tasks, and browser notifications.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, CSS Modules |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens) |
| Drag & Drop | @dnd-kit |
| Rich Text | Tiptap |
| Container | Docker + nginx |

---

## Features

- **4 Views** — List (drag-to-reorder), Board (Kanban), Calendar (month/week), Table (sortable columns)
- **Task Detail Panel** — slide-in panel with full editing (Notion-style)
- **Rich Text Descriptions** — bold, italic, lists, blockquotes, inline code via Tiptap
- **Subtasks** — nested checklist with progress bar per task
- **Comments** — per-task comment thread with edit/delete
- **Emoji Icon + Cover Color** — visual identity per task
- **Due Date + Time** — schedule tasks down to the minute
- **Recurring Tasks** — daily/weekly/monthly/yearly with custom intervals and day-of-week targeting; auto-spawns next occurrence on completion
- **Browser Notifications** — 15-min warning + exact-time reminder for tasks with due time set
- **Filters** — filter by status, priority, tag, search term across all views
- **Dark Mode** — toggle in the navbar, persisted to localStorage
- **JWT Auth** — register/login with access + refresh token rotation
- **Docker** — one command to run the full stack

---

## Getting Started

### Option 1 — Docker (recommended)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
git clone <repo-url>
cd "To-Do List"
docker compose up --build
```

| Service | URL |
|---|---|
| App | http://localhost:8080 |
| API | http://localhost:5001/api/health |

To stop: `Ctrl+C` then `docker compose down`  
To reset the database: `docker compose down -v`

---

### Option 2 — Local Dev (hot reload)

**Prerequisites:** Node.js 18+, MongoDB running locally or via Docker.

**Step 1 — Start MongoDB (Docker):**
```bash
docker run -d -p 27017:27017 --name todo-mongo mongo:7
```

**Step 2 — Backend:**
```bash
cd backend
npm install
node server.js
# Running on http://localhost:5000
```

**Step 3 — Frontend** (in a new terminal):
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

Open **http://localhost:5173** — changes to source files reflect instantly.

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todo-app
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Project Structure

```
├── backend/
│   ├── config/         # MongoDB connection
│   ├── controllers/    # Route handlers (auth, tasks, comments)
│   ├── middleware/     # JWT auth, error handler
│   ├── models/         # Mongoose schemas (User, Task, Comment)
│   ├── routes/         # Express routers
│   ├── utils/          # Recurrence calculation
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/ # UI components
│   │   │   ├── BoardView       # Kanban with DnD
│   │   │   ├── CalendarView    # Month/week grid
│   │   │   ├── TableView       # Sortable table
│   │   │   ├── TaskDetailPanel # Slide-in full editor
│   │   │   ├── TaskCard        # List view card
│   │   │   ├── TaskModal       # Create task modal
│   │   │   ├── SubtaskList     # Subtask checklist
│   │   │   ├── CommentSection  # Task comments
│   │   │   ├── RichTextEditor  # Tiptap editor
│   │   │   ├── EmojiPicker     # Icon selector
│   │   │   ├── RecurrenceSelector
│   │   │   ├── TimePickerInput
│   │   │   └── ViewSwitcher
│   │   ├── hooks/      # useAuth, useTasks, useReminders
│   │   ├── pages/      # DashboardPage, LoginPage, RegisterPage
│   │   ├── services/   # axios API client
│   │   └── types/      # TypeScript interfaces
│   ├── Dockerfile
│   └── nginx.conf
│
└── docker-compose.yml
```

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Create account |
| POST | `/login` | Login, returns access + refresh tokens |
| POST | `/refresh` | Rotate refresh token |
| POST | `/logout` | Invalidate refresh token |
| GET | `/me` | Get current user |

### Tasks — `/api/tasks` *(requires auth)*

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List tasks (filterable by status, priority, tag, search, date range) |
| POST | `/` | Create task |
| PATCH | `/:id` | Update task fields |
| DELETE | `/:id` | Delete task |
| PATCH | `/reorder/bulk` | Bulk reorder |
| POST | `/:id/subtasks` | Add subtask |
| PATCH | `/:id/subtasks/:sid` | Update subtask |
| DELETE | `/:id/subtasks/:sid` | Delete subtask |

### Comments — `/api/tasks/:taskId/comments` *(requires auth)*

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List comments for a task |
| POST | `/` | Add comment |
| PATCH | `/:commentId` | Edit comment |
| DELETE | `/:commentId` | Delete comment |

---

## How Recurring Tasks Work

1. Open a task's detail panel and enable **Recurrence**
2. Set the frequency (e.g. "Every 2 weeks on Mon, Thu")
3. Optionally set an end date
4. When you check the task as **complete**, the backend automatically creates the next occurrence with the calculated due date — the completed task stays in history

---

## Browser Notifications

When you open the app for the first time, it requests notification permission. If granted:

- A **15-minute warning** fires before any task with a due time set
- An **on-time reminder** fires at the exact due time
- Only tasks due within the next 24 hours are scheduled

---

## Build for Production

```bash
docker compose up --build -d
```

For real production, set strong secrets via environment variables:

```bash
JWT_SECRET=<strong-random-string> JWT_REFRESH_SECRET=<another-strong-string> docker compose up -d
```
