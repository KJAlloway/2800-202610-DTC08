import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export async function hashPassword(plainTextPassword) {
    return bcrypt.hash(plainTextPassword, SALT_ROUNDS);
}

export async function verifyPassword(plainTextPassword, storedHash) {
    return bcrypt.compare(plainTextPassword, storedHash);
}