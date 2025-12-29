# Cookie Authentication Issue - Cross-Origin Setup

## System Architecture

### Deployment
- **Platform**: Google Cloud Run
- **Frontend**: `https://ticket-ace-frontend-w2yvjfitdq-uc.a.run.app`
  - React/Vite SPA
  - Nginx reverse proxy in container
- **Backend**: `https://ticket-ace-backend-w2yvjfitdq-uc.a.run.app`
  - Node.js/Express API
  - Separate Cloud Run service

### Current Setup
- Frontend and backend are on **different domains** (separate Cloud Run services)
- Frontend uses **axios** with `withCredentials: true`
- Backend uses **httpOnly cookies** for JWT tokens (`accessToken` and `refreshToken`)
- Both services use **HTTPS** (Cloud Run requirement)

## What's Working ✅

1. **CORS is configured correctly** on backend:
   - `credentials: true`
   - Origin whitelist includes frontend URL
   - Proper headers: `allowedHeaders: ["Content-Type", "Authorization", "Cookie"]`
   - `exposedHeaders: ["Set-Cookie"]`

2. **Login endpoint works**:
   - Returns 200 OK
   - Sets cookies in response headers:
     ```
     Set-Cookie: accessToken=<jwt>; Max-Age=3600; Path=/; HttpOnly; Secure; SameSite=None
     Set-Cookie: refreshToken=<jwt>; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=None
     ```
   - No Domain attribute (defaults to response origin)

3. **Cookies are stored in browser**:
   - Visible in DevTools → Application → Cookies
   - Stored under domain: `ticket-ace-backend-w2yvjfitdq-uc.a.run.app`
   - Both `accessToken` and `refreshToken` present

4. **Some API routes work**:
   - `/api/servicio-cliente` endpoints work fine
   - These routes don't require authentication middleware

5. **Requests reach the backend**:
   - Network tab shows requests going to `ticket-ace-backend-w2yvjfitdq-uc.a.run.app`
   - Backend middleware is being hit (confirmed by logs)

## What's NOT Working ❌

1. **Authenticated routes fail with 401**:
   - `/api/notifications` returns 401
   - Error: "Token de acceso no proporcionado"

2. **Cookies not being sent with requests**:
   - Backend middleware logs show: `Cookies received: []` (empty)
   - `req.cookies.accessToken` is undefined
   - Cookie header is missing or doesn't include auth cookies

3. **Only Chatwoot cookies are sent**:
   - `document.cookie` shows `cw_d_session_info` (Chatwoot session)
   - Auth cookies (`accessToken`, `refreshToken`) are NOT in `document.cookie`
   - This is expected for httpOnly cookies, but they should still be sent by browser

## Backend Code

### Cookie Settings (jwt.service.ts)
```typescript
static setTokenCookies(res: Response, accessToken: string, refreshToken: string): void {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // true in production
        sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
        path: "/",
    };

    res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 1000, // 60 minutes
    });

    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
}
```

### CORS Configuration (index.ts)
```typescript
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173", 
  "http://127.0.0.1:8080",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "https://ticket-ace-frontend-w2yvjfitdq-uc.a.run.app"
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, origin);
    if (allowedOrigins.includes(origin)) {
      return callback(null, origin); // Echo origin back
    }
    console.warn("❌ CORS blocked:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(cookieParser());
```

### Auth Middleware (auth.middleware.ts)
```typescript
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            console.log("❌ Token de acceso no proporcionado");
            console.log("   Cookies received:", Object.keys(req.cookies));
            console.log("   Origin:", req.headers.origin);
            console.log("   Cookie header:", req.headers.cookie);
            res.status(401).json({
                success: false,
                message: "Token de acceso no proporcionado",
            });
            return;
        }
        // ... rest of validation
    }
}
```

## Frontend Code

### Axios Client (client.ts)
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with every request
});
```

### Environment Variable (cloudbuild.yaml)
```yaml
echo "https://ticket-ace-backend-w2yvjfitdq-uc.a.run.app" > /workspace/VITE_API_URL.txt
```
This makes frontend call backend directly (not through nginx proxy).

### Nginx Configuration (nginx.conf)
Recently added backend API proxy:
```nginx
location ~ ^/(auth|api/notifications|api/cea|api/email|api/servicio-cliente|api/chatwoot) {
    set $backend "https://ticket-ace-backend-w2yvjfitdq-uc.a.run.app";
    proxy_pass $backend$request_uri;
    proxy_ssl_server_name on;
    proxy_set_header Host ticket-ace-backend-w2yvjfitdq-uc.a.run.app;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Pass cookies to backend
    proxy_pass_request_headers on;
    proxy_set_header Cookie $http_cookie;
    
    # Allow backend to set cookies on frontend domain
    proxy_cookie_domain ticket-ace-backend-w2yvjfitdq-uc.a.run.app $host;
    proxy_cookie_path / /;
}
```

**NOTE**: This proxy is NOT being used because `VITE_API_URL` points directly to backend.

## Network Request Details

### Login Request (Working)
**Request Headers:**
```
:authority: ticket-ace-backend-w2yvjfitdq-uc.a.run.app
:method: POST
:path: /auth/login
origin: https://ticket-ace-frontend-w2yvjfitdq-uc.a.run.app
content-type: application/json
sec-fetch-mode: cors
sec-fetch-site: cross-site
```

**Response Headers:**
```
access-control-allow-credentials: true
access-control-allow-origin: https://ticket-ace-frontend-w2yvjfitdq-uc.a.run.app
access-control-expose-headers: Set-Cookie
set-cookie: accessToken=<jwt>; Max-Age=3600; Path=/; HttpOnly; Secure; SameSite=None
set-cookie: refreshToken=<jwt>; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=None
```

### Notifications Request (Failing)
**Request Headers:**
```
:authority: ticket-ace-backend-w2yvjfitdq-uc.a.run.app
:method: GET
:path: /api/notifications
origin: https://ticket-ace-frontend-w2yvjfitdq-uc.a.run.app
sec-fetch-mode: cors
sec-fetch-site: cross-site
```

**Missing:** `Cookie:` header with `accessToken=...`

**Response:**
```
Status: 401 Unauthorized
{
  "success": false,
  "message": "Token de acceso no proporcionado"
}
```

## Key Observations

1. **Cookies are set correctly** with all required attributes for cross-origin:
   - `HttpOnly` ✅
   - `Secure` ✅
   - `SameSite=None` ✅
   - `Path=/` ✅

2. **Cookies are stored** in browser under backend domain ✅

3. **Requests are cross-site** (`sec-fetch-site: cross-site`) ✅

4. **CORS headers are correct** in responses ✅

5. **But cookies are NOT being sent** with subsequent requests ❌

6. **Servicio-cliente routes work** (these don't require auth cookies) ✅

7. **Requests go directly to backend**, not through nginx proxy

## Questions

1. **Why aren't cookies being sent?**
   - Browser should send `SameSite=None; Secure` cookies in cross-site requests with `credentials: include`
   - All requirements appear to be met

2. **Is the direct backend call the issue?**
   - Should we use nginx proxy instead?
   - Would same-origin requests (through proxy) solve this?

3. **Browser cookie policy?**
   - Could browser be blocking third-party cookies despite `SameSite=None`?
   - Chrome/Edge have specific policies for cross-site cookies

4. **Domain mismatch?**
   - Cookies stored for `ticket-ace-backend-w2yvjfitdq-uc.a.run.app`
   - Requests going to same domain
   - Should work, but doesn't?

5. **Why does servicio-cliente work?**
   - Same cross-origin setup
   - No auth required
   - Is this just because it doesn't check cookies?

## Attempted Solutions

1. ✅ Fixed `sameSite: "strict"` → `"none"` in production
2. ✅ Added `path: "/"` to all cookies
3. ✅ Removed wildcard `"*"` from CORS origins
4. ✅ Added nginx proxy for backend routes
5. ✅ Added `proxy_cookie_domain` to rewrite cookie domains
6. ❌ Cookies still not being sent with requests

## Environment

- **NODE_ENV**: `production` (set in Dockerfile and cloudbuild.yaml)
- **Browser**: Microsoft Edge 143 (Chromium-based)
- **Cloud Run**: Both services on HTTPS with valid certificates
- **Cookie storage**: Confirmed in DevTools under backend domain

## Need Help With

**Primary question**: Why are cookies with `SameSite=None; Secure` not being sent in cross-origin requests from frontend to backend when all CORS and cookie requirements appear to be met?

**Secondary question**: Should we switch to using the nginx proxy (relative URLs) instead of direct backend calls? Would this solve the issue by making requests same-origin?

