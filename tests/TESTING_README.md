# 🧪 Study Material — Testing Guide
## SE3040 University Assignment | Pramodya's Testing Module

---

## 📁 Test Folder Structure

```
tests/
├── setup/
│   ├── testApp.js          # Lightweight Express app for integration tests
│   ├── dbHandler.js        # MongoDB Memory Server (connect/clear/close)
│   ├── testHelpers.js      # JWT factories, data builders
│   └── jest.setup.js       # Loads .env.test before all tests
│
├── unit/
│   ├── validationUtils.test.js       # Tests for utils/validationUtils.js
│   ├── responseHandler.test.js       # Tests for utils/responseHandler.js
│   ├── studyMaterialService.test.js  # Tests for services/studyMaterialService.js
│   └── authMiddleware.test.js        # Tests for Middleware/authMiddleware.js
│
├── integration/
│   └── studyMaterial.test.js         # Full API endpoint tests (all 8 routes)
│
└── performance/
    ├── study-material-load-test.yml  # Artillery load test config (100 users)
    └── generate-perf-token.js        # Helper to generate JWT for perf tests
```

---

## 🛠️ Installation

All testing dependencies are already installed. Run if needed:

```bash
# Install test dependencies
npm install --save-dev jest supertest mongodb-memory-server @jest/globals

# Install Artillery globally (for performance tests)
npm install -g artillery@latest
```

---

## ✅ PART 1 — Unit Tests

Unit tests cover pure function and service logic in **complete isolation** (no DB, no HTTP server, no Cloudinary).

### What's tested:
| Test File | Functions Covered |
|---|---|
| `validationUtils.test.js` | `validateObjectId`, `sanitizeMimeType`, `isFileTypeAllowed`, `isValidEmail`, `sanitizeInput` |
| `responseHandler.test.js` | `successResponse`, `errorResponse`, `paginatedResponse` |
| `studyMaterialService.test.js` | `createMaterial`, `getAllMaterials`, `getMaterialById`, `updateMaterial`, `deleteMaterial`, `incrementMetric`, `toggleLike` |
| `authMiddleware.test.js` | `protect`, `authorizePermissions` |

Each function is tested with:
- ✅ **Success case** — normal expected input
- ❌ **Error case** — invalid input / unauthorized access
- 🔲 **Edge case** — boundary values, empty inputs, toggle behavior

### Run unit tests:

```bash
npm run test:unit
```

### Expected output:
```
PASS tests/unit/validationUtils.test.js
PASS tests/unit/responseHandler.test.js
PASS tests/unit/studyMaterialService.test.js
PASS tests/unit/authMiddleware.test.js

Tests: 55 passed, 4 suites
Time: ~2s
```

---

## 🔗 PART 2 — Integration Tests

Integration tests make **real HTTP requests** against a real Express app connected to an **in-memory MongoDB** database (no production data touched).

### What's tested (27 test cases):

| Endpoint | Method | Test Cases |
|---|---|---|
| `/api/materials` | `POST` | ✅ tutor creates, ✅ admin creates, ❌ user blocked (403), ❌ no token (401), ❌ missing title (400), 🔲 duplicate (400) |
| `/api/materials` | `GET` | ✅ list + pagination, ✅ filter by subject, ✅ page+limit, ❌ unauthenticated (401) |
| `/api/materials/my` | `GET` | ✅ own materials only, ❌ user blocked (403) |
| `/api/materials/:id` | `GET` | ✅ view + count increment, ❌ not found (404), ❌ invalid ID (400) |
| `/api/materials/:id` | `PATCH` | ✅ owner update, ✅ admin update, ❌ non-owner (403), ❌ invalid title (400) |
| `/api/materials/:id` | `DELETE` | ✅ owner delete, ✅ admin delete, ❌ non-owner (403), ❌ not found (404) |
| `/api/materials/:id/like` | `POST` | ✅ like, 🔲 toggle unlike |
| `/api/materials/:id/download` | `POST` | ✅ increments count, ❌ invalid ID (400) |

### Run integration tests:

```bash
npm run test:integration
```

### Expected output:
```
PASS tests/integration/studyMaterial.test.js
  POST /api/materials
    ✓ 201: tutor can create a new study material
    ✓ 201: admin can create a new study material
    ✓ 403: regular user cannot upload a study material
    ✓ 401: request without token is rejected
    ✓ 400: returns error when title is missing
    ✓ 400: cannot create duplicate title + subject combination
  GET /api/materials
    ✓ 200: returns list of materials with pagination metadata
    ...
Tests: 27 passed
Time: ~4s
```

---

## 🚀 PART 3 — Performance Tests

Artillery simulates **100 concurrent users** hitting the Study Material API.

### 3 Test Phases:

| Phase | Users | Duration | Purpose |
|---|---|---|---|
| Warm-up | 5 → 10 | 30s | Gradual ramp-up |
| Sustained Load | 50 | 60s | Normal production load |
| Peak Spike | 50 → 100 | 30s | Maximum concurrent stress |

### Traffic distribution:
- 40% → `GET /api/materials` (list all)
- 20% → `GET /api/materials?subject=mathematics` (filtered)
- 20% → `GET /api/materials/:id` (single material)
- 15% → Download + Like engagement flow
- 5% → Health check

### Step 1 — Generate a JWT token for performance tests:

```bash
npm run test:perf:token
```

Copy the token output and paste it into `tests/performance/study-material-load-test.yml`:

```yaml
variables:
  authToken: "PASTE_YOUR_TOKEN_HERE"
```

### Step 2 — Start the backend server:

```bash
npm run dev
```

### Step 3 — Run the performance test:

```bash
npm run test:perf
```

### Step 4 — Generate HTML report:

```bash
npm run test:perf:report
# Opens: tests/performance/report.html
```

### Expected performance output:
```
All VUs finished. Total time: 2 minutes, 1 second

Summary report @ [timestamp]
  Scenarios launched:  5,840
  Scenarios completed: 5,840
  Requests completed:  8,760
  Mean response/sec:   72.67

Response time (msec):
  min: .......: 4
  max: .......: 312
  median: ....: 48
  95th percentile: 95
  99th percentile: 187

Codes:
  200: 8,760
```

### How to interpret results:
| Metric | Good | Acceptable | Poor |
|---|---|---|---|
| Response p95 | < 500ms | < 1000ms | > 2000ms |
| Success rate | > 99% | > 95% | < 90% |
| Error rate | 0% | < 1% | > 5% |

---

## 📊 PART 4 — Code Coverage Report

```bash
npm run test:coverage
```

Coverage report saved to: `tests/coverage/index.html`

### Target coverage:
| File | Statements | Branches | Functions |
|---|---|---|---|
| `studyMaterialService.js` | > 90% | > 85% | 100% |
| `studyMaterialController.js` | > 85% | > 80% | 100% |
| `authMiddleware.js` | > 90% | > 85% | 100% |
| `validationUtils.js` | 100% | 100% | 100% |
| `responseHandler.js` | 100% | 100% | 100% |

---

## ⚡ Quick Reference — All Commands

```bash
# Run all tests (unit + integration)
npm test

# Unit tests only (fast, ~2s)
npm run test:unit

# Integration tests only (~4s)
npm run test:integration

# Coverage report
npm run test:coverage

# Generate performance test JWT
npm run test:perf:token

# Run performance test (backend must be running)
npm run test:perf

# Run performance test + HTML report
npm run test:perf:report
```

---

## 📋 Viva Demonstration Script

1. **Show folder structure**: `tree tests/`
2. **Run unit tests**: `npm run test:unit` — show 55 tests passing
3. **Run integration tests**: `npm run test:integration` — show 27 tests passing
4. **Show coverage**: `npm run test:coverage` — open `tests/coverage/index.html`
5. **Performance demo**:
   - Start server: `npm run dev`
   - Generate token: `npm run test:perf:token`
   - Run load test: `npm run test:perf`
   - Show HTML report: `npm run test:perf:report`

---

*Testing Module by Pramodya | SE3040 AF Assignment | Quality Education Platform*
