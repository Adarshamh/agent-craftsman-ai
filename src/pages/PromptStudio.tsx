import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Play, Save, Copy, Wand2, Eye } from "lucide-react";

const PromptStudio = () => {
  const [promptName, setPromptName] = useState("");
  const [promptTemplate, setPromptTemplate] = useState("");
  const [testOutput, setTestOutput] = useState("");

  const savedPrompts = [
    { name: "React Component Generator", category: "Frontend", uses: 145 },
    { name: "API Endpoint Builder", category: "Backend", uses: 89 },
    { name: "Database Schema Designer", category: "Database", uses: 67 },
    { name: "Test Case Generator", category: "Testing", uses: 123 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prompt Studio</h1>
          <p className="text-muted-foreground">Design, test, and optimize prompts for your AI agent</p>
        </div>
        <Badge variant="outline">
          <Wand2 className="h-4 w-4 mr-2" />
          AI-Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prompt Library */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prompt Library</CardTitle>
            <CardDescription>Your saved prompt templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savedPrompts.map((prompt, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                  <h4 className="font-medium text-sm">{prompt.name}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-xs">{prompt.category}</Badge>
                    <span className="text-xs text-muted-foreground">{prompt.uses} uses</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Wand2 className="h-4 w-4 mr-2" />
              Generate New Prompt
            </Button>
          </CardContent>
        </Card>

        {/* Prompt Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Prompt Editor</CardTitle>
            <CardDescription>Create and customize your prompt templates</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="editor" className="space-y-4">
              <TabsList>
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="variables">Variables</TabsTrigger>
              </TabsList>
              
              <TabsContent value="editor" className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Prompt Name</label>
                      <Input
                        placeholder="My Custom Prompt"
                        value={promptName}
                        onChange={(e) => setPromptName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="frontend">Frontend</SelectItem>
                          <SelectItem value="backend">Backend</SelectItem>
                          <SelectItem value="database">Database</SelectItem>
                          <SelectItem value="testing">Testing</SelectItem>
                          <SelectItem value="devops">DevOps</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Prompt Template</label>
                    <Textarea
                      placeholder="You are an expert {{ROLE}} developer. Create {{OUTPUT_TYPE}} for {{DESCRIPTION}}..."
                      value={promptTemplate}
                      onChange={(e) => setPromptTemplate(e.target.value)}
                      className="min-h-48 font-mono"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Save Prompt
                    </Button>
                    <Button variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Test Prompt
                    </Button>
                    <Button variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h4 className="font-medium mb-2">Preview Output</h4>
                  <div className="text-sm text-muted-foreground font-mono whitespace-pre-wrap">
                    {promptTemplate || "Enter a prompt template to see preview..."}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="variables" className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm">Available Variables</h4>
                    <div className="mt-2 space-y-1">
                      <code className="text-xs bg-background px-2 py-1 rounded">{`{ROLE}`}</code>
                      <code className="text-xs bg-background px-2 py-1 rounded ml-2">{`{OUTPUT_TYPE}`}</code>
                      <code className="text-xs bg-background px-2 py-1 rounded ml-2">{`{DESCRIPTION}`}</code>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Test Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Output Preview</h4>
                <Badge variant="outline">GPT-4</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {testOutput || "Run a test to see the output here..."}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">92%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">1.4s</div>
                <div className="text-sm text-muted-foreground">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">847</div>
                <div className="text-sm text-muted-foreground">Tokens Used</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptStudio;