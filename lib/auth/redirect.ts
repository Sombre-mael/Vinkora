const DEFAULT_AUTH_REDIRECT = '/dashboard'

export function safeAuthRedirect(value: unknown) {
  if (typeof value !== 'string') {
    return DEFAULT_AUTH_REDIRECT
  }

  const candidate = value.trim()

  if (
    !candidate ||
    !candidate.startsWith('/') ||
    candidate.startsWith('//') ||
    candidate.includes('\\') ||
    candidate.startsWith('/login')
  ) {
    return DEFAULT_AUTH_REDIRECT
  }

  return candidate
}

export function withAuthRedirect(path: string, returnTo: string) {
  if (returnTo === DEFAULT_AUTH_REDIRECT) {
    return path
  }

  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}next=${encodeURIComponent(returnTo)}`
}
