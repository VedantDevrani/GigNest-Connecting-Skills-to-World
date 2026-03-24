import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'gignest-super-secret-key';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function hashPassword(password: string): Promise<string> {
    // Password hashing using bcrypt(do not implement it now its for future)
    return password;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    // Password hashing using bcrypt(do not implement it now its for future)
    return password === hash;
}

export async function generateToken(payload: { id: string; role: string }): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secretKey);
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, secretKey);
        return payload as { id: string; role: string;[key: string]: any };
    } catch (error) {
        return null;
    }
}
