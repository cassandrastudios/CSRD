'use client';

import { Layout } from './layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  Database,
  FileText,
  CheckCircle,
  TrendingUp,
  Calendar,
  Users,
} from 'lucide-react';
import Link from 'next/link';

const milestones = [
  {
    id: 'materiality',
    title: 'Materiality Assessment',
    description: 'Identify and assess material ESG topics',
    progress: 0,
    icon: Target,
    href: '/materiality',
    status: 'not_started',
  },
  {
    id: 'data',
    title: 'Data Collection',
    description: 'Gather ESG metrics and evidence',
    progress: 0,
    icon: Database,
    href: '/data',
    status: 'not_started',
  },
  {
    id: 'report',
    title: 'Report Builder',
    description: 'Create CSRD-compliant report sections',
    progress: 0,
    icon: FileText,
    href: '/report',
    status: 'not_started',
  },
  {
    id: 'assurance',
    title: 'Assurance',
    description: 'Prepare for external assurance',
    progress: 0,
    icon: CheckCircle,
    href: '/compliance',
    status: 'not_started',
  },
  {
    id: 'publish',
    title: 'Publish',
    description: 'Submit final report to authorities',
    progress: 0,
    icon: TrendingUp,
    href: '/compliance',
    status: 'not_started',
  },
];

export function Dashboard() {
  const overallProgress = 0; // This would come from your data

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CSRD Co-Pilot</h1>
          <p className="text-gray-600 mt-2">
            Track your progress through the CSRD compliance journey
          </p>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Overall Progress
            </CardTitle>
            <CardDescription>
              Your CSRD compliance journey progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{overallProgress}%</span>
                <span className="text-sm text-gray-500">Complete</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Target completion: Q4 2024</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {milestones.map(milestone => (
            <Card
              key={milestone.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <milestone.icon className="h-8 w-8 text-blue-600" />
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      milestone.status === 'not_started'
                        ? 'bg-gray-100 text-gray-600'
                        : milestone.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {milestone.status === 'not_started'
                      ? 'Not Started'
                      : milestone.status === 'in_progress'
                        ? 'In Progress'
                        : 'Completed'}
                  </span>
                </div>
                <CardTitle className="text-lg">{milestone.title}</CardTitle>
                <CardDescription>{milestone.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{milestone.progress}%</span>
                    </div>
                    <Progress value={milestone.progress} className="h-2" />
                  </div>
                  <Link href={milestone.href}>
                    <Button
                      className="w-full"
                      disabled={milestone.status === 'not_started'}
                    >
                      {milestone.status === 'not_started'
                        ? 'Start Assessment'
                        : 'Continue'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to get started with CSRD compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/onboarding">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center"
                >
                  <Users className="h-6 w-6 mb-2" />
                  <span>Complete Onboarding</span>
                </Button>
              </Link>
              <Link href="/materiality">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center"
                >
                  <Target className="h-6 w-6 mb-2" />
                  <span>Start Materiality Assessment</span>
                </Button>
              </Link>
              <Link href="/data">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center"
                >
                  <Database className="h-6 w-6 mb-2" />
                  <span>Set Up Data Collection</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
