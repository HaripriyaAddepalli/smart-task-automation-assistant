# Auth Fix TODO (Frontend)

- [x] Update `src/firebase.ts` to ensure clean v9+ exports (auth + GoogleAuthProvider).
- [x] Create minimal auth utilities (localStorage helpers + typed user shape).
- [x] Rewrite `src/pages/Login.tsx` as a working React component:
  - [ ] Google sign-in with popup
  - [ ] Firebase email/password login
  - [ ] Store minimal user in localStorage
  - [ ] Redirect to `/`
  - [ ] Call backend `POST /api/auth/google` after Google auth success
  - [ ] Friendly handling for unauthorized-domain and popup-blocked
- [x] Fix `src/pages/Signup.tsx` to use Firebase email/password signup.
- [x] Add routing + route protection:
  - [x] Update `src/App.tsx` to use `react-router-dom`
  - [x] Protect dashboard route
  - [x] Redirect unauthenticated users to `/login`
- [x] Verify TypeScript builds with no TS/React hook issues.
- [ ] Verify runtime:
  - [ ] Google popup works
  - [ ] Login/signup works
  - [ ] Refresh keeps session

