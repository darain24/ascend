const ACCOUNTS_KEY = "ascend.local-accounts.v1";
const SESSION_KEY = "ascend.local-session.v1";
const LEGACY_CREDENTIALS_KEY = "ascend.local-password";
const HASH_ITERATIONS = 120_000;

export type LocalAccount = {
  name: string;
  email: string;
  salt: string;
  hash: string;
  createdAt: string;
  updatedAt: string;
};

type LocalSession = {
  email: string;
  signedInAt: string;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validatePassword(password: string) {
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Use at least 8 characters with a letter and a number.";
  }
  return null;
}

function getAccounts(): Record<string, LocalAccount> {
  const stored = localStorage.getItem(ACCOUNTS_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored) as Record<string, LocalAccount>;
  } catch {
    return {};
  }
}

function saveAccounts(accounts: Record<string, LocalAccount>) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = window.atob(value);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function derivePasswordHash(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
) {
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: HASH_ITERATIONS,
    },
    passwordKey,
    256,
  );
  return bytesToBase64(new Uint8Array(bits));
}

function setSession(email: string) {
  const session: LocalSession = {
    email,
    signedInAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function hasLocalAccount(email: string) {
  return Boolean(getAccounts()[normalizeEmail(email)]);
}

export async function createLocalAccount(input: {
  name: string;
  email: string;
  password: string;
}) {
  const email = normalizeEmail(input.email);
  const accounts = getAccounts();
  if (accounts[email]) {
    throw new Error("An account with this email already exists on this browser.");
  }

  const passwordError = validatePassword(input.password);
  if (passwordError) throw new Error(passwordError);

  const salt = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(16)));
  const now = new Date().toISOString();
  const account: LocalAccount = {
    name: input.name.trim(),
    email,
    salt: bytesToBase64(salt),
    hash: await derivePasswordHash(input.password, salt),
    createdAt: now,
    updatedAt: now,
  };
  accounts[email] = account;
  saveAccounts(accounts);
  setSession(email);
  return account;
}

export async function signInLocalAccount(emailValue: string, password: string) {
  const email = normalizeEmail(emailValue);
  const account = getAccounts()[email];
  if (!account) {
    throw new Error("No account was found for this email on this browser.");
  }
  const hash = await derivePasswordHash(password, base64ToBytes(account.salt));
  if (hash !== account.hash) {
    throw new Error("The email or password is incorrect.");
  }
  setSession(email);
  return account;
}

export async function changeLocalPassword(
  emailValue: string,
  currentPassword: string,
  newPassword: string,
) {
  const email = normalizeEmail(emailValue);
  const accounts = getAccounts();
  const account = accounts[email];
  if (!account) {
    throw new Error("Create an account first before changing its password.");
  }
  const currentHash = await derivePasswordHash(
    currentPassword,
    base64ToBytes(account.salt),
  );
  if (currentHash !== account.hash) {
    throw new Error("The current password is incorrect.");
  }
  const passwordError = validatePassword(newPassword);
  if (passwordError) throw new Error(passwordError);

  const salt = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(16)));
  accounts[email] = {
    ...account,
    salt: bytesToBase64(salt),
    hash: await derivePasswordHash(newPassword, salt),
    updatedAt: new Date().toISOString(),
  };
  saveAccounts(accounts);
}

export async function resetLocalPassword(emailValue: string, newPassword: string) {
  const email = normalizeEmail(emailValue);
  const accounts = getAccounts();
  const account = accounts[email];
  if (!account) {
    throw new Error("No account was found for this email on this browser.");
  }
  const passwordError = validatePassword(newPassword);
  if (passwordError) throw new Error(passwordError);

  const salt = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(16)));
  accounts[email] = {
    ...account,
    salt: bytesToBase64(salt),
    hash: await derivePasswordHash(newPassword, salt),
    updatedAt: new Date().toISOString(),
  };
  saveAccounts(accounts);
}

export async function createPasswordForProfile(
  name: string,
  emailValue: string,
  password: string,
) {
  const legacy = localStorage.getItem(LEGACY_CREDENTIALS_KEY);
  const email = normalizeEmail(emailValue);
  const accounts = getAccounts();
  if (accounts[email]) {
    throw new Error("This profile already has a password.");
  }

  const passwordError = validatePassword(password);
  if (passwordError) throw new Error(passwordError);
  const salt = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(16)));
  const now = new Date().toISOString();
  accounts[email] = {
    name: name.trim(),
    email,
    salt: bytesToBase64(salt),
    hash: await derivePasswordHash(password, salt),
    createdAt: now,
    updatedAt: now,
  };
  saveAccounts(accounts);
  setSession(email);
  if (legacy) localStorage.removeItem(LEGACY_CREDENTIALS_KEY);
}

export function updateLocalAccountProfile(
  oldEmailValue: string,
  nextEmailValue: string,
  name: string,
) {
  const oldEmail = normalizeEmail(oldEmailValue);
  const nextEmail = normalizeEmail(nextEmailValue);
  const accounts = getAccounts();
  const account = accounts[oldEmail];
  if (!account) return;
  if (oldEmail !== nextEmail && accounts[nextEmail]) {
    throw new Error("That email is already used by another local account.");
  }
  delete accounts[oldEmail];
  accounts[nextEmail] = {
    ...account,
    name: name.trim(),
    email: nextEmail,
    updatedAt: new Date().toISOString(),
  };
  saveAccounts(accounts);
  setSession(nextEmail);
}

export function signOutLocalAccount() {
  localStorage.removeItem(SESSION_KEY);
}
