import { useEffect, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AlertRule } from '@/components/AlertConfiguration'
import { 
  useSystemMetrics, 
  usePerformanceLogs, 
  useErrorLogs, 
  useExecutionLogs 
} from './useMonitoring'

export interface Alert {
  id: string
  ruleId: string
  ruleName: string
  metric: string
  currentValue: number
  threshold: number
  condition: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  acknowledged: boolean
  resolved: boolean
  resolvedAt?: string
  resolvedBy?: string
  metadata?: Record<string, any>
}

interface AlertMonitoringState {
  activeAlerts: Alert[]
  alertHistory: Alert[]
  isMonitoring: boolean
  lastCheckTime: string | null
}

interface UseAlertMonitoringProps {
  alertRules: AlertRule[]
  checkIntervalMs?: number
  enabled?: boolean
}

// In-memory store for alerts (in a real app, this would be in a database)
let alertStore: AlertMonitoringState = {
  activeAlerts: [],
  alertHistory: [],
  isMonitoring: false,
  lastCheckTime: null
}

// Cooldown tracking to prevent spam alerts
const cooldownTracker = new Map<string, number>()

export const useAlertMonitoring = ({ 
  alertRules, 
  checkIntervalMs = 30000, // 30 seconds default
  enabled = true 
}: UseAlertMonitoringProps) => {
  const [alerts, setAlerts] = useState<AlertMonitoringState>(alertStore)
  const [lastError, setLastError] = useState<string | null>(null)
  
  const queryClient = useQueryClient()
  
  // Fetch latest monitoring data
  const { data: systemMetrics = [] } = useSystemMetrics(undefined, 1) // Last hour
  const { data: performanceLogs = [] } = usePerformanceLogs(undefined, 100)
  const { data: errorLogs = [] } = useErrorLogs(undefined, undefined, 50)
  const { data: executionLogs = [] } = useExecutionLogs(100)

  // Calculate current metric values
  const calculateMetricValue = useCallback((metric: string): number => {
    const now = Date.now()
    const fiveMinutesAgo = now - (5 * 60 * 1000)

    switch (metric) {
      case 'response_time': {
        const recentPerformance = performanceLogs.filter(log => 
          new Date(log.created_at).getTime() > fiveMinutesAgo
        )
        if (recentPerformance.length === 0) return 0
        return recentPerformance.reduce((sum, log) => sum + (log.duration_ms || 0), 0) / recentPerformance.length
      }

      case 'error_rate': {
        const recentPerformance = performanceLogs.filter(log => 
          new Date(log.created_at).getTime() > fiveMinutesAgo
        )
        if (recentPerformance.length === 0) return 0
        // Performance logs in new schema don't have status field
        return 0 // Will be calculated from error logs instead
      }

      case 'memory_usage': {
        const recentMemoryMetrics = systemMetrics.filter(metric => 
          metric.metric_type === 'memory_usage' && 
          new Date(metric.created_at).getTime() > fiveMinutesAgo
        )
        if (recentMemoryMetrics.length === 0) return 0
        const latestMemory = recentMemoryMetrics[recentMemoryMetrics.length - 1]
        return latestMemory.value
      }

      case 'cpu_usage': {
        const recentCpuMetrics = systemMetrics.filter(metric => 
          metric.metric_type === 'cpu_usage' && 
          new Date(metric.created_at).getTime() > fiveMinutesAgo
        )
        if (recentCpuMetrics.length === 0) return 0
        const latestCpu = recentCpuMetrics[recentCpuMetrics.length - 1]
        return latestCpu.value
      }

      case 'log_volume': {
        const recentLogs = executionLogs.filter(log => 
          new Date(log.created_at).getTime() > fiveMinutesAgo
        )
        return recentLogs.length
      }

      case 'active_sessions': {
        // This would typically come from session tracking
        // For demo purposes, simulate based on recent activity
        const recentActivity = executionLogs.filter(log => 
          new Date(log.created_at).getTime() > fiveMinutesAgo
        )
        return Math.max(1, Math.floor(recentActivity.length / 10))
      }

      default:
        return 0
    }
  }, [systemMetrics, performanceLogs, errorLogs, executionLogs])

  // Check if condition is met
  const checkCondition = useCallback((condition: string, currentValue: number, threshold: number): boolean => {
    switch (condition) {
      case 'greater_than':
        return currentValue > threshold
      case 'less_than':
        return currentValue < threshold
      case 'equals':
        return Math.abs(currentValue - threshold) < 0.01 // Allow for floating point precision
      default:
        return false
    }
  }, [])

  // Generate alert message
  const generateAlertMessage = useCallback((rule: AlertRule, currentValue: number): string => {
    const metricName = rule.metric.replace('_', ' ').toLowerCase()
    const conditionText = {
      'greater_than': 'exceeded',
      'less_than': 'dropped below',
      'equals': 'equals'
    }[rule.condition] || 'met condition'

    return `${rule.name}: ${metricName} has ${conditionText} threshold of ${rule.threshold} (current: ${currentValue.toFixed(2)})`
  }, [])

  // Check if rule is in cooldown
  const isInCooldown = useCallback((ruleId: string, cooldownMinutes: number): boolean => {
    const lastTriggered = cooldownTracker.get(ruleId)
    if (!lastTriggered) return false
    
    const cooldownMs = cooldownMinutes * 60 * 1000
    return Date.now() - lastTriggered < cooldownMs
  }, [])

  // Create new alert
  const createAlert = useCallback((rule: AlertRule, currentValue: number): Alert => {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      metric: rule.metric,
      currentValue,
      threshold: rule.threshold,
      condition: rule.condition,
      severity: rule.severity,
      message: generateAlertMessage(rule, currentValue),
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false,
      metadata: {
        checkTime: new Date().toISOString(),
        metricValue: currentValue,
        thresholdValue: rule.threshold
      }
    }

    // Update cooldown tracker
    cooldownTracker.set(rule.id, Date.now())
    
    return alert
  }, [generateAlertMessage])

  // Main monitoring check function
  const checkAlertRules = useCallback(async () => {
    if (!enabled || alertRules.length === 0) return

    try {
      setLastError(null)
      const newAlerts: Alert[] = []
      const currentTime = new Date().toISOString()

      for (const rule of alertRules) {
        if (!rule.enabled) continue
        if (isInCooldown(rule.id, rule.cooldownMinutes)) continue

        const currentValue = calculateMetricValue(rule.metric)
        const conditionMet = checkCondition(rule.condition, currentValue, rule.threshold)

        if (conditionMet) {
          const newAlert = createAlert(rule, currentValue)
          newAlerts.push(newAlert)
        }
      }

      // Update alert store
      if (newAlerts.length > 0) {
        alertStore = {
          ...alertStore,
          activeAlerts: [...alertStore.activeAlerts, ...newAlerts],
          alertHistory: [...alertStore.alertHistory, ...newAlerts],
          lastCheckTime: currentTime
        }
        setAlerts({ ...alertStore })
      } else {
        alertStore = {
          ...alertStore,
          lastCheckTime: currentTime
        }
        setAlerts({ ...alertStore })
      }

    } catch (error) {
      console.error('Alert monitoring error:', error)
      setLastError(error instanceof Error ? error.message : 'Unknown error')
    }
  }, [enabled, alertRules, calculateMetricValue, checkCondition, createAlert, isInCooldown])

  // Acknowledge alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    alertStore = {
      ...alertStore,
      activeAlerts: alertStore.activeAlerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ),
      alertHistory: alertStore.alertHistory.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    }
    setAlerts({ ...alertStore })
  }, [])

  // Resolve alert
  const resolveAlert = useCallback((alertId: string, resolvedBy?: string) => {
    const now = new Date().toISOString()
    alertStore = {
      ...alertStore,
      activeAlerts: alertStore.activeAlerts.filter(alert => alert.id !== alertId),
      alertHistory: alertStore.alertHistory.map(alert =>
        alert.id === alertId 
          ? { ...alert, resolved: true, resolvedAt: now, resolvedBy } 
          : alert
      )
    }
    setAlerts({ ...alertStore })
  }, [])

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    const now = new Date().toISOString()
    alertStore = {
      ...alertStore,
      activeAlerts: [],
      alertHistory: alertStore.alertHistory.map(alert => ({
        ...alert,
        resolved: true,
        resolvedAt: alert.resolvedAt || now
      }))
    }
    setAlerts({ ...alertStore })
  }, [])

  // Start monitoring
  const startMonitoring = useCallback(() => {
    alertStore = { ...alertStore, isMonitoring: true }
    setAlerts({ ...alertStore })
  }, [])

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    alertStore = { ...alertStore, isMonitoring: false }
    setAlerts({ ...alertStore })
  }, [])

  // Set up interval for checking alerts
  useEffect(() => {
    if (!enabled || !alerts.isMonitoring) return

    const interval = setInterval(checkAlertRules, checkIntervalMs)
    
    // Initial check
    checkAlertRules()

    return () => clearInterval(interval)
  }, [enabled, alerts.isMonitoring, checkAlertRules, checkIntervalMs])

  // Auto-start monitoring when rules are available
  useEffect(() => {
    if (enabled && alertRules.length > 0 && !alerts.isMonitoring) {
      startMonitoring()
    }
  }, [enabled, alertRules.length, alerts.isMonitoring, startMonitoring])

  return {
    // State
    alerts: alerts.activeAlerts,
    alertHistory: alerts.alertHistory,
    isMonitoring: alerts.isMonitoring,
    lastCheckTime: alerts.lastCheckTime,
    lastError,
    
    // Actions
    acknowledgeAlert,
    resolveAlert,
    clearAllAlerts,
    startMonitoring,
    stopMonitoring,
    checkAlertRules,
    
    // Computed values
    criticalAlerts: alerts.activeAlerts.filter(a => a.severity === 'critical'),
    highAlerts: alerts.activeAlerts.filter(a => a.severity === 'high'),
    unacknowledgedAlerts: alerts.activeAlerts.filter(a => !a.acknowledged),
    totalActiveAlerts: alerts.activeAlerts.length
  }
}