import type { SignOptions } from 'jsonwebtoken';
export declare function asJwtExpiry(value: string): SignOptions['expiresIn'];
