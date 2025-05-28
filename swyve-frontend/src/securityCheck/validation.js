import zxcvbn from "zxcvbn";

export function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

export function passwordRules(password) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

export function passwordStrength(password) {
  return zxcvbn(password).score; 
}
