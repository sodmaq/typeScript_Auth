import jwt from 'jsonwebtoken';
import { load } from "ts-dotenv";

const env = load({
  JWT_SECRET: String
});

const generateRefreshToken = (id: string): string => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: '3d' });
};

export { generateRefreshToken };
