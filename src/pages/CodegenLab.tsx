import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Code2, Play, Download, Eye, FileText, Folder } from "lucide-react";

const CodegenLab = () => {
  const [prompt, setPrompt] = useState("");
  const [projectName, setProjectName] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("");

  const generatedFiles = [
    { name: "App.tsx", type: "React Component", size: "2.4KB", language: "typescript" },
    { name: "UserService.ts", type: "Service", size: "1.8KB", language: "typescript" },
    { name: "api.routes.ts", type: "Routes", size: "3.2KB", language: "typescript" },
    { name: "User.model.ts", type: "Model", size: "0.9KB", language: "typescript" },
    { name: "database.sql", type: "Schema", size: "1.1KB", language: "sql" },
  ];

  const codePreview = `import React, { useState, useEffect } from 'react';
import { UserService } from '../services/UserService';
import { User } from '../models/User';

interface UserListProps {
  onUserSelect?: (user: User) => void;
}

export const UserList: React.FC<UserListProps> = ({ onUserSelect }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await UserService.getAllUsers();
        setUsers(userData);
      } catch (err) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="user-list">
      {users.map(user => (
        <div 
          key={user.id} 
          className="user-item"
          onClick={() => onUserSelect?.(user)}
        >
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
};`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Codegen Lab</h1>
          <p className="text-muted-foreground">Generate complete projects and multi-file codebases</p>
        </div>
        <Badge variant="outline">
          <Code2 className="h-4 w-4 mr-2" />
          AI-Generated
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Configuration</CardTitle>
            <CardDescription>Define your project requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Project Name</label>
              <Input
                placeholder="my-awesome-app"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Framework</label>
              <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="react-ts">React + TypeScript</SelectItem>
                  <SelectItem value="vue-ts">Vue + TypeScript</SelectItem>
                  <SelectItem value="express-ts">Express + TypeScript</SelectItem>
                  <SelectItem value="fastapi">FastAPI + Python</SelectItem>
                  <SelectItem value="nextjs">Next.js</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Project Description</label>
              <Textarea
                placeholder="Build a user management system with authentication, CRUD operations, and a dashboard..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-32"
              />
            </div>
            
            <Button className="w-full" disabled={!prompt || !selectedFramework}>
              <Play className="h-4 w-4 mr-2" />
              Generate Project
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              Estimated generation time: 2-5 minutes
            </div>
          </CardContent>
        </Card>

        {/* Generated Files */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Folder className="h-5 w-5" />
                <span>Generated Files</span>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-2">
                {generatedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-xs">{file.language}</Badge>
                      <span className="text-xs text-muted-foreground">{file.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Code Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code2 className="h-5 w-5" />
            <span>Code Preview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="app" className="space-y-4">
            <TabsList>
              <TabsTrigger value="app">App.tsx</TabsTrigger>
              <TabsTrigger value="service">UserService.ts</TabsTrigger>
              <TabsTrigger value="routes">api.routes.ts</TabsTrigger>
              <TabsTrigger value="model">User.model.ts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="app">
              <div className="bg-muted/50 p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code>{codePreview}</code>
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="service">
              <div className="bg-muted/50 p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code>{`export class UserService {
  private static baseUrl = '/api/users';

  static async getAllUsers(): Promise<User[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  }

  static async createUser(userData: Partial<User>): Promise<User> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  }
}`}</code>
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="routes">
              <div className="bg-muted/50 p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code>{`import express from 'express';
import { UserController } from '../controllers/UserController';

const router = express.Router();

router.get('/users', UserController.getAllUsers);
router.post('/users', UserController.createUser);
router.get('/users/:id', UserController.getUserById);
router.put('/users/:id', UserController.updateUser);
router.delete('/users/:id', UserController.deleteUser);

export default router;`}</code>
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="model">
              <div className="bg-muted/50 p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code>{`export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  isActive?: boolean;
}`}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodegenLab;