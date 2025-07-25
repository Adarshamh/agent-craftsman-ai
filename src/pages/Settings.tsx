import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Settings as SettingsIcon, Save, Key, Database, Brain, Zap } from "lucide-react";

const Settings = () => {
  const [openaiKey, setOpenaiKey] = useState("");
  const [ollamaEnabled, setOllamaEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure your AI agent and system preferences</p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Language Models</span>
              </CardTitle>
              <CardDescription>Configure AI models for different tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="primary-model">Primary Model</Label>
                    <Select defaultValue="gpt-4">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4 (OpenAI)</SelectItem>
                        <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="llama-2">LLaMA 2 (Local)</SelectItem>
                        <SelectItem value="codellama">Code LLaMA</SelectItem>
                        <SelectItem value="deepseek">DeepSeek Coder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="code-model">Code Generation Model</Label>
                    <Select defaultValue="codellama">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="codellama">Code LLaMA</SelectItem>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="deepseek">DeepSeek Coder</SelectItem>
                        <SelectItem value="starcoder">StarCoder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="embedding-model">Embedding Model</Label>
                    <Select defaultValue="all-minilm">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-minilm">all-MiniLM-L6-v2</SelectItem>
                        <SelectItem value="openai-ada">OpenAI Ada-002</SelectItem>
                        <SelectItem value="sentence-transformer">Sentence Transformer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="review-model">Code Review Model</Label>
                    <Select defaultValue="gpt-4">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="claude">Claude</SelectItem>
                        <SelectItem value="codellama">Code LLaMA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Local Models (Ollama)</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="ollama-enabled">Enable Ollama</Label>
                      <p className="text-sm text-muted-foreground">Use local models for privacy</p>
                    </div>
                    <Switch
                      id="ollama-enabled"
                      checked={ollamaEnabled}
                      onCheckedChange={setOllamaEnabled}
                    />
                  </div>

                  {ollamaEnabled && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">llama2:7b</span>
                          <Badge variant="default">Running</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">7B parameters</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">codellama:7b</span>
                          <Badge variant="outline">Stopped</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">7B parameters</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>API Configuration</span>
              </CardTitle>
              <CardDescription>Manage API keys and endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="sk-..."
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Required for GPT-4 and GPT-3.5 models
                  </p>
                </div>

                <div>
                  <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                  <Input
                    id="anthropic-key"
                    type="password"
                    placeholder="sk-ant-..."
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Required for Claude models
                  </p>
                </div>

                <div>
                  <Label htmlFor="ollama-endpoint">Ollama Endpoint</Label>
                  <Input
                    id="ollama-endpoint"
                    placeholder="http://localhost:11434"
                    defaultValue="http://localhost:11434"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Local Ollama server endpoint
                  </p>
                </div>

                <div>
                  <Label htmlFor="chroma-endpoint">ChromaDB Endpoint</Label>
                  <Input
                    id="chroma-endpoint"
                    placeholder="http://localhost:8000"
                    defaultValue="http://localhost:8000"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Vector database connection
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">Test Connection</Button>
                <Button>Save Keys</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Memory Configuration</span>
              </CardTitle>
              <CardDescription>Configure knowledge base and memory settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="memory-size">Memory Buffer Size</Label>
                    <Select defaultValue="10000">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5000">5,000 items</SelectItem>
                        <SelectItem value="10000">10,000 items</SelectItem>
                        <SelectItem value="20000">20,000 items</SelectItem>
                        <SelectItem value="50000">50,000 items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="similarity-threshold">Similarity Threshold</Label>
                    <Input
                      id="similarity-threshold"
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      defaultValue="0.8"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Minimum similarity for memory retrieval
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="retention-days">Retention Period</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                        <SelectItem value="forever">Forever</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-index">Auto-index New Content</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically index generated code
                      </p>
                    </div>
                    <Switch id="auto-index" defaultChecked />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Memory Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-xl font-bold">1,247</div>
                    <div className="text-sm text-muted-foreground">Total Items</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-xl font-bold">2.3GB</div>
                    <div className="text-sm text-muted-foreground">Storage Used</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-xl font-bold">98.7%</div>
                    <div className="text-sm text-muted-foreground">Index Health</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-xl font-bold">384</div>
                    <div className="text-sm text-muted-foreground">Dimensions</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5" />
                <span>General Preferences</span>
              </CardTitle>
              <CardDescription>Basic application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-save">Auto-save Progress</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save work in progress
                    </p>
                  </div>
                  <Switch
                    id="auto-save"
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Use dark theme interface
                    </p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications">Desktop Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when tasks complete
                    </p>
                  </div>
                  <Switch id="notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics">Usage Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve the agent with usage data
                    </p>
                  </div>
                  <Switch id="analytics" defaultChecked />
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="default-language">Default Language</Label>
                    <Select defaultValue="typescript">
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="rust">Rust</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="max-tokens">Max Tokens per Request</Label>
                    <Input
                      id="max-tokens"
                      type="number"
                      defaultValue="4000"
                      min="100"
                      max="8000"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Advanced Settings</span>
              </CardTitle>
              <CardDescription>Advanced configuration options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="temperature">Model Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    defaultValue="0.7"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Controls randomness in responses (0 = deterministic, 2 = very random)
                  </p>
                </div>

                <div>
                  <Label htmlFor="top-p">Top P</Label>
                  <Input
                    id="top-p"
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    defaultValue="0.9"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Nucleus sampling parameter
                  </p>
                </div>

                <div>
                  <Label htmlFor="max-retries">Max Retries</Label>
                  <Input
                    id="max-retries"
                    type="number"
                    min="1"
                    max="10"
                    defaultValue="3"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximum retry attempts for failed requests
                  </p>
                </div>

                <div>
                  <Label htmlFor="timeout">Request Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    min="10"
                    max="300"
                    defaultValue="60"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Danger Zone</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full">
                    Reset All Settings
                  </Button>
                  <Button variant="outline" className="w-full">
                    Clear Memory Database
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Factory Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;