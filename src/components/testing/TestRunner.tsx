
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TestTube, Play, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  duration: number;
  error?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
}

const TestRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      name: 'Component Tests',
      tests: [
        { name: 'OrderForm renders correctly', status: 'pending', duration: 0 },
        { name: 'Portfolio displays positions', status: 'pending', duration: 0 },
        { name: 'Trading chart loads data', status: 'pending', duration: 0 },
        { name: 'Order book updates', status: 'pending', duration: 0 }
      ]
    },
    {
      name: 'Service Tests',
      tests: [
        { name: 'API connection test', status: 'pending', duration: 0 },
        { name: 'WebSocket connectivity', status: 'pending', duration: 0 },
        { name: 'Order manager functionality', status: 'pending', duration: 0 },
        { name: 'Portfolio calculations', status: 'pending', duration: 0 }
      ]
    },
    {
      name: 'Integration Tests',
      tests: [
        { name: 'End-to-end order flow', status: 'pending', duration: 0 },
        { name: 'Real-time data updates', status: 'pending', duration: 0 },
        { name: 'Error handling', status: 'pending', duration: 0 }
      ]
    },
    {
      name: 'Performance Tests',
      tests: [
        { name: 'Component render performance', status: 'pending', duration: 0 },
        { name: 'Memory usage optimization', status: 'pending', duration: 0 },
        { name: 'Bundle size analysis', status: 'pending', duration: 0 }
      ]
    }
  ]);

  const runTests = async () => {
    setIsRunning(true);
    setProgress(0);

    const totalTests = testSuites.reduce((sum, suite) => sum + suite.tests.length, 0);
    let completedTests = 0;

    for (const suite of testSuites) {
      for (const test of suite.tests) {
        // Update test status to running
        setTestSuites(prev => prev.map(s => 
          s.name === suite.name 
            ? {
                ...s,
                tests: s.tests.map(t => 
                  t.name === test.name 
                    ? { ...t, status: 'running' as const }
                    : t
                )
              }
            : s
        ));

        // Simulate test execution
        const testDuration = Math.random() * 2000 + 500; // 0.5-2.5 seconds
        await new Promise(resolve => setTimeout(resolve, testDuration));

        // Simulate test results (mostly pass, some fail)
        const passed = Math.random() > 0.15; // 85% pass rate
        const status = passed ? 'passed' : 'failed';
        const error = !passed ? 'Test failed: Mock error for demonstration' : undefined;

        // Update test result
        setTestSuites(prev => prev.map(s => 
          s.name === suite.name 
            ? {
                ...s,
                tests: s.tests.map(t => 
                  t.name === test.name 
                    ? { ...t, status, duration: testDuration, error }
                    : t
                )
              }
            : s
        ));

        completedTests++;
        setProgress((completedTests / totalTests) * 100);
      }
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge variant="default" className="text-xs">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-xs">Failed</Badge>;
      case 'running':
        return <Badge variant="secondary" className="text-xs">Running</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Pending</Badge>;
    }
  };

  const getTotalStats = () => {
    const allTests = testSuites.flatMap(suite => suite.tests);
    return {
      total: allTests.length,
      passed: allTests.filter(t => t.status === 'passed').length,
      failed: allTests.filter(t => t.status === 'failed').length,
      pending: allTests.filter(t => t.status === 'pending').length
    };
  };

  const stats = getTotalStats();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Test Runner
            </CardTitle>
            <CardDescription>
              Automated testing suite for quality assurance
            </CardDescription>
          </div>
          <Button
            onClick={runTests}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Test Progress</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="p-3 border rounded-lg">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="text-2xl font-bold text-green-500">{stats.passed}</div>
            <div className="text-xs text-muted-foreground">Passed</div>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="text-2xl font-bold text-gray-400">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
        </div>

        <ScrollArea className="h-96">
          <div className="space-y-4">
            {testSuites.map((suite, suiteIndex) => (
              <div key={suiteIndex} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">{suite.name}</h3>
                <div className="space-y-2">
                  {suite.tests.map((test, testIndex) => (
                    <div key={testIndex} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(test.status)}
                        <span className="text-sm">{test.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {test.duration > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {(test.duration / 1000).toFixed(2)}s
                          </span>
                        )}
                        {getStatusBadge(test.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TestRunner;
