// This file must be imported FIRST to ensure environment variables are loaded
// before any other modules that depend on them
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });
