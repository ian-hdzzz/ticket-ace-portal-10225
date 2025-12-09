/*This file creates a single PrismaClient instance
to avoid duplicate connections
and ensure efficient database access across the application.
Singleton pattern*/

import { PrismaClient } from "@prisma/client";

// Extend globalThis to store the PrismaClient instance in development
const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

// Import and apply encryption middleware
// import { prismaEncryptionExtension } from "../middleware/prismaEncryption.middleware";

// Define encryption configuration
// Example: { users: ['phone_number', 'password'] } 
// Note: Passwords should be hashed, not just encrypted. This is just an example.
// const encryptionConfig = {
//   // Add models and fields here, e.g.:
//   notes: ['content', 'general_notes', 'ailments', 'prescription'],
//   results: ['interpretation', 'path', 'recommendation'],
//   options: ['description'],
//   patient_history: ['answer'],
//   questions_history: ['description'],
// };

// // Define relation configuration for recursive decryption
// // Map: Model -> Field -> Target Model
// const relationConfig = {
//   patient_analysis: { results: 'results' },
//   patient_history: { question: 'questions_history' },
// };

// Create or reuse the PrismaClient instance (singleton pattern)
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// In development, store the instance globally to prevent hot-reload issues
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;