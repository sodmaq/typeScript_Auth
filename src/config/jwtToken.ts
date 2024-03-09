import jwt from 'jsonwebtoken';
import { load } from "ts-dotenv";

const env = load({
  JWT_SECRET: String
});

const generateToken = (id: string): string => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: '1d' });
};

export { generateToken };
