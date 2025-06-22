
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, FileText, Activity, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface ComplianceRule {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'compliant' | 'warning' | 'violation';
  threshold: number;
  currentValue: number;
  lastChecked: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface RegulatoryReport {
  type: string;
  frequency: string;
  nextDue: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  completeness: number;
}

const complianceRules: ComplianceRule[] = [
  {
    id: '1',
    name: 'Position Concentration Limit',
    category: 'Risk Management',
    description: 'No single position exceeds 10% of portfolio',
    status: 'compliant',
    threshold: 10,
    currentValue: 8.5,
    lastChecked: '2024-01-15 09:30:00',
    severity: 'high'
  },
  {
    id: '2',
    name: 'Sector Concentration',
    category: 'Diversification',
    description: 'No sector exceeds 40% allocation',
    status: 'warning',
    threshold: 40,
    currentValue: 38.2,
    lastChecked: '2024-01-15 09:30:00',
    severity: 'medium'
  },
  {
    id: '3',
    name: 'Leverage Ratio',
    category: 'Risk Management',
    description: 'Total leverage below 2:1',
    status: 'compliant',
    threshold: 200,
    currentValue: 145,
    lastChecked: '2024-01-15 09:30:00',
    severity: 'critical'
  },
  {
    id: '4',
    name: 'Liquidity Requirement',
    category: 'Liquidity',
    description: 'Minimum 5% cash reserves',
    status: 'violation',
    threshold: 5,
    currentValue: 3.2,
    lastChecked: '2024-01-15 09:30:00',
    severity: 'high'
  },
  {
    id: '5',
    name: 'Daily VaR Limit',
    category: 'Risk Management',
    description: 'Daily VaR below 3% of portfolio',
    status: 'compliant',
    threshold: 3,
    currentValue: 2.2,
    lastChecked: '2024-01-15 09:30:00',
    severity: 'high'
  }
];

const regulatoryReports: RegulatoryReport[] = [
  {
    type: 'Form PF',
    frequency: 'Quarterly',
    nextDue: '2024-02-15',
    status: 'pending',
    completeness: 75
  },
  {
    type: 'Form ADV',
    frequency: 'Annual',
    nextDue: '2024-03-30',
    status: 'pending',
    completeness: 20
  },
  {
    type: '13F Holdings',
    frequency: 'Quarterly',
    nextDue: '2024-02-14',
    status: 'submitted',
    completeness: 100
  },
  {
    type: 'Risk Assessment',
    frequency: 'Monthly',
    nextDue: '2024-01-31',
    status: 'approved',
    completeness: 100
  }
];

const violationHistory = [
  { date: '2024-01-01', violations: 0, warnings: 2 },
  { date: '2024-01-02', violations: 1, warnings: 1 },
  { date: '2024-01-03', violations: 0, warnings: 3 },
  { date: '2024-01-04', violations: 2, warnings: 1 },
  { date: '2024-01-05', violations: 0, warnings: 2 },
  { date: '2024-01-06', violations: 1, warnings: 1 },
  { date: '2024-01-07', violations: 0, warnings: 1 }
];

const complianceScore = [
  { category: 'Risk Management', score: 92, maxScore: 100 },
  { category: 'Liquidity', score: 78, maxScore: 100 },
  { category: 'Diversification', score: 85, maxScore: 100 },
  { category: 'Regulatory', score: 96, maxScore: 100 },
  { category: 'Operational', score: 89, maxScore: 100 }
];

export function ComplianceMonitor() {
  const [selectedRule, setSelectedRule] = useState<string | null>(null);

  const totalRules = complianceRules.length;
  const compliantRules = complianceRules.filter(rule => rule.status === 'compliant').length;
  const warningRules = complianceRules.filter(rule => rule.status === 'warning').length;
  const violationRules = complianceRules.filter(rule => rule.status === 'violation').length;
  
  const overallScore = Math.round((compliantRules / totalRules) * 100);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'violation':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'violation':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overallScore}%
            </div>
            <p className="text-xs text-muted-foreground">
              {compliantRules}/{totalRules} rules compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Compliant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {compliantRules}
            </div>
            <p className="text-xs text-muted-foreground">
              Rules in compliance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {warningRules}
            </div>
            <p className="text-xs text-muted-foreground">
              Rules with warnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {violationRules}
            </div>
            <p className="text-xs text-muted-foreground">
              Active violations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {(warningRules > 0 || violationRules > 0) && (
        <div className="space-y-2">
          {complianceRules
            .filter(rule => rule.status !== 'compliant')
            .map((rule) => (
              <Alert key={rule.id} variant={rule.status === 'violation' ? 'destructive' : 'default'}>
                {getStatusIcon(rule.status)}
                <AlertDescription className="ml-2">
                  <strong>{rule.name}:</strong> {rule.description} 
                  (Current: {rule.currentValue}%, Threshold: {rule.threshold}%)
                </AlertDescription>
              </Alert>
            ))}
        </div>
      )}

      {/* Detailed Compliance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Compliance Dashboard
          </CardTitle>
          <CardDescription>
            Monitor regulatory compliance and risk management rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="rules" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="rules">Compliance Rules</TabsTrigger>
              <TabsTrigger value="reports">Regulatory Reports</TabsTrigger>
              <TabsTrigger value="history">Violation History</TabsTrigger>
              <TabsTrigger value="scores">Compliance Scores</TabsTrigger>
            </TabsList>

            <TabsContent value="rules" className="space-y-4">
              <div className="space-y-3">
                {complianceRules.map((rule) => (
                  <div key={rule.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(rule.status)}
                        <div>
                          <h4 className="font-semibold">{rule.name}</h4>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusColor(rule.status)}>
                          {rule.status.toUpperCase()}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {rule.category}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Current Value</div>
                        <div className="font-medium">
                          {rule.currentValue}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Threshold</div>
                        <div className="font-medium">
                          {rule.threshold}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Severity</div>
                        <div className="font-medium capitalize">
                          {rule.severity}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Last Checked</div>
                        <div className="font-medium">
                          {new Date(rule.lastChecked).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Utilization</span>
                        <span>{((rule.currentValue / rule.threshold) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={(rule.currentValue / rule.threshold) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="space-y-3">
                {regulatoryReports.map((report, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{report.type}</h4>
                        <p className="text-sm text-muted-foreground">
                          {report.frequency} filing • Due: {report.nextDue}
                        </p>
                      </div>
                      <Badge variant={
                        report.status === 'approved' ? 'default' :
                        report.status === 'submitted' ? 'secondary' :
                        report.status === 'rejected' ? 'destructive' : 'outline'
                      }>
                        {report.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completion Progress</span>
                        <span>{report.completeness}%</span>
                      </div>
                      <Progress value={report.completeness} className="h-2" />
                    </div>

                    {report.status === 'pending' && report.completeness < 100 && (
                      <Button variant="outline" size="sm" className="mt-3">
                        <FileText className="w-4 h-4 mr-2" />
                        Continue Filing
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={violationHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="violations" stroke="#ef4444" strokeWidth={2} name="Violations" />
                    <Line type="monotone" dataKey="warnings" stroke="#f59e0b" strokeWidth={2} name="Warnings" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">4</div>
                  <div className="text-sm text-muted-foreground">Total Violations (7d)</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">11</div>
                  <div className="text-sm text-muted-foreground">Total Warnings (7d)</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">2.1</div>
                  <div className="text-sm text-muted-foreground">Avg Resolution Time (hrs)</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scores" className="space-y-4">
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={complianceScore}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {complianceScore.map((score) => (
                  <div key={score.category} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">{score.category}</h4>
                      <span className="text-lg font-bold">
                        {score.score}/{score.maxScore}
                      </span>
                    </div>
                    <Progress value={score.score} className="h-2" />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
