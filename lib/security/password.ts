export function validatePassword(password: string) {
  if (password.length < 8 || password.length > 128) {
    return "Password must be between 8 and 128 characters.";
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Password must include at least one letter and one number.";
  }
  return null;
}
