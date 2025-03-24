import { users, type User, type InsertUser } from "@shared/schema";
import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

// CSV file setup for user registration data
const CSV_FILE_PATH = path.join(process.cwd(), 'user_registrations.csv');
const csvWriter = createObjectCsvWriter({
  path: CSV_FILE_PATH,
  header: [
    { id: 'id', title: 'ID' },
    { id: 'firstName', title: 'First Name' },
    { id: 'lastName', title: 'Last Name' },
    { id: 'email', title: 'Email' },
    { id: 'createdAt', title: 'Registered At' }
  ],
  append: fs.existsSync(CSV_FILE_PATH) // Append to file if it exists
});

// Initialize the file with headers if it doesn't exist
if (!fs.existsSync(CSV_FILE_PATH)) {
  csvWriter.writeRecords([]);
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now
    };
    
    this.users.set(id, user);
    
    // Write to CSV file
    await csvWriter.writeRecords([{
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: now.toISOString()
    }]);
    
    return user;
  }
}

export const storage = new MemStorage();
