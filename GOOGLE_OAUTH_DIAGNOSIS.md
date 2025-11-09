# Google OAuth Issues - Diagnosis & Fixes

## 🚨 Problems Found

### 1. **OAuth Callback URL Mismatch** (CRITICAL)
- **SocialLogin.tsx**: Uses `window.location.origin` (client-side)
- **Auth callback**: Expects `/api/auth/callback` 
- **Issue**: If user is on `vercel.app` domain but origin detection fails, callback URL may be malformed
- **Impact**: OAuth redirect fails to return to correct URL

### 2. **Missing Error Handling**
- SocialLogin component catches errors but only shows generic alert
- No console logging to debug issues
- User sees: "Unable to start Google sign-in" (not helpful)

### 3. **No Session Verification After OAuth**
- OAuth callback exchanges code for session but doesn't verify session was set
- User redirects to `/chat-exact` but session may not be in cookies
- Results in 401 errors and kicked back to login

### 4. **Query Params Not Passed**
- `queryParams: { prompt: 'select_account' }` might not be passed correctly
- Supabase SDK may not support this parameter in this version

### 5. **No Redirect After Session Set**
- `exchangeCodeForSession` returns session but doesn't set it
- Need explicit `setSession()` call like with magic link

---

## ✅ Fixes to Apply

### Fix 1: Standardize Origin Handling
**File**: `src/components/auth/SocialLogin.tsx`
- Use `process.env.NEXT_PUBLIC_APP_URL` as fallback
- Remove `window.location.origin` dependency
- Match what magic-link endpoint does

### Fix 2: Add Detailed Error Logging
**File**: `src/components/auth/SocialLogin.tsx`
- Log origin, provider, redirect URL
- Help users debug what's happening

### Fix 3: Ensure Session is Set in OAuth Callback
**File**: `src/app/api/auth/callback/route.ts`
- Add explicit `setSession()` after `exchangeCodeForSession()`
- Verify session cookie is set before redirect

### Fix 4: Add Health Check for OAuth
**File**: `src/app/api/health/oauth` (new endpoint)
- Check if Supabase OAuth provider is configured
- Verify redirect URL is correct
- Help diagnose OAuth setup issues

### Fix 5: Better Error Responses
**File**: `src/app/api/auth/callback/route.ts`
- Return detailed error reasons instead of generic messages
- Help users understand what went wrong

---

## Implementation Priority
1. **HIGH**: Fix session not being set in OAuth callback
2. **HIGH**: Standardize origin handling  
3. **MEDIUM**: Add detailed error logging
4. **MEDIUM**: Add OAuth health check endpoint
5. **LOW**: Improve error messages

---

## Testing Steps After Fixes
1. Try Google OAuth on production URL
2. Check browser cookies after redirect
3. Verify session exists before redirect to /chat-exact
4. Test with different domains (localhost, vercel preview, production)
5. Check /api/health/oauth endpoint
