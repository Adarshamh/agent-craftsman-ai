import { useState, useEffect, useCallback } from 'react'
import { useLogPerformance, useRecordSystemMetric } from './useMonitoring'

export interface PerformanceMetrics {
  memoryUsage: {
    used: number
    total: number
    percentage: number
  }
  cpuUsage: {
    mainThread: number
    longTasks: number
  }
  networkLatency: number
  frameRate: number
  loadTime: number
  domContentLoaded: number
}

export interface PerformanceAlert {
  id: string
  type: 'memory' | 'cpu' | 'network' | 'performance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  value: number
  threshold: number
  timestamp: Date
}

// Performance thresholds
const THRESHOLDS = {
  memory: { warning: 70, critical: 90 }, // percentage
  longTasks: { warning: 5, critical: 10 }, // count per minute
  networkLatency: { warning: 1000, critical: 3000 }, // ms
  frameRate: { warning: 30, critical: 20 }, // fps
  loadTime: { warning: 3000, critical: 5000 } // ms
}

export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  
  const logPerformance = useLogPerformance()
  const recordSystemMetric = useRecordSystemMetric()

  // Memory monitoring
  const getMemoryMetrics = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
        percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
      }
    }
    return { used: 0, total: 0, percentage: 0 }
  }, [])

  // CPU usage estimation through long tasks
  const [longTasksCount, setLongTasksCount] = useState(0)
  
  useEffect(() => {
    if (!isMonitoring) return

    let frameId: number
    let lastTime = performance.now()
    let frameCount = 0
    let currentFrameRate = 60

    // Frame rate monitoring
    const measureFrameRate = () => {
      const now = performance.now()
      frameCount++
      
      if (now - lastTime >= 1000) {
        currentFrameRate = Math.round((frameCount * 1000) / (now - lastTime))
        frameCount = 0
        lastTime = now
      }
      
      frameId = requestAnimationFrame(measureFrameRate)
    }

    // Long tasks observer for CPU usage estimation
    let longTaskObserver: PerformanceObserver | null = null
    if ('PerformanceObserver' in window) {
      try {
        longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          setLongTasksCount(prev => prev + entries.length)
        })
        longTaskObserver.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        console.warn('Long task observer not supported')
      }
    }

    // Network latency measurement
    const measureNetworkLatency = async () => {
      try {
        const start = performance.now()
        await fetch('/favicon.ico', { cache: 'no-cache' })
        return performance.now() - start
      } catch {
        return 0
      }
    }

    // Periodic metrics collection
    const collectMetrics = async () => {
      const memory = getMemoryMetrics()
      const latency = await measureNetworkLatency()
      
      // Get page load metrics
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0
      const domContentLoaded = navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0

      const newMetrics: PerformanceMetrics = {
        memoryUsage: memory,
        cpuUsage: {
          mainThread: Math.min(currentFrameRate / 60 * 100, 100), // Estimated based on frame rate
          longTasks: longTasksCount
        },
        networkLatency: latency,
        frameRate: currentFrameRate,
        loadTime,
        domContentLoaded
      }

      setMetrics(newMetrics)

      // Log to database
      logPerformance.mutate({
        operation_type: 'performance_monitoring',
        operation_name: 'system_metrics',
        duration_ms: 0,
        metadata: newMetrics
      })

      // Record individual metrics
      recordSystemMetric.mutate({
        metric_type: 'memory_usage',
        metric_name: 'memory_usage_percentage',
        value: memory.percentage,
        unit: 'percent',
        metadata: memory
      })

      recordSystemMetric.mutate({
        metric_type: 'frame_rate',
        metric_name: 'frame_rate',
        value: currentFrameRate,
        unit: 'fps',
        metadata: { frameRate: currentFrameRate }
      })

      // Check for alerts
      checkThresholds(newMetrics)
      
      // Reset long tasks counter
      setLongTasksCount(0)
    }

    measureFrameRate()
    collectMetrics()
    const interval = setInterval(collectMetrics, 5000) // Collect every 5 seconds

    return () => {
      cancelAnimationFrame(frameId)
      clearInterval(interval)
      if (longTaskObserver) {
        longTaskObserver.disconnect()
      }
    }
  }, [isMonitoring, getMemoryMetrics, logPerformance, recordSystemMetric, longTasksCount])

  // Alert system
  const checkThresholds = useCallback((metrics: PerformanceMetrics) => {
    const newAlerts: PerformanceAlert[] = []

    // Memory alerts
    if (metrics.memoryUsage.percentage > THRESHOLDS.memory.critical) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'memory',
        severity: 'critical',
        message: `Critical memory usage: ${metrics.memoryUsage.percentage}%`,
        value: metrics.memoryUsage.percentage,
        threshold: THRESHOLDS.memory.critical,
        timestamp: new Date()
      })
    } else if (metrics.memoryUsage.percentage > THRESHOLDS.memory.warning) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'memory',
        severity: 'medium',
        message: `High memory usage: ${metrics.memoryUsage.percentage}%`,
        value: metrics.memoryUsage.percentage,
        threshold: THRESHOLDS.memory.warning,
        timestamp: new Date()
      })
    }

    // CPU alerts (based on long tasks)
    if (metrics.cpuUsage.longTasks > THRESHOLDS.longTasks.critical) {
      newAlerts.push({
        id: `cpu-${Date.now()}`,
        type: 'cpu',
        severity: 'critical',
        message: `Critical CPU usage: ${metrics.cpuUsage.longTasks} long tasks detected`,
        value: metrics.cpuUsage.longTasks,
        threshold: THRESHOLDS.longTasks.critical,
        timestamp: new Date()
      })
    } else if (metrics.cpuUsage.longTasks > THRESHOLDS.longTasks.warning) {
      newAlerts.push({
        id: `cpu-${Date.now()}`,
        type: 'cpu',
        severity: 'medium',
        message: `High CPU usage: ${metrics.cpuUsage.longTasks} long tasks detected`,
        value: metrics.cpuUsage.longTasks,
        threshold: THRESHOLDS.longTasks.warning,
        timestamp: new Date()
      })
    }

    // Network alerts
    if (metrics.networkLatency > THRESHOLDS.networkLatency.critical) {
      newAlerts.push({
        id: `network-${Date.now()}`,
        type: 'network',
        severity: 'critical',
        message: `Critical network latency: ${Math.round(metrics.networkLatency)}ms`,
        value: metrics.networkLatency,
        threshold: THRESHOLDS.networkLatency.critical,
        timestamp: new Date()
      })
    } else if (metrics.networkLatency > THRESHOLDS.networkLatency.warning) {
      newAlerts.push({
        id: `network-${Date.now()}`,
        type: 'network',
        severity: 'medium',
        message: `High network latency: ${Math.round(metrics.networkLatency)}ms`,
        value: metrics.networkLatency,
        threshold: THRESHOLDS.networkLatency.warning,
        timestamp: new Date()
      })
    }

    // Frame rate alerts
    if (metrics.frameRate < THRESHOLDS.frameRate.critical) {
      newAlerts.push({
        id: `performance-${Date.now()}`,
        type: 'performance',
        severity: 'critical',
        message: `Critical frame rate: ${metrics.frameRate} FPS`,
        value: metrics.frameRate,
        threshold: THRESHOLDS.frameRate.critical,
        timestamp: new Date()
      })
    } else if (metrics.frameRate < THRESHOLDS.frameRate.warning) {
      newAlerts.push({
        id: `performance-${Date.now()}`,
        type: 'performance',
        severity: 'medium',
        message: `Low frame rate: ${metrics.frameRate} FPS`,
        value: metrics.frameRate,
        threshold: THRESHOLDS.frameRate.warning,
        timestamp: new Date()
      })
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 49)]) // Keep last 50 alerts
    }
  }, [])

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)
  }, [])

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
    setMetrics(null)
  }, [])

  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }, [])

  return {
    metrics,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearAlerts,
    dismissAlert,
    thresholds: THRESHOLDS
  }
}