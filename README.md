---
# Dynamic Approval & Attendance App (Next.js + ShadCN)

This is a dynamic multi-level approval system built using [Next.js](https://nextjs.org) (Node.js `v20.11.1`) and styled with the [ShadCN UI](https://ui.shadcn.com/) component library. It includes an integrated attendance feature using a modern camera system and real-time geolocation via [LocationIQ](https://locationiq.com). Approval notifications are sent via the [Mattermost API](https://api.mattermost.com/), and backend routes are handled using Next.js built-in API routes.
---

## 📦 Tech Stack

- **Next.js App Router** (v13+)
- **ShadCN UI**
- **Prisma ORM**
- **PostgreSQL** (or your preferred DB)
- **LocationIQ API** – for location detection
- **Mattermost API** – for dynamic approval notifications
- **Node.js** – `v20.11.1`

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ArisFrsy/next-approval.git
cd next-approval
```

### 2. Install dependencies

Make sure you're using **Node.js v20.11.1**. You can use `nvm` to manage versions.

```bash
npm install
# or
yarn
# or
pnpm install
```

### 3. Setup environment variables

Create a `.env` file and add the following (customize as needed):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/db_name
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_ENCRYPT_KEY=your_public_key
NEXT_LOCATIONIQ_API_KEY=your_locationiq_api_key
NEXT_API_MATTERMOST_URL=https://your-mattermost-webhook-url
NEXT_API_MATTERMOST_TOKEN=your_mattermost_token
NEXT_MATTERMOST_TEAM_ID=your_mattermost_id

```

### 4. Initialize Prisma

```bash
npx prisma init        # only if not initialized yet
npx prisma generate
```

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## 📌 Features

- ✅ **Dynamic Multi-Level Approval Flow** (e.g., Approval 1 → Approval 2 → etc.)
- 📷 **Modern Camera Attendance** with in-browser capture
- 🌍 **Location Detection** using LocationIQ for attendance validation
- 🔔 **Real-Time Approval Notifications** via Mattermost API
- ⚙️ **Backend API Routes** handled by native Next.js (`/app/api`)
- 💅 **ShadCN UI** for clean and flexible component design

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [ShadCN Docs](https://ui.shadcn.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [LocationIQ API](https://locationiq.com/docs)
- [Mattermost Webhooks](https://developers.mattermost.com/integrate/webhooks/incoming/)

---

## 🚀 Deploy

Deploy easily using [Vercel](https://vercel.com), the creators of Next.js:

[Deploy on Vercel](https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app)

---

Let me know if you'd like a version in **Bahasa Indonesia** too, or if you'd like to add badges, screenshots, or API docs!
