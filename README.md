# Service Deployment Wizard

A multi-step, dynamic form wizard for configuring and provisioning services — built as a study project to learn Next.js App Router, form validation, and multiple database integrations.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Package Manager:** pnpm
- **UI Library:** [shadcn/ui](https://ui.shadcn.com) (radix-lyra style)
- **Form State:** react-hook-form + zod v4
- **Styling:** Tailwind CSS v4
- **Databases:** Firebase Firestore, MongoDB Atlas

## Form Flow

| Step | Name | Fields |
|------|------|--------|
| 1 | General Info | Project Name, Owner, Environment (Dev/Staging/Prod) |
| 2 | Service Selection | Service Type (Database / Web App) |
| 3 | Dynamic Config | **Database →** Engine (Postgres/MySQL), Storage Size (GB) |
|   |                | **Web App →** Framework (Next.js/Nuxt/Python), Public Access |
| 4 | Review & Deploy | Read-only summary + Deploy button |

## Submit Methods

The Review step provides **3 submission methods** via tabs, for studying different backend integrations:

- **Firestore** — Client-side write using Firebase JS SDK
- **MongoDB** — Server action that inserts into MongoDB Atlas
- **Raw Result** — Validates and displays the JSON payload (no network call)

## Project Structure

```
app/
├── actions/deployService.ts   # Server actions (validation + MongoDB insert)
├── globals.css
├── layout.tsx
└── page.tsx
components/
├── ui/                        # shadcn/ui components
└── wizard/
    ├── DeploymentWizard.tsx    # Parent wizard (step state, FormProvider)
    ├── StepGeneralInfo.tsx     # Step 1
    ├── StepServiceSelection.tsx # Step 2
    ├── StepDynamicConfig.tsx   # Step 3 (conditional rendering)
    └── StepReview.tsx          # Step 4 (summary + tabbed submit)
lib/
├── firebase.ts                # Firebase client SDK init
├── mongodb.ts                 # MongoDB Atlas connection (singleton)
├── schemas/
│   └── deploymentSchema.ts    # Zod v4 discriminated union schema
└── utils.ts
```

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required variables:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
```

### 3. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to use the wizard.

## Key Concepts Explored

- **Zod discriminated unions** for conditional form validation
- **react-hook-form `FormProvider`** for sharing form state across step components
- **Per-step validation** with `setError()` to block navigation on empty fields
- **Next.js Server Actions** for server-side validation and MongoDB writes
- **Firebase client SDK** vs **MongoDB server-side driver** — two approaches to database writes in Next.js
