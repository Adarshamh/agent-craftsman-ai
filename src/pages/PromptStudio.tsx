import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Play, Save, Copy, Wand2, Eye, Loader2, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PromptStudio = () => {
  const [promptName, setPromptName] = useState("");
  const [promptTemplate, setPromptTemplate] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isTestingPrompt, setIsTestingPrompt] = useState(false);
  const [variables, setVariables] = useState({
    ROLE: "React",
    OUTPUT_TYPE: "component",
    DESCRIPTION: "a user authentication form with validation"
  });
  const [testMetrics, setTestMetrics] = useState({
    successRate: 92,
    avgResponseTime: 1.4,
    tokensUsed: 847
  });
  const { toast } = useToast();

  const savedPrompts = [
    { 
      name: "React Component Generator", 
      category: "Frontend", 
      uses: 145,
      template: "You are an expert {{ROLE}} developer. Create a {{OUTPUT_TYPE}} for {{DESCRIPTION}}. Include TypeScript types, proper error handling, and responsive design using Tailwind CSS."
    },
    { 
      name: "API Endpoint Builder", 
      category: "Backend", 
      uses: 89,
      template: "Build a RESTful {{OUTPUT_TYPE}} for {{DESCRIPTION}}. Include proper error handling, validation, and documentation."
    },
    { 
      name: "Database Schema Designer", 
      category: "Database", 
      uses: 67,
      template: "Design a database {{OUTPUT_TYPE}} for {{DESCRIPTION}}. Include relationships, indexes, and constraints."
    },
    { 
      name: "Test Case Generator", 
      category: "Testing", 
      uses: 123,
      template: "Generate comprehensive {{OUTPUT_TYPE}} for {{DESCRIPTION}}. Include unit tests, integration tests, and edge cases."
    },
  ];

  const loadPrompt = (prompt: typeof savedPrompts[0]) => {
    setPromptName(prompt.name);
    setPromptTemplate(prompt.template);
    setSelectedCategory(prompt.category.toLowerCase());
    
    toast({
      title: "Prompt Loaded",
      description: `Loaded "${prompt.name}" template`,
      duration: 2000,
    });
  };

  const replaceVariables = (template: string) => {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  };

  const testPrompt = async () => {
    if (!promptTemplate.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt template first",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsTestingPrompt(true);
    
    try {
      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      const processedPrompt = replaceVariables(promptTemplate);
      
      // Generate mock response based on the prompt content
      let mockResponse = "";
      if (processedPrompt.toLowerCase().includes("component")) {
        mockResponse = `// Generated React Component
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation logic here
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input 
        type="email" 
        placeholder="Email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input 
        type="password" 
        placeholder="Password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit">Sign In</Button>
    </form>
  );
};

export default AuthForm;`;
      } else if (processedPrompt.toLowerCase().includes("api")) {
        mockResponse = `// Generated API Endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Authentication logic
    const user = await User.findOne({ email });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email } });
    
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});`;
      } else {
        mockResponse = `Generated output based on your prompt:

${processedPrompt}

This is a mock response that would be generated by the AI model. The actual implementation would call your configured AI model and return the real response.`;
      }
      
      setTestOutput(mockResponse);
      
      // Update metrics with realistic variations
      setTestMetrics({
        successRate: Math.max(85, Math.min(99, testMetrics.successRate + (Math.random() - 0.5) * 10)),
        avgResponseTime: Math.max(0.8, Math.min(3.5, testMetrics.avgResponseTime + (Math.random() - 0.5) * 0.8)),
        tokensUsed: Math.floor(processedPrompt.length * 1.2 + Math.random() * 200)
      });
      
      toast({
        title: "Test Complete",
        description: "Prompt tested successfully with mock AI response",
        duration: 3000,
      });
      
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "An error occurred while testing the prompt",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsTestingPrompt(false);
    }
  };

  const savePrompt = () => {
    if (!promptName.trim() || !promptTemplate.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt name and template",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    toast({
      title: "Prompt Saved",
      description: `"${promptName}" has been saved to your library`,
      duration: 3000,
    });
  };

  const copyPrompt = async () => {
    if (!promptTemplate.trim()) {
      toast({
        title: "Error",
        description: "No prompt to copy",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(replaceVariables(promptTemplate));
      toast({
        title: "Copied",
        description: "Prompt copied to clipboard",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy prompt",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

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
                <div 
                  key={index} 
                  className="p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors hover-scale"
                  onClick={() => loadPrompt(prompt)}
                >
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
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                    <Button onClick={savePrompt}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Prompt
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={testPrompt}
                      disabled={isTestingPrompt}
                    >
                      {isTestingPrompt ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      {isTestingPrompt ? "Testing..." : "Test Prompt"}
                    </Button>
                    <Button variant="outline" onClick={copyPrompt}>
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
                    {promptTemplate ? replaceVariables(promptTemplate) : "Enter a prompt template to see preview..."}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="variables" className="space-y-4">
                <div className="space-y-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm flex items-center">
                      <Settings2 className="h-4 w-4 mr-2" />
                      Variable Configuration
                    </h4>
                    <div className="mt-3 space-y-3">
                      {Object.entries(variables).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-3">
                          <code className="text-xs bg-background px-2 py-1 rounded min-w-fit">
                            {`{{${key}}}`}
                          </code>
                          <Input
                            value={value}
                            onChange={(e) => setVariables(prev => ({ ...prev, [key]: e.target.value }))}
                            className="text-sm"
                            placeholder={`Enter ${key.toLowerCase()}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm">Usage</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Use variables in your prompt template with double curly braces. Example: {`{{ROLE}}`}
                    </p>
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
                <div className="flex items-center space-x-2">
                  {isTestingPrompt && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Badge variant="outline">GPT-4</Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                {testOutput || "Run a test to see the output here..."}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testMetrics.successRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{testMetrics.avgResponseTime.toFixed(1)}s</div>
                <div className="text-sm text-muted-foreground">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{testMetrics.tokensUsed}</div>
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