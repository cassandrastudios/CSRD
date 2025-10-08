'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell as PieCell,
} from 'recharts';
import {
  Search,
  Filter,
  Upload,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Simple types for the existing schema
interface SimpleESRSTopic {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  created_at: string;
}

interface SimpleMaterialityAssessment {
  id: string;
  organization_id: string;
  esrs_topic_id: number;
  impact_materiality: number;
  financial_materiality: number;
  created_at: string;
  updated_at: string;
}

export function MaterialityAssessmentSimple() {
  // State management
  const [topics, setTopics] = useState<SimpleESRSTopic[]>([]);
  const [assessments, setAssessments] = useState<SimpleMaterialityAssessment[]>(
    []
  );

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<SimpleESRSTopic | null>(
    null
  );
  const [activeTab, setActiveTab] = useState('overview');

  const supabase = createClient();
  const debouncedUpdate = useRef<NodeJS.Timeout>();

  // Fetch all data
  useEffect(() => {
    fetchData();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debouncedUpdate.current) {
        clearTimeout(debouncedUpdate.current);
      }
    };
  }, []);

  const fetchData = async () => {
    try {
      const [topicsResult, assessmentsResult] = await Promise.all([
        supabase.from('esrs_topics').select('*').order('code'),
        supabase.from('materiality_assessments').select('*'),
      ]);

      if (topicsResult.error) throw topicsResult.error;
      if (assessmentsResult.error) throw assessmentsResult.error;

      const topicsData = topicsResult.data || [];
      const assessmentsData = assessmentsResult.data || [];

      // If no topics exist, populate them
      if (topicsData.length === 0) {
        console.log('No ESRS topics found, populating sample data...');
        try {
          const response = await fetch('/api/populate-esrs-topics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Successfully populated ESRS topics:', result.message);

            // Fetch topics again after populating
            const { data: newTopicsData, error: newTopicsError } =
              await supabase.from('esrs_topics').select('*').order('code');

            if (newTopicsError) throw newTopicsError;
            setTopics(newTopicsData || []);
          } else {
            console.error('Failed to populate ESRS topics');
            setTopics([]);
          }
        } catch (populateError) {
          console.error('Error populating ESRS topics:', populateError);
          setTopics([]);
        }
      } else {
        setTopics(topicsData);
      }

      setAssessments(assessmentsData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Debounced update function
  const updateAssessment = useCallback(
    (topicId: number, impact: number, financial: number) => {
      if (debouncedUpdate.current) {
        clearTimeout(debouncedUpdate.current);
      }

      // Update local state immediately
      setAssessments(prev => {
        const existing = prev.find(a => a.esrs_topic_id === topicId);
        if (existing) {
          return prev.map(a =>
            a.esrs_topic_id === topicId
              ? {
                  ...a,
                  impact_materiality: impact,
                  financial_materiality: financial,
                }
              : a
          );
        } else {
          return [
            ...prev,
            {
              id: '',
              organization_id: '',
              esrs_topic_id: topicId,
              impact_materiality: impact,
              financial_materiality: financial,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ];
        }
      });

      // Debounce database update
      debouncedUpdate.current = setTimeout(async () => {
        setSaving(true);
        try {
          const { error } = await supabase
            .from('materiality_assessments')
            .upsert({
              esrs_topic_id: topicId,
              impact_materiality: impact,
              financial_materiality: financial,
            });

          if (error) throw error;
          toast.success('Assessment saved');
        } catch (error: any) {
          toast.error('Failed to save assessment: ' + error.message);
        } finally {
          setSaving(false);
        }
      }, 1000);
    },
    [supabase]
  );

  const getAssessment = (topicId: number) => {
    return assessments.find(a => a.esrs_topic_id === topicId);
  };

  // Filter topics based on search and category
  const filteredTopics = topics.filter(topic => {
    if (!topic || !topic.name || !topic.description || !topic.code)
      return false;
    const matchesSearch =
      topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate progress
  const progress =
    topics.length > 0 ? (assessments.length / topics.length) * 100 : 0;

  // Prepare data for visualizations
  const scatterData = assessments.map(assessment => {
    const topic = topics.find(t => t.id === assessment.esrs_topic_id);
    return {
      name: topic?.name || 'Unknown',
      code: topic?.code || '',
      impact: assessment.impact_materiality,
      financial: assessment.financial_materiality,
      category: topic?.category || 'Unknown',
    };
  });

  const categoryData = topics.reduce(
    (acc, topic) => {
      const category = topic.category;
      if (!acc[category]) {
        acc[category] = { total: 0, assessed: 0 };
      }
      acc[category].total++;
      if (assessments.find(a => a.esrs_topic_id === topic.id)) {
        acc[category].assessed++;
      }
      return acc;
    },
    {} as Record<string, { total: number; assessed: number }>
  );

  const categoryChartData = Object.entries(categoryData).map(
    ([category, data]) => ({
      category,
      assessed: data.assessed,
      remaining: data.total - data.assessed,
    })
  );

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (topics.length === 0) {
    return (
      <Layout>
        <div className="p-8">
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No ESRS Topics Found
                </h3>
                <p className="text-gray-500 mb-4">
                  The ESRS topics database appears to be empty.
                </p>
                <Button onClick={fetchData}>Retry Loading</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Materiality Assessment</h1>
            <p className="text-gray-600 mt-2">
              ESRS materiality assessment with double materiality scoring
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <Share2 className="w-4 h-4 mr-2" />
              Share Assessment
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Assessment Progress
              {saving && (
                <div className="flex items-center text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Saving...
                </div>
              )}
            </CardTitle>
            <CardDescription>
              Complete the materiality assessment for all ESRS topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round(progress)}%
                </div>
                <div className="text-sm text-gray-500">Overall Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {assessments.length}
                </div>
                <div className="text-sm text-gray-500">Topics Assessed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {
                    assessments.filter(
                      a =>
                        a.impact_materiality >= 3 ||
                        a.financial_materiality >= 3
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-500">Material Topics</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {topics.length}
                </div>
                <div className="text-sm text-gray-500">Total Topics</div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Topic List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>ESRS Topics</CardTitle>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search topics..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['All', 'Environmental', 'Social', 'Governance'].map(
                      category => (
                        <Button
                          key={category}
                          variant={
                            selectedCategory === category
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {filteredTopics.map(topic => {
                    const assessment = getAssessment(topic.id);
                    const isMaterial =
                      assessment &&
                      (assessment.impact_materiality >= 3 ||
                        assessment.financial_materiality >= 3);

                    return (
                      <div
                        key={topic.id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                          selectedTopic?.id === topic.id
                            ? 'bg-blue-50 border-blue-200'
                            : ''
                        }`}
                        onClick={() => setSelectedTopic(topic)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{topic.name}</div>
                            <div className="text-sm text-gray-500">
                              {topic.code}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {assessment && (
                              <Badge
                                variant={isMaterial ? 'default' : 'secondary'}
                              >
                                {isMaterial ? 'Material' : 'Not Material'}
                              </Badge>
                            )}
                            {assessment ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Topic Details */}
          <div className="lg:col-span-2">
            {selectedTopic ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedTopic.name}</CardTitle>
                      <CardDescription>
                        {selectedTopic.code} - {selectedTopic.category}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{selectedTopic.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="scoring">Scoring</TabsTrigger>
                      <TabsTrigger value="reports">Reports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Description</h3>
                        <p className="text-gray-600">
                          {selectedTopic.description}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="scoring" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium mb-4">
                            Impact Materiality
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            How your organization affects the environment,
                            people, and society
                          </p>
                          <div className="space-y-2">
                            <label className="text-sm">
                              Impact Level:{' '}
                              {getAssessment(selectedTopic.id)
                                ?.impact_materiality || 1}
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={
                                getAssessment(selectedTopic.id)
                                  ?.impact_materiality || 1
                              }
                              onChange={e =>
                                updateAssessment(
                                  selectedTopic.id,
                                  parseInt(e.target.value),
                                  getAssessment(selectedTopic.id)
                                    ?.financial_materiality || 1
                                )
                              }
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Low (1)</span>
                              <span>High (5)</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-4">
                            Financial Materiality
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            How sustainability issues affect your organization
                            financially and operationally
                          </p>
                          <div className="space-y-2">
                            <label className="text-sm">
                              Financial Level:{' '}
                              {getAssessment(selectedTopic.id)
                                ?.financial_materiality || 1}
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={
                                getAssessment(selectedTopic.id)
                                  ?.financial_materiality || 1
                              }
                              onChange={e =>
                                updateAssessment(
                                  selectedTopic.id,
                                  getAssessment(selectedTopic.id)
                                    ?.impact_materiality || 1,
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Low (1)</span>
                              <span>High (5)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h3 className="font-medium mb-4">Materiality Matrix</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart data={scatterData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                type="number"
                                dataKey="financial"
                                name="Financial Materiality"
                                domain={[0, 5]}
                                tickCount={6}
                              />
                              <YAxis
                                type="number"
                                dataKey="impact"
                                name="Impact Materiality"
                                domain={[0, 5]}
                                tickCount={6}
                              />
                              <Tooltip
                                formatter={(value, name, props) => [
                                  value,
                                  name === 'impact'
                                    ? 'Impact Materiality'
                                    : 'Financial Materiality',
                                ]}
                                labelFormatter={(label, props) =>
                                  `${(props as any).payload?.name} (${(props as any).payload?.code})`
                                }
                              />
                              <Scatter dataKey="impact" fill="#8884d8">
                                {scatterData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      entry.impact >= 4 || entry.financial >= 4
                                        ? '#ef4444'
                                        : entry.impact >= 3 ||
                                            entry.financial >= 3
                                          ? '#f59e0b'
                                          : '#10b981'
                                    }
                                  />
                                ))}
                              </Scatter>
                            </ScatterChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-4">
                      <h3 className="font-medium">Assessment Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">
                              Progress by Category
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-32">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryChartData}>
                                  <XAxis dataKey="category" />
                                  <YAxis />
                                  <Tooltip />
                                  <Bar dataKey="assessed" fill="#3b82f6" />
                                  <Bar dataKey="remaining" fill="#e5e7eb" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">
                              Materiality Distribution
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Material Topics</span>
                                <span className="font-medium">
                                  {
                                    assessments.filter(
                                      a =>
                                        a.impact_materiality >= 3 ||
                                        a.financial_materiality >= 3
                                    ).length
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Non-Material Topics</span>
                                <span className="font-medium">
                                  {
                                    assessments.filter(
                                      a =>
                                        a.impact_materiality < 3 &&
                                        a.financial_materiality < 3
                                    ).length
                                  }
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a Topic
                    </h3>
                    <p className="text-gray-500">
                      Choose an ESRS topic from the list to view details and
                      begin assessment
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
