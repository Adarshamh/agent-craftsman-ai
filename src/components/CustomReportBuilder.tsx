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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  X, 
  Download, 
  Calendar, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Table,
  FileText,
  Clock,
  Filter,
  Settings,
  Play,
  Save,
  Eye
} from 'lucide-react'
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, Cell } from 'recharts'

// Mock data for preview
const sampleData = [
  { name: 'Jan', errors: 12, performance: 85, users: 150 },
  { name: 'Feb', errors: 8, performance: 89, users: 180 },
  { name: 'Mar', errors: 15, performance: 82, users: 210 },
  { name: 'Apr', errors: 6, performance: 91, users: 240 },
  { name: 'May', errors: 9, performance: 88, users: 280 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

interface ReportField {
  id: string
  name: string
  type: 'metric' | 'dimension' | 'filter'
  dataType: 'number' | 'string' | 'date' | 'boolean'
}

interface ReportFilter {
  id: string
  field: string
  operator: string
  value: string
}

const availableFields: ReportField[] = [
  { id: 'errors_count', name: 'Error Count', type: 'metric', dataType: 'number' },
  { id: 'performance_score', name: 'Performance Score', type: 'metric', dataType: 'number' },
  { id: 'user_count', name: 'User Count', type: 'metric', dataType: 'number' },
  { id: 'response_time', name: 'Response Time', type: 'metric', dataType: 'number' },
  { id: 'timestamp', name: 'Date', type: 'dimension', dataType: 'date' },
  { id: 'component', name: 'Component', type: 'dimension', dataType: 'string' },
  { id: 'severity', name: 'Severity', type: 'dimension', dataType: 'string' },
  { id: 'resolved', name: 'Resolved', type: 'filter', dataType: 'boolean' },
]

const operators = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'contains', label: 'Contains' },
]

export function CustomReportBuilder() {
  const [reportName, setReportName] = useState('')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([])
  const [filters, setFilters] = useState<ReportFilter[]>([])
  const [chartType, setChartType] = useState('line')
  const [dateRange, setDateRange] = useState('7d')
  const [schedule, setSchedule] = useState('')

  const addFilter = () => {
    const newFilter: ReportFilter = {
      id: Math.random().toString(36).substr(2, 9),
      field: '',
      operator: 'equals',
      value: ''
    }
    setFilters([...filters, newFilter])
  }

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id))
  }

  const updateFilter = (id: string, key: keyof ReportFilter, value: string) => {
    setFilters(filters.map(f => 
      f.id === id ? { ...f, [key]: value } : f
    ))
  }

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    )
  }

  const toggleDimension = (dimensionId: string) => {
    setSelectedDimensions(prev => 
      prev.includes(dimensionId) 
        ? prev.filter(id => id !== dimensionId)
        : [...prev, dimensionId]
    )
  }

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLine data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="errors" stroke="#8884d8" />
              <Line type="monotone" dataKey="performance" stroke="#82ca9d" />
            </RechartsLine>
          </ResponsiveContainer>
        )
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="errors" fill="#8884d8" />
              <Bar dataKey="users" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        )
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-2 text-left">Month</th>
                  <th className="border border-border p-2 text-left">Errors</th>
                  <th className="border border-border p-2 text-left">Performance</th>
                  <th className="border border-border p-2 text-left">Users</th>
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row, index) => (
                  <tr key={index}>
                    <td className="border border-border p-2">{row.name}</td>
                    <td className="border border-border p-2">{row.errors}</td>
                    <td className="border border-border p-2">{row.performance}%</td>
                    <td className="border border-border p-2">{row.users}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      default:
        return <div className="flex items-center justify-center h-64 text-muted-foreground">Select a chart type</div>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Custom Report Builder</h2>
          <p className="text-muted-foreground">
            Create custom reports and dashboards with drag-and-drop interface
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
          <Button size="sm">
            <Play className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="builder" className="space-y-4">
        <TabsList>
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="schedule">Schedule & Export</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Configuration Panel */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Report Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="report-name">Report Name</Label>
                    <Input 
                      id="report-name"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      placeholder="Enter report name..."
                    />
                  </div>

                  <div>
                    <Label>Date Range</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1d">Last 24 hours</SelectItem>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Chart Type</Label>
                    <Select value={chartType} onValueChange={setChartType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                        <SelectItem value="table">Data Table</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Metrics</CardTitle>
                  <CardDescription>Select the metrics to include in your report</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {availableFields.filter(f => f.type === 'metric').map((field) => (
                      <div key={field.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={field.id}
                          checked={selectedMetrics.includes(field.id)}
                          onCheckedChange={() => toggleMetric(field.id)}
                        />
                        <Label htmlFor={field.id} className="text-sm">{field.name}</Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dimensions</CardTitle>
                  <CardDescription>Group data by these dimensions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {availableFields.filter(f => f.type === 'dimension').map((field) => (
                      <div key={field.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={field.id}
                          checked={selectedDimensions.includes(field.id)}
                          onCheckedChange={() => toggleDimension(field.id)}
                        />
                        <Label htmlFor={field.id} className="text-sm">{field.name}</Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Preview */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Filter className="h-5 w-5 mr-2" />
                      Filters
                    </span>
                    <Button variant="outline" size="sm" onClick={addFilter}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Filter
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filters.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No filters applied. Click "Add Filter" to filter your data.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filters.map((filter) => (
                        <div key={filter.id} className="flex items-center space-x-2 p-3 border rounded-md">
                          <Select value={filter.field} onValueChange={(value) => updateFilter(filter.id, 'field', value)}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableFields.map((field) => (
                                <SelectItem key={field.id} value={field.id}>{field.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select value={filter.operator} onValueChange={(value) => updateFilter(filter.id, 'operator', value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {operators.map((op) => (
                                <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                              ))}
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedMetrics.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      Select metrics to see preview
                    </div>
                  ) : (
                    renderChart()
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>
                Preview of your custom report with current settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{reportName || 'Untitled Report'}</h3>
                  <Badge variant="outline">Generated: {new Date().toLocaleDateString()}</Badge>
                </div>

                {selectedMetrics.length > 0 && (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">1,234</div>
                          <p className="text-xs text-muted-foreground">Total Errors</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">87%</div>
                          <p className="text-xs text-muted-foreground">Performance Score</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">5,678</div>
                          <p className="text-xs text-muted-foreground">Active Users</p>
                        </CardContent>
                      </Card>
                    </div>

                    {renderChart()}

                    {filters.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Applied Filters:</h4>
                        <div className="flex flex-wrap gap-2">
                          {filters.map((filter) => (
                            <Badge key={filter.id} variant="secondary">
                              {availableFields.find(f => f.id === filter.field)?.name || filter.field} {filter.operator} {filter.value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Schedule Reports
                </CardTitle>
                <CardDescription>
                  Automatically generate and deliver reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Schedule Frequency</Label>
                  <Select value={schedule} onValueChange={setSchedule}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Schedule</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Email Recipients</Label>
                  <Input placeholder="Enter email addresses..." />
                </div>

                <div>
                  <Label>Report Name Template</Label>
                  <Input placeholder="Weekly Report - {date}" />
                </div>

                <Button className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Export Options
                </CardTitle>
                <CardDescription>
                  Download your report in various formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Table className="h-4 w-4 mr-2" />
                    Export as CSV
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Export as Excel
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Export as JSON
                  </Button>
                </div>

                <Separator />

                <div>
                  <Label>Export Settings</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-charts" />
                      <Label htmlFor="include-charts" className="text-sm">Include charts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-summary" />
                      <Label htmlFor="include-summary" className="text-sm">Include summary</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-filters" />
                      <Label htmlFor="include-filters" className="text-sm">Include filter details</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>
                Pre-built report templates for common use cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Error Analysis Report</h3>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive error tracking and analysis
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">Errors</Badge>
                        <Badge variant="outline" className="text-xs">Trends</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Performance Dashboard</h3>
                      <p className="text-sm text-muted-foreground">
                        System performance metrics and KPIs
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">Performance</Badge>
                        <Badge variant="outline" className="text-xs">Metrics</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">User Activity Report</h3>
                      <p className="text-sm text-muted-foreground">
                        User engagement and activity patterns
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">Users</Badge>
                        <Badge variant="outline" className="text-xs">Sessions</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Executive Summary</h3>
                      <p className="text-sm text-muted-foreground">
                        High-level overview for stakeholders
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">Summary</Badge>
                        <Badge variant="outline" className="text-xs">KPIs</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Security Audit</h3>
                      <p className="text-sm text-muted-foreground">
                        Security events and vulnerability tracking
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">Security</Badge>
                        <Badge variant="outline" className="text-xs">Audit</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Custom Template</h3>
                      <p className="text-sm text-muted-foreground">
                        Start with a blank template
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">Custom</Badge>
                        <Badge variant="outline" className="text-xs">Blank</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}