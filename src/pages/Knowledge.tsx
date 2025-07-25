import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Brain, Search, Upload, Database, FileText, Tag } from "lucide-react";

const Knowledge = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const knowledgeItems = [
    {
      id: 1,
      title: "React Best Practices",
      content: "Component composition, hooks usage, performance optimization techniques...",
      tags: ["react", "frontend", "best-practices"],
      embedding: "vector_001",
      similarity: 0.95,
      created: "2 hours ago"
    },
    {
      id: 2,
      title: "Database Schema Design",
      content: "Normalization rules, indexing strategies, relationship modeling...",
      tags: ["database", "design", "sql"],
      embedding: "vector_002", 
      similarity: 0.87,
      created: "1 day ago"
    },
    {
      id: 3,
      title: "API Error Handling",
      content: "HTTP status codes, error response formats, retry mechanisms...",
      tags: ["api", "error-handling", "backend"],
      embedding: "vector_003",
      similarity: 0.92,
      created: "3 hours ago"
    },
    {
      id: 4,
      title: "TypeScript Patterns",
      content: "Advanced types, generics, utility types, conditional types...",
      tags: ["typescript", "patterns", "types"],
      embedding: "vector_004",
      similarity: 0.89,
      created: "5 hours ago"
    },
  ];

  const collections = [
    { name: "Frontend Patterns", count: 145, updated: "2 hours ago" },
    { name: "Backend Architecture", count: 89, updated: "1 day ago" },
    { name: "Database Design", count: 67, updated: "3 hours ago" },
    { name: "Testing Strategies", count: 123, updated: "5 hours ago" },
    { name: "DevOps Practices", count: 78, updated: "1 week ago" },
  ];

  const recentQueries = [
    { query: "How to implement authentication in React", results: 12, time: "5 minutes ago" },
    { query: "Database indexing strategies", results: 8, time: "15 minutes ago" },
    { query: "Error handling in TypeScript", results: 15, time: "1 hour ago" },
    { query: "API rate limiting techniques", results: 6, time: "2 hours ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Knowledge Base</h1>
          <p className="text-muted-foreground">Vector memory and indexed patterns from your AI agent</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button>
            <Database className="h-4 w-4 mr-2" />
            Rebuild Index
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">1,247</div>
                <div className="text-sm text-muted-foreground">Knowledge Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">502</div>
                <div className="text-sm text-muted-foreground">Collections</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">3,891</div>
                <div className="text-sm text-muted-foreground">Queries</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">89.7%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Semantic Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="knowledge" className="space-y-4">
        <TabsList>
          <TabsTrigger value="knowledge">Knowledge Items</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="queries">Recent Queries</TabsTrigger>
          <TabsTrigger value="vectors">Vector Store</TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge">
          <div className="space-y-4">
            {knowledgeItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="mt-2">{item.content}</CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      {Math.round(item.similarity * 100)}% match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{item.embedding}</span>
                      <span>{item.created}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="collections">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collections.map((collection, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Database className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{collection.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {collection.count} items • Updated {collection.updated}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="queries">
          <Card>
            <CardHeader>
              <CardTitle>Recent Semantic Searches</CardTitle>
              <CardDescription>History of knowledge base queries</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {recentQueries.map((query, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{query.query}</p>
                        <p className="text-xs text-muted-foreground">{query.time}</p>
                      </div>
                      <Badge variant="outline">{query.results} results</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vectors">
          <Card>
            <CardHeader>
              <CardTitle>Vector Store Status</CardTitle>
              <CardDescription>ChromaDB collection and embedding details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">1,247</div>
                    <div className="text-sm text-muted-foreground">Embeddings</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">384</div>
                    <div className="text-sm text-muted-foreground">Dimensions</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">98.7%</div>
                    <div className="text-sm text-muted-foreground">Index Health</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">2.3GB</div>
                    <div className="text-sm text-muted-foreground">Storage Used</div>
                  </div>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">ChromaDB Collections</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>code_patterns</span>
                      <span>456 docs</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>api_examples</span>
                      <span>289 docs</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>error_solutions</span>
                      <span>502 docs</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Knowledge;