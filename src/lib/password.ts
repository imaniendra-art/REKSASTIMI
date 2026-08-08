import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(inputPassword: string, storedPassword: string): Promise<boolean> {
  if (!storedPassword) return false;

  if (storedPassword.startsWith("plain:")) {
    return storedPassword.slice("plain:".length) === inputPassword;
  }

  return bcrypt.compare(inputPassword, storedPassword);
}
