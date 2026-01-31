# Expense Splitter API – Integration Guide

## Base URL

Same-origin: `/api` (e.g. `https://yoursite.com/api`)

**CORS**: For same-origin web app, no CORS headers needed. If calling from another domain, add `Access-Control-Allow-Origin` in middleware or route handlers.

---

## Authentication

All endpoints require an authenticated user (Supabase Auth). Pass session via cookies (automatic with `credentials: 'include'`).

```ts
const res = await fetch('/api/groups', {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
});
```

---

## Endpoints

### GET /api/groups

List groups for the current user.

**Response 200:**
```json
{
  "groups": [
    {
      "id": "uuid",
      "name": "Trip to Dubai",
      "currency": "AED",
      "created_at": "2025-01-31T12:00:00Z"
    }
  ]
}
```

**Response 401:** `{ "error": "Sign in required", "code": "UNAUTHENTICATED" }`

---

### POST /api/groups

Create a group and members.

**Request:**
```json
{
  "name": "Trip to Dubai",
  "currency": "AED",
  "members": ["Ali", "Noura", "Tina"]
}
```

| Field    | Rules                        |
|----------|------------------------------|
| name     | 2–50 chars                   |
| currency | 3–5 chars (e.g. USD, AED)    |
| members  | 2–20 unique trimmed names    |

**Response 201:** `{ "id": "group-uuid" }`

**Response 400:** `{ "error": "Message", "code": "VALIDATION" }`

---

### GET /api/groups/:id

Get group bundle (group, members, expenses, settlements).

**Response 200:**
```json
{
  "group": {
    "id": "uuid",
    "name": "Trip to Dubai",
    "currency": "AED",
    "last_settled_at": null,
    "created_at": "2025-01-31T12:00:00Z"
  },
  "members": [
    { "id": "uuid", "group_id": "uuid", "name": "Ali", "created_at": "..." }
  ],
  "expenses": [
    {
      "id": "uuid",
      "group_id": "uuid",
      "amount": 100,
      "paid_by_member_id": "uuid",
      "title": "Dinner",
      "notes": null,
      "expense_date": "2025-01-31",
      "created_at": "..."
    }
  ],
  "settlements": [
    {
      "id": "uuid",
      "settled_at": "2025-01-31T14:00:00Z",
      "short_summary_text": "Noura pays Ali 50 AED"
    }
  ]
}
```

**Response 404:** `{ "error": "Group not found", "code": "NOT_FOUND" }`

---

### POST /api/groups/:id/expenses

Add an expense.

**Request:**
```json
{
  "amount": 150.50,
  "paid_by_member_id": "member-uuid",
  "title": "Dinner",
  "notes": "Restaurant X",
  "expense_date": "2025-01-31"
}
```

| Field             | Rules                                      |
|-------------------|--------------------------------------------|
| amount            | > 0                                        |
| paid_by_member_id | UUID of a member in the group              |
| title             | Optional, ≤ 80 chars                       |
| notes             | Optional, ≤ 240 chars                      |
| expense_date      | Optional, YYYY-MM-DD, default today        |

**Response 201:** `{ "id": "expense-uuid" }`

**Response 400:** `{ "error": "paid_by_member_id must belong to the group", "code": "VALIDATION" }`

---

### POST /api/groups/:id/settle

Mark the current period as settled. Computes summaries server-side and creates a settlement record.

**Request:** No body required.

**Response 200:** `{ "settled_at": "2025-01-31T15:00:00Z" }`

---

## Error Handling

All errors return JSON:

```ts
type ApiError = {
  error: string;
  code?: "VALIDATION" | "UNAUTHENTICATED" | "UNAUTHORIZED" | "NOT_FOUND" | "INTERNAL";
};
```

**Client pattern:**

```ts
async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...options });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as ApiError).error ?? `HTTP ${res.status}`);
  }
  return data as T;
}

// Usage
const groups = await api<GroupsResponse>('/api/groups');
const group = await api<GroupResponse>(`/api/groups/${id}`);
await api<CreateGroupResponse>('/api/groups', {
  method: 'POST',
  body: JSON.stringify({ name: 'Trip', currency: 'USD', members: ['A', 'B'] }),
});
```

---

## Rate Limiting

- POST `/api/groups`, `/api/groups/:id/expenses`, `/api/groups/:id/settle` are rate limited.
- 30 requests per minute per IP (in-memory; use Redis/Upstash for production).
- 429 response: `{ "error": "Too many requests", "retryAfter": 45 }` with `Retry-After` header.

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Use anon key for API routes (RLS enforces access). Do not expose service role key to the client.
