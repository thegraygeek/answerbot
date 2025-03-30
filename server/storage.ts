import { users, type User, type InsertUser } from "@shared/schema";
import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { parse } from 'csv-parse/sync';

// Constants for file paths
const CSV_FILE_PATH = path.join(process.cwd(), 'user_registrations.csv');
const USERS_JSON_PATH = path.join(process.cwd(), 'users.json');

// CSV writer setup for user registration data
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

// Initialize the CSV file with headers if it doesn't exist
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
    
    // Load existing users from previous sessions
    this.loadExistingUsers();
  }

  // Load users from both CSV and JSON files for persistence
  private loadExistingUsers() {
    try {
      // First try to load from JSON as it's more reliable for complex objects
      if (fs.existsSync(USERS_JSON_PATH)) {
        const usersData = JSON.parse(fs.readFileSync(USERS_JSON_PATH, 'utf8'));
        
        // Convert array to Map and find highest ID
        usersData.forEach((user: User) => {
          this.users.set(user.id, {
            ...user,
            // Ensure date is a Date object
            createdAt: new Date(user.createdAt)
          });
          
          if (user.id >= this.currentId) {
            this.currentId = user.id + 1;
          }
        });
        
        console.log(`Loaded ${this.users.size} users from JSON storage`);
      }
      // If JSON doesn't exist, try CSV as fallback
      else if (fs.existsSync(CSV_FILE_PATH)) {
        const content = fs.readFileSync(CSV_FILE_PATH, 'utf8');
        
        // Skip if file only has headers
        if (content.trim().split('\n').length > 1) {
          const records = parse(content, {
            columns: true,
            skip_empty_lines: true
          });
          
          records.forEach((record: any) => {
            const id = parseInt(record.ID, 10);
            const user: User = {
              id,
              firstName: record['First Name'],
              lastName: record['Last Name'],
              email: record.Email,
              createdAt: new Date(record['Registered At'])
            };
            
            this.users.set(id, user);
            
            if (id >= this.currentId) {
              this.currentId = id + 1;
            }
          });
          
          console.log(`Loaded ${this.users.size} users from CSV storage`);
          
          // Save to JSON for future use
          this.saveUsersToJson();
        }
      }
    } catch (error) {
      console.error('Error loading existing users:', error);
    }
  }

  // Save users to JSON file for persistence
  private saveUsersToJson() {
    try {
      const usersArray = Array.from(this.users.values());
      const tempPath = `${USERS_JSON_PATH}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(usersArray, null, 2));
      fs.renameSync(tempPath, USERS_JSON_PATH);
    } catch (error) {
      console.error('Error saving users to JSON:', error);
      throw new Error(`Failed to save users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(), // Case-insensitive email comparison
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
    
    // Write to CSV file for compatibility
    await csvWriter.writeRecords([{
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: now.toISOString()
    }]);
    
    // Save to JSON for reliable persistence
    this.saveUsersToJson();
    
    return user;
  }
}

// Create and export a singleton instance of MemStorage
export const storage = new MemStorage();
