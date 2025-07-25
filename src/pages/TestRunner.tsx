import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { TestTube, Play, CheckCircle, X, Clock, FileText } from "lucide-react";

const TestRunner = () => {
  const [isRunning, setIsRunning] = useState(false);

  const testSuites = [
    { 
      name: "User Authentication", 
      tests: 12, 
      passed: 11, 
      failed: 1, 
      duration: "2.34s",
      coverage: 94
    },
    { 
      name: "API Endpoints", 
      tests: 8, 
      passed: 8, 
      failed: 0, 
      duration: "1.87s",
      coverage: 100
    },
    { 
      name: "Database Operations", 
      tests: 15, 
      passed: 13, 
      failed: 2, 
      duration: "4.12s",
      coverage: 87
    },
    { 
      name: "Component Rendering", 
      tests: 23, 
      passed: 23, 
      failed: 0, 
      duration: "3.45s",
      coverage: 96
    },
  ];

  const testResults = [
    { 
      name: "should authenticate user with valid credentials", 
      status: "passed", 
      duration: "0.23s",
      suite: "User Authentication"
    },
    { 
      name: "should reject invalid password", 
      status: "failed", 
      duration: "0.15s",
      suite: "User Authentication",
      error: "Expected status 401, received 200"
    },
    { 
      name: "should create new user", 
      status: "passed", 
      duration: "0.45s",
      suite: "API Endpoints"
    },
    { 
      name: "should validate user input", 
      status: "passed", 
      duration: "0.12s",
      suite: "API Endpoints"
    },
    { 
      name: "should handle database connection", 
      status: "failed", 
      duration: "2.34s",
      suite: "Database Operations",
      error: "Connection timeout after 2000ms"
    },
  ];

  const generatedTests = [
    {
      file: "UserService.test.ts",
      tests: 8,
      generated: "2 minutes ago",
      coverage: "95%"
    },
    {
      file: "ApiClient.test.ts", 
      tests: 12,
      generated: "5 minutes ago",
      coverage: "88%"
    },
    {
      file: "Database.test.ts",
      tests: 6,
      generated: "8 minutes ago", 
      coverage: "92%"
    },
  ];

  const runAllTests = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Test Runner</h1>
          <p className="text-muted-foreground">Auto-generate and execute comprehensive test suites</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={runAllTests} disabled={isRunning}>
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? "Running..." : "Run All Tests"}
          </Button>
          <Button variant="outline">
            <TestTube className="h-4 w-4 mr-2" />
            Generate Tests
          </Button>
        </div>
      </div>

      {/* Test Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TestTube className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">58</div>
                <div className="text-sm text-muted-foreground">Total Tests</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">55</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <X className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">11.78s</div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isRunning && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="animate-spin">
                <TestTube className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium mb-2">Running test suite...</div>
                <Progress value={67} className="h-2" />
              </div>
              <div className="text-sm text-muted-foreground">67%</div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="suites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="generated">AI Generated</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
        </TabsList>

        <TabsContent value="suites">
          <div className="space-y-4">
            {testSuites.map((suite, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{suite.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{suite.coverage}% coverage</Badge>
                      <Badge variant={suite.failed > 0 ? "destructive" : "default"}>
                        {suite.passed}/{suite.tests} passed
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-green-600">{suite.passed} passed</span>
                        <span className="text-red-600">{suite.failed} failed</span>
                        <span className="text-muted-foreground">{suite.duration}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-2" />
                        Run Suite
                      </Button>
                    </div>
                    <Progress value={(suite.passed / suite.tests) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>Detailed results from the latest test run</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                      {result.status === "passed" ? 
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" /> :
                        <X className="h-4 w-4 text-red-500 mt-0.5" />
                      }
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" className="text-xs">{result.suite}</Badge>
                          <span className="text-xs text-muted-foreground">{result.duration}</span>
                        </div>
                        <p className="text-sm font-medium">{result.name}</p>
                        {result.error && (
                          <p className="text-xs text-red-600 mt-1">{result.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generated">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">AI Generated Tests</h3>
              <Button variant="outline">
                <TestTube className="h-4 w-4 mr-2" />
                Generate More Tests
              </Button>
            </div>
            
            {generatedTests.map((test, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{test.file}</p>
                        <p className="text-sm text-muted-foreground">
                          {test.tests} tests • Generated {test.generated}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{test.coverage} coverage</Badge>
                      <Button size="sm" variant="outline">View</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coverage">
          <Card>
            <CardHeader>
              <CardTitle>Code Coverage Report</CardTitle>
              <CardDescription>Line-by-line coverage analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-8 bg-muted/50 rounded-lg">
                  <div className="text-4xl font-bold text-green-600 mb-2">94.3%</div>
                  <div className="text-muted-foreground">Overall Coverage</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Functions</span>
                      <span>96.7%</span>
                    </div>
                    <Progress value={96.7} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Statements</span>
                      <span>94.1%</span>
                    </div>
                    <Progress value={94.1} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Branches</span>
                      <span>89.3%</span>
                    </div>
                    <Progress value={89.3} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Lines</span>
                      <span>95.8%</span>
                    </div>
                    <Progress value={95.8} className="h-2" />
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

export default TestRunner;