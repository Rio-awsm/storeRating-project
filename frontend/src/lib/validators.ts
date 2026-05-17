export function validateName(v: string): string | null {
  if (v.length < 20) return "Name must be at least 20 characters";
  if (v.length > 60) return "Name must be at most 60 characters";
  return null;
}

export function validateAddress(v: string): string | null {
  if (v.length > 400) return "Address must be at most 400 characters";
  return null;
}

export function validateEmail(v: string): string | null {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(v)) return "Invalid email";
  return null;
}

export function validatePassword(v: string): string | null {
  if (v.length < 8) return "Password must be at least 8 characters";
  if (v.length > 16) return "Password must be at most 16 characters";
  if (!/[A-Z]/.test(v)) return "Password must include an uppercase letter";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(v))
    return "Password must include a special character";
  return null;
}
