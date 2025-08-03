import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { AlertTriangle, Plus, Settings, Trash2, Bell, Clock, Target } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export interface AlertRule {
  id: string
  name: string
  metric: string
  condition: 'greater_than' | 'less_than' | 'equals'
  threshold: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  cooldownMinutes: number
  description?: string
  created_at: string
  updated_at: string
}

interface AlertConfigurationProps {
  onRuleCreate?: (rule: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>) => void
  onRuleUpdate?: (id: string, rule: Partial<AlertRule>) => void
  onRuleDelete?: (id: string) => void
  existingRules?: AlertRule[]
}

const METRIC_OPTIONS = [
  { value: 'response_time', label: 'Response Time (ms)', description: 'Average API response time' },
  { value: 'error_rate', label: 'Error Rate (%)', description: 'Percentage of failed requests' },
  { value: 'memory_usage', label: 'Memory Usage (%)', description: 'System memory consumption' },
  { value: 'cpu_usage', label: 'CPU Usage (%)', description: 'System CPU utilization' },
  { value: 'log_volume', label: 'Log Volume', description: 'Number of logs per minute' },
  { value: 'active_sessions', label: 'Active Sessions', description: 'Number of concurrent users' }
]

const CONDITION_OPTIONS = [
  { value: 'greater_than', label: 'Greater than', symbol: '>' },
  { value: 'less_than', label: 'Less than', symbol: '<' },
  { value: 'equals', label: 'Equals', symbol: '=' }
]

const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-blue-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' }
]

export const AlertConfiguration = ({ 
  onRuleCreate, 
  onRuleUpdate, 
  onRuleDelete, 
  existingRules = [] 
}: AlertConfigurationProps) => {
  const [isCreating, setIsCreating] = useState(false)
  const [editingRule, setEditingRule] = useState<string | null>(null)
  const { toast } = useToast()
  
  // Form state for new/editing rule
  const [formData, setFormData] = useState({
    name: '',
    metric: '',
    condition: 'greater_than' as AlertRule['condition'],
    threshold: 0,
    severity: 'medium' as AlertRule['severity'],
    enabled: true,
    cooldownMinutes: 5,
    description: ''
  })

  const resetForm = () => {
    setFormData({
      name: '',
      metric: '',
      condition: 'greater_than',
      threshold: 0,
      severity: 'medium',
      enabled: true,
      cooldownMinutes: 5,
      description: ''
    })
    setIsCreating(false)
    setEditingRule(null)
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.metric) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    if (editingRule) {
      onRuleUpdate?.(editingRule, formData)
      toast({
        title: "Alert Rule Updated",
        description: `Rule "${formData.name}" has been updated successfully.`
      })
    } else {
      onRuleCreate?.(formData)
      toast({
        title: "Alert Rule Created",
        description: `Rule "${formData.name}" has been created successfully.`
      })
    }
    
    resetForm()
  }

  const handleEdit = (rule: AlertRule) => {
    setFormData({
      name: rule.name,
      metric: rule.metric,
      condition: rule.condition,
      threshold: rule.threshold,
      severity: rule.severity,
      enabled: rule.enabled,
      cooldownMinutes: rule.cooldownMinutes,
      description: rule.description || ''
    })
    setEditingRule(rule.id)
    setIsCreating(true)
  }

  const handleDelete = (ruleId: string, ruleName: string) => {
    if (confirm(`Are you sure you want to delete the alert rule "${ruleName}"?`)) {
      onRuleDelete?.(ruleId)
      toast({
        title: "Alert Rule Deleted",
        description: `Rule "${ruleName}" has been deleted.`
      })
    }
  }

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    onRuleUpdate?.(ruleId, { enabled })
    toast({
      title: enabled ? "Alert Rule Enabled" : "Alert Rule Disabled",
      description: `Rule has been ${enabled ? 'enabled' : 'disabled'}.`
    })
  }

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getMetricRecommendedThreshold = (metric: string) => {
    switch (metric) {
      case 'response_time': return 1000
      case 'error_rate': return 5
      case 'memory_usage': return 80
      case 'cpu_usage': return 75
      case 'log_volume': return 1000
      case 'active_sessions': return 100
      default: return 0
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alert Configuration</h2>
          <p className="text-muted-foreground">Set up performance thresholds and alerting rules</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          New Alert Rule
        </Button>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alert Rules ({existingRules.length})
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Global Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          {/* Rule Creation/Edit Form */}
          {isCreating && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingRule ? 'Edit Alert Rule' : 'Create New Alert Rule'}
                </CardTitle>
                <CardDescription>
                  Define conditions that will trigger alerts when performance metrics exceed thresholds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rule-name">Rule Name *</Label>
                    <Input
                      id="rule-name"
                      placeholder="e.g., High Response Time Alert"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metric">Metric *</Label>
                    <Select 
                      value={formData.metric} 
                      onValueChange={(value) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          metric: value,
                          threshold: getMetricRecommendedThreshold(value)
                        }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select metric to monitor" />
                      </SelectTrigger>
                      <SelectContent>
                        {METRIC_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-muted-foreground">{option.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select 
                      value={formData.condition} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, condition: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITION_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label} ({option.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="threshold">Threshold Value</Label>
                    <Input
                      id="threshold"
                      type="number"
                      placeholder="Enter threshold value"
                      value={formData.threshold}
                      onChange={(e) => setFormData(prev => ({ ...prev, threshold: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity Level</Label>
                    <Select 
                      value={formData.severity} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, severity: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEVERITY_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${option.color}`} />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cooldown">Cooldown Period (minutes)</Label>
                    <Input
                      id="cooldown"
                      type="number"
                      placeholder="5"
                      value={formData.cooldownMinutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, cooldownMinutes: parseInt(e.target.value) || 5 }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum time between repeated alerts for the same condition
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Additional context about this alert rule"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
                  />
                  <Label>Enable this alert rule</Label>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button onClick={handleSubmit}>
                    {editingRule ? 'Update Rule' : 'Create Rule'}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Rules List */}
          <div className="space-y-4">
            {existingRules.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Alert Rules Configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first alert rule to start monitoring system performance automatically.
                  </p>
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Alert Rule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              existingRules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">{rule.name}</h4>
                          <Badge variant={getSeverityBadgeVariant(rule.severity)}>
                            {rule.severity}
                          </Badge>
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center space-x-1">
                            <Target className="h-3 w-3" />
                            <span>
                              {METRIC_OPTIONS.find(m => m.value === rule.metric)?.label} 
                              {' '}
                              {CONDITION_OPTIONS.find(c => c.value === rule.condition)?.symbol}
                              {' '}
                              {rule.threshold}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{rule.cooldownMinutes}min cooldown</span>
                          </div>
                        </div>
                        
                        {rule.description && (
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(rule)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(rule.id, rule.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Global Alert Settings</CardTitle>
              <CardDescription>Configure system-wide alerting preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Master Alert Toggle</h4>
                  <p className="text-sm text-muted-foreground">Enable or disable all alert processing</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Sound Notifications</h4>
                  <p className="text-sm text-muted-foreground">Play audio alerts for critical notifications</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Browser Notifications</h4>
                  <p className="text-sm text-muted-foreground">Show browser push notifications</p>
                </div>
                <Switch />
              </div>
              
              <div className="space-y-2">
                <Label>Default Alert Retention (days)</Label>
                <Input type="number" defaultValue={30} />
                <p className="text-xs text-muted-foreground">
                  How long to keep alert history before automatic cleanup
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
