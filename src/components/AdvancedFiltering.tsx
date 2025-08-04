import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  Filter, 
  Plus, 
  X, 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  Database,
  Network,
  Cpu,
  Users,
  Code,
  Bug,
  Zap,
  Target,
  TrendingUp,
  Settings
} from 'lucide-react'

interface SearchFilter {
  id: string
  field: string
  operator: string
  value: string
  enabled: boolean
}

interface SavedQuery {
  id: string
  name: string
  description: string
  filters: SearchFilter[]
  searchTerm: string
  dateRange: string
  usageCount: number
  lastUsed: string
}

const mockLogs = [
  {
    id: 1,
    timestamp: '2024-01-07 10:30:45',
    level: 'error',
    component: 'Auth Service',
    message: 'Failed to authenticate user with token',
    source: 'api/auth.ts',
    userId: 'user_123',
    duration: 250
  },
  {
    id: 2,
    timestamp: '2024-01-07 10:29:12',
    level: 'warning',
    component: 'Database',
    message: 'Query execution time exceeds threshold',
    source: 'db/queries.ts',
    userId: 'user_456',
    duration: 1200
  },
  {
    id: 3,
    timestamp: '2024-01-07 10:28:33',
    level: 'info',
    component: 'API Gateway',
    message: 'Request processed successfully',
    source: 'api/handler.ts',
    userId: 'user_789',
    duration: 85
  },
]

const searchSuggestions = [
  'error AND component:Auth',
  'duration > 1000',
  'level:error OR level:warning',
  'timestamp:[now-1h TO now]',
  'user_id:user_123',
  'component:Database AND level:warning',
]

const savedQueries: SavedQuery[] = [
  {
    id: '1',
    name: 'High Duration Errors',
    description: 'Errors with execution time > 500ms',
    filters: [
      { id: '1', field: 'level', operator: 'equals', value: 'error', enabled: true },
      { id: '2', field: 'duration', operator: 'greater_than', value: '500', enabled: true }
    ],
    searchTerm: '',
    dateRange: '24h',
    usageCount: 45,
    lastUsed: '2024-01-07'
  },
  {
    id: '2',
    name: 'Auth Service Issues',
    description: 'All issues related to authentication',
    filters: [
      { id: '3', field: 'component', operator: 'equals', value: 'Auth Service', enabled: true }
    ],
    searchTerm: 'auth',
    dateRange: '7d',
    usageCount: 23,
    lastUsed: '2024-01-06'
  },
]

const correlationPatterns = [
  {
    id: 1,
    pattern: 'Database errors → Auth failures',
    correlation: 0.85,
    description: 'Database connectivity issues often lead to authentication failures',
    frequency: 'High',
    actionable: true
  },
  {
    id: 2,
    pattern: 'Peak traffic → Performance degradation',
    correlation: 0.72,
    description: 'High user traffic correlates with increased response times',
    frequency: 'Medium',
    actionable: true
  },
  {
    id: 3,
    pattern: 'Memory usage → Cache misses',
    correlation: 0.68,
    description: 'High memory usage leads to cache eviction and misses',
    frequency: 'Medium',
    actionable: false
  },
]

export function AdvancedFiltering() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<SearchFilter[]>([])
  const [selectedDateRange, setSelectedDateRange] = useState('24h')
  const [selectedComponent, setSelectedComponent] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [searchResults, setSearchResults] = useState(mockLogs)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const addFilter = () => {
    const newFilter: SearchFilter = {
      id: Math.random().toString(36).substr(2, 9),
      field: '',
      operator: 'equals',
      value: '',
      enabled: true
    }
    setFilters([...filters, newFilter])
  }

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id))
  }

  const updateFilter = (id: string, key: keyof SearchFilter, value: string | boolean) => {
    setFilters(filters.map(f => 
      f.id === id ? { ...f, [key]: value } : f
    ))
  }

  const executeSearch = () => {
    // Simulate search execution
    console.log('Executing search with:', { searchTerm, filters, selectedDateRange })
    // In real implementation, this would call the search API
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'info': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'destructive'
      case 'warning': return 'secondary'
      case 'info': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Advanced Search & Filtering</h2>
          <p className="text-muted-foreground">
            Search across logs with complex queries and pattern detection
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Search Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">Smart Search</TabsTrigger>
          <TabsTrigger value="correlation">Pattern Analysis</TabsTrigger>
          <TabsTrigger value="saved">Saved Queries</TabsTrigger>
          <TabsTrigger value="builder">Query Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Intelligent Search
              </CardTitle>
              <CardDescription>
                Search with natural language or use advanced query syntax
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search logs... (e.g., 'errors in auth service last hour')"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-12"
                  />
                </div>
                <Button onClick={executeSearch} className="h-12 px-6">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Quick filters:</span>
                <Button variant="outline" size="sm" onClick={() => setSearchTerm('level:error')}>
                  Errors only
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSearchTerm('duration > 1000')}>
                  Slow queries
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSearchTerm('timestamp:[now-1h TO now]')}>
                  Last hour
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced
                </Button>
              </div>

              {showAdvanced && (
                <Card className="border-dashed">
                  <CardContent className="pt-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label>Date Range</Label>
                        <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1h">Last hour</SelectItem>
                            <SelectItem value="24h">Last 24 hours</SelectItem>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Component</Label>
                        <Select value={selectedComponent} onValueChange={setSelectedComponent}>
                          <SelectTrigger>
                            <SelectValue placeholder="All components" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All components</SelectItem>
                            <SelectItem value="Auth Service">Auth Service</SelectItem>
                            <SelectItem value="Database">Database</SelectItem>
                            <SelectItem value="API Gateway">API Gateway</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Log Level</Label>
                        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                          <SelectTrigger>
                            <SelectValue placeholder="All levels" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All levels</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Search Suggestions</h4>
                  <Badge variant="outline">{searchSuggestions.length} suggestions</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="h-auto p-2 font-mono text-xs"
                      onClick={() => setSearchTerm(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                {searchResults.length} results found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {searchResults.map((log) => (
                    <Card key={log.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            {getLevelIcon(log.level)}
                            <Badge variant={getLevelColor(log.level) as any}>
                              {log.level}
                            </Badge>
                            <span className="text-sm font-medium">{log.component}</span>
                            <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                          </div>
                          <p className="text-sm">{log.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Source: {log.source}</span>
                            <span>User: {log.userId}</span>
                            <span>Duration: {log.duration}ms</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Pattern Detection
              </CardTitle>
              <CardDescription>
                Automatically detected correlations and patterns in your logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {correlationPatterns.map((pattern) => (
                  <Card key={pattern.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{pattern.pattern}</h3>
                            <Badge variant="outline">{(pattern.correlation * 100).toFixed(0)}% correlation</Badge>
                            <Badge variant={pattern.frequency === 'High' ? 'destructive' : 'secondary'}>
                              {pattern.frequency}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{pattern.description}</p>
                        </div>
                        {pattern.actionable && (
                          <Button variant="outline" size="sm">
                            Create Alert
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Anomaly Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Error Rate Spike</span>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Unusual Traffic Pattern</span>
                    <Badge variant="secondary">Medium</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database Latency</span>
                    <Badge variant="outline">Low</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error frequency</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-500">+15%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response time</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">-8%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active users</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-blue-500">+23%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Saved Queries
                </span>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Save Current Query
                </Button>
              </CardTitle>
              <CardDescription>
                Quickly access your frequently used search queries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savedQueries.map((query) => (
                  <Card key={query.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{query.name}</h3>
                            <Badge variant="outline">{query.usageCount} uses</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{query.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Filters: {query.filters.length}</span>
                            <span>Range: {query.dateRange}</span>
                            <span>Last used: {query.lastUsed}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Run</Button>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Visual Query Builder
                </span>
                <Button variant="outline" size="sm" onClick={addFilter}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </CardTitle>
              <CardDescription>
                Build complex queries using a visual interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filters.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No conditions added</p>
                  <p className="text-xs">Click "Add Condition" to start building your query</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filters.map((filter, index) => (
                    <div key={filter.id} className="flex items-center space-x-2 p-3 border rounded-md">
                      <Checkbox 
                        checked={filter.enabled}
                        onCheckedChange={(checked) => updateFilter(filter.id, 'enabled', checked as boolean)}
                      />
                      
                      {index > 0 && (
                        <Select defaultValue="AND">
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">AND</SelectItem>
                            <SelectItem value="OR">OR</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      <Select value={filter.field} onValueChange={(value) => updateFilter(filter.id, 'field', value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="level">Log Level</SelectItem>
                          <SelectItem value="component">Component</SelectItem>
                          <SelectItem value="message">Message</SelectItem>
                          <SelectItem value="duration">Duration</SelectItem>
                          <SelectItem value="timestamp">Timestamp</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filter.operator} onValueChange={(value) => updateFilter(filter.id, 'operator', value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">equals</SelectItem>
                          <SelectItem value="not_equals">not equals</SelectItem>
                          <SelectItem value="contains">contains</SelectItem>
                          <SelectItem value="greater_than">{'>'}</SelectItem>
                          <SelectItem value="less_than">{'<'}</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input 
                        value={filter.value}
                        onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                        placeholder="Value"
                        className="flex-1"
                      />

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeFilter(filter.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {filters.length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <Label className="text-sm font-medium">Generated Query:</Label>
                  <code className="block mt-1 text-xs font-mono">
                    {filters
                      .filter(f => f.enabled && f.field && f.value)
                      .map((f, i) => 
                        `${i > 0 ? ' AND ' : ''}${f.field} ${f.operator} "${f.value}"`
                      )
                      .join('')}
                  </code>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}