// Sesi dummy (MVP): cookie flag yang diperiksa middleware. Diganti Supabase Auth pada M9.
export const SESSION_COOKIE = "subsidi_session"

export function loginDummy() {
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}`
}

export function logoutDummy() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`
}
