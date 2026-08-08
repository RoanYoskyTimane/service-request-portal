# Customer Service Request Portal SPA

A responsive Single-Page Application (SPA) built with React, TypeScript, and TanStack Query for managing customer service requests. The application consumes an OpenAPI 3 specification and incorporates OpenID Connect (OIDC) authentication with Mock Service Worker (MSW) for offline, deterministic API mocking.

---

## 1. Solution Overview
The **Customer Service Request Portal** allows authenticated agents to browse, filter, search, create, and progress customer service requests through a controlled lifecycle state machine. 

### Key Features
- **OIDC Authentication**: Secure login and session management via OIDC providers (e.g., Auth0 / Zitadel).
- **Service Request Feed**: Paginated, sortable, and filterable table view for handling customer tickets.
- **Real-time Lifecycle State Machine**: Enforces strict status transitions (`OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`) based on OAS3 business rules.
- **Optimistic Concurrency Control**: Handles HTTP `409 Conflict` errors gracefully when a record has been modified by another operator.
- **Dynamic Request Creation**: Form validation mapping to the OpenAPI schema payload (`CreateServiceRequest`).

---

## 2. Technology & Library Choices

| Category | Library / Tool | Justification |
| :--- | :--- | :--- |
| **Build Tool & Runtime** | Vite + React (v18) + TS | Fast HMR, minimal overhead, and native ES module bundling. |
| **State & API Queries** | TanStack Query (v5) | Automatic caching, background refetching, pagination management, and state synchronization. |
| **Authentication** | `react-oidc-context` & `oidc-client-ts` | Standardized OIDC client implementation with PKCE support and reactive React state bindings. |
| **API Mocking** | Mock Service Worker (MSW v2) | Intercepts HTTP requests at the browser network layer without modifying application fetch code. |
| **Type Safety** | `openapi-typescript` | Generates static TypeScript interfaces directly from `openapi.yaml` to ensure contract compliance. |
| **Client-Side Routing** | `react-router` (v8) | Enforces route-based view separations, rendering layout routing wrapper and dynamic request loading via URL param queries. |
| **Testing** | Vitest + React Testing Library | Fast Unit and Component UI testing environment backed by jsdom. |
| **Styling** | Vanilla CSS | Zero build abstraction, highly predictable, lightweight, and custom design tokens. |

---

## 3. Architecture Summary
The application follows a modular, feature-based layered architecture:

```text
src/
├── api/                    # OpenAPI contract types & centralized fetch HTTP client services
├── auth/                   # OIDC Provider wrapper and context configuration
├── components/             # Reusable UI domain components with isolated Vanilla CSS
│   ├── CreateRequestPage/  # New request page view
│   ├── LandingPage/        # Login and Authentication gate screen
│   ├── Navbar/             # Shared header component with Sign Out options
│   ├── ProtectedLayout/    # Layout router checking OIDC authentication
│   ├── RequestDetailPage/  # Ticket details and status transition editor
│   └── RequestTable/       # Ticket search, filtering, and paging feed
├── mocks/                  # MSW workers, schema handlers, and local in-memory dataset
├── utils/                  # Pure utility functions and domain logic
├── App.tsx                 # Core App layout orchestrator
└── main.tsx                # Application bootstrap (QueryClient + AuthProvider + MSW)

```

---

## 4. Local Setup Instructions

### Prerequisites

* **Node.js**: `v22.x` or higher
* **npm**: `v10.x` or higher

### Installation Steps

1. Clone the repository:
```bash
git clone [https://github.com/YOUR_USERNAME/service-request-portal.git](https://github.com/YOUR_USERNAME/service-request-portal.git)
cd service-request-portal

```


2. Install dependencies:
```bash
npm install

```


3. Initialize the environment configuration (see Section 6):
```bash
cp .env.example .env

```


4. Start the local development server:
```bash
npm run dev

```


5. Open your browser at `http://localhost:5173`.

---

## 5. OIDC Provider Configuration

The application leverages the `oidc-client-ts` library wrapper (`react-oidc-context`).

### Integration Steps (e.g., Auth0)

1. Register a **Single Page Application** inside your OIDC Provider Dashboard.
2. Configure Allowed Client URLs:
* **Allowed Callback URLs**: `http://localhost:5173`
* **Allowed Logout URLs**: `http://localhost:5173`
* **Allowed Web Origins**: `http://localhost:5173`


3. Set your Domain and Client ID inside your `.env` file.

---

## 6. Environment Variable Configuration

Environment variables are defined in `.env.example`. Create a local `.env` file prior to running the app:

```env
# OIDC Authority Issuer URL (e.g., Auth0 Tenant URL)
VITE_OIDC_AUTHORITY=[https://dev-egt6yaxs1mmunafb.us.auth0.com](https://dev-egt6yaxs1mmunafb.us.auth0.com)

# OIDC Public Client Identifier
VITE_OIDC_CLIENT_ID=your_public_client_id

```

---

## 7. API Mocking Approach

API mocking is powered by **Mock Service Worker (MSW v2)**:

* **Service Worker (`public/mockServiceWorker.js`)**: Intercepts outgoing `/requests` network calls during local development.
* **Contract Enforcement (`src/mocks/handlers.ts`)**: Mocks `GET`, `POST`, and `PATCH` endpoints complying strictly with `frontend-challenge-api.openapi.yaml`.
* **Business Logic Simulation**:
* Implements sorting (`-createdAt`), pagination (`page`, `pageSize`), and text searching.
* Validates status transitions (`OPEN` → `IN_PROGRESS` | `CLOSED`; `IN_PROGRESS` → `RESOLVED` | `OPEN`; `RESOLVED` → `CLOSED` | `IN_PROGRESS`).
* Simulates HTTP `409 Conflict` if the payload `version` parameter mismatches the current record version.



---

## 8. Development, Lint, Test, and Build Commands

| Command | Action |
| --- | --- |
| `npm run dev` | Starts Vite development server with MSW active. |
| `npm run build` | Compiles TypeScript and builds production bundles into `/dist`. |
| `npm run lint` | Runs ESLint analysis across codebase. |
| `npm run test` | Executes unit and UI component tests using Vitest in single-run mode. |
| `npm run test:watch` | Runs Vitest in interactive watch mode. |

---

## 9. Testing Strategy

Automated testing focuses on critical path domain rules and core component render states:

* **Unit Testing**: Tests domain utility logic, specifically state machine status transition rules (`statusTransitions.test.ts`).
* **Component UI Testing**: Validates UI component mounting, auth state rendering, and user interactions using `@testing-library/react`.
* **Type Checking**: Strict TypeScript validation integrated into build commands (`tsc --noEmit`).

---

## 10. GitHub Actions Workflow Description

The repository contains a continuous integration pipeline (`.github/workflows/ci.yml`) triggered on `push` and `pull_request` against `main` and `development` branches.

### Pipeline Stages

1. **Checkout & Environment Setup**: Clones the codebase and boots Node.js v22 with npm caching.
2. **Type Verification**: Executes `npx tsc --noEmit` to ensure no ambient or implicit type errors exist.
3. **Automated Test Suite**: Executes `npm run test` (Vitest) to verify all domain and component assertions pass.
4. **Production Build**: Executes `npm run build` to verify clean compilation without bundle errors.

---

## 11. Security and Accessibility Considerations

### Security

* **OIDC PKCE Flow**: Uses Proof Key for Code Exchange (PKCE) for authorization code grants without storing secret keys on the browser.
* **Sanitized State Mappings**: Application inputs avoid direct `dangerouslySetInnerHTML` injections.
* **Environment Separation**: Secrets and client configurations are injected strictly via Vite environment variables.

### Accessibility (a11y)

* **Semantic HTML**: Form inputs utilize explicit `<label>` bindings, button elements, and clean headings hierarchy (`<h1>`–`<h4>`).
* **Keyboard Navigation**: Form controls, dropdowns, and modal dialogs support native keyboard navigation.
* **Color Contrast**: Badge badges and text choices exceed WCAG AA contrast standards.

---

## 12. Known Limitations

* **In-Memory Mock Persistence**: Since MSW stores created/updated tickets in memory (`data.ts`), refreshing the browser resets modifications back to the base mock dataset.
* **Static User Scope**: The OIDC user profile is currently evaluated for UI token display; backend authorization scope checking (`403 Forbidden`) is simulated via MSW flags.