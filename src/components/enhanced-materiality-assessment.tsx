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
  ESRS_Topic,
  MaterialityAssessment,
  Stakeholder,
  StakeholderEngagement,
  EvidenceDocument,
  MaterialityRationale,
} from '@/types/database';
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

export function EnhancedMaterialityAssessment() {
  // State management
  const [topics, setTopics] = useState<ESRS_Topic[]>([]);
  const [assessments, setAssessments] = useState<MaterialityAssessment[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [engagements, setEngagements] = useState<StakeholderEngagement[]>([]);
  const [evidence, setEvidence] = useState<EvidenceDocument[]>([]);
  const [rationale, setRationale] = useState<MaterialityRationale[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<ESRS_Topic | null>(null);
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
      const [
        topicsResult,
        assessmentsResult,
        stakeholdersResult,
        engagementsResult,
        evidenceResult,
        rationaleResult,
      ] = await Promise.all([
        supabase
          .from('esrs_topics')
          .select('*')
          .eq('is_active', true)
          .order('code'),
        supabase.from('materiality_assessments').select('*'),
        supabase.from('stakeholders').select('*'),
        supabase.from('stakeholder_engagements').select('*'),
        supabase.from('evidence_documents').select('*'),
        supabase.from('materiality_rationale').select('*'),
      ]);

      if (topicsResult.error) throw topicsResult.error;
      if (assessmentsResult.error) throw assessmentsResult.error;
      if (stakeholdersResult.error) throw stakeholdersResult.error;
      if (engagementsResult.error) throw engagementsResult.error;
      if (evidenceResult.error) throw evidenceResult.error;
      if (rationaleResult.error) throw rationaleResult.error;

      setTopics(topicsResult.data || []);
      setAssessments(assessmentsResult.data || []);
      setStakeholders(stakeholdersResult.data || []);
      setEngagements(engagementsResult.data || []);
      setEvidence(evidenceResult.data || []);
      setRationale(rationaleResult.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Debounced update function
  const updateAssessment = useCallback(
    (topicId: number, insideOut: number, outsideIn: number) => {
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
                  inside_out_impact: insideOut,
                  outside_in_impact: outsideIn,
                  impact_materiality: insideOut,
                  financial_materiality: outsideIn,
                  materiality_status: calculateMaterialityStatus(
                    insideOut,
                    outsideIn
                  ),
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
              inside_out_impact: insideOut,
              outside_in_impact: outsideIn,
              impact_materiality: insideOut,
              financial_materiality: outsideIn,
              materiality_status: calculateMaterialityStatus(
                insideOut,
                outsideIn
              ),
              assessment_status: 'draft',
              last_reviewed_at: null,
              reviewed_by: null,
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
              inside_out_impact: insideOut,
              outside_in_impact: outsideIn,
              impact_materiality: insideOut,
              financial_materiality: outsideIn,
              materiality_status: calculateMaterialityStatus(
                insideOut,
                outsideIn
              ),
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

  const calculateMaterialityStatus = (
    insideOut: number,
    outsideIn: number
  ): 'not_material' | 'material' | 'highly_material' => {
    const avg = (insideOut + outsideIn) / 2;
    if (avg >= 4) return 'highly_material';
    if (avg >= 3) return 'material';
    return 'not_material';
  };

  const getAssessment = (topicId: number) => {
    return assessments.find(a => a.esrs_topic_id === topicId);
  };

  const getTopicEngagements = (topicId: number) => {
    return engagements.filter(e => e.esrs_topic_id === topicId);
  };

  const getTopicEvidence = (topicId: number) => {
    return evidence.filter(e => e.esrs_topic_id === topicId);
  };

  const getTopicRationale = (topicId: number) => {
    const assessment = getAssessment(topicId);
    if (!assessment) return null;
    return rationale.find(r => r.materiality_assessment_id === assessment.id);
  };

  // Filter topics based on search and category
  const filteredTopics = topics.filter(topic => {
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
      insideOut: assessment.inside_out_impact,
      outsideIn: assessment.outside_in_impact,
      category: topic?.category || 'Unknown',
      materiality: assessment.materiality_status,
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

  const materialityData = assessments.reduce(
    (acc, assessment) => {
      const status = assessment.materiality_status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const materialityChartData = Object.entries(materialityData).map(
    ([status, count]) => ({
      status: status.replace('_', ' ').toUpperCase(),
      count,
      color:
        status === 'highly_material'
          ? '#ef4444'
          : status === 'material'
            ? '#f59e0b'
            : '#10b981',
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

  return (
    <Layout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Materiality Assessment</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive ESRS materiality assessment with stakeholder
              engagement and evidence collection
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
                        a.materiality_status === 'material' ||
                        a.materiality_status === 'highly_material'
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-500">Material Topics</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {stakeholders.length}
                </div>
                <div className="text-sm text-gray-500">Stakeholders</div>
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
                      assessment?.materiality_status === 'material' ||
                      assessment?.materiality_status === 'highly_material';

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
                                {assessment.materiality_status.replace(
                                  '_',
                                  ' '
                                )}
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
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="scoring">Scoring</TabsTrigger>
                      <TabsTrigger value="stakeholders">
                        Stakeholders
                      </TabsTrigger>
                      <TabsTrigger value="evidence">Evidence</TabsTrigger>
                      <TabsTrigger value="reports">Reports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Description</h3>
                        <p className="text-gray-600">
                          {selectedTopic.description}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Subtopics</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedTopic.subtopics.map((subtopic, index) => (
                            <Badge key={index} variant="secondary">
                              {subtopic}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">
                          Key Performance Indicators
                        </h3>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {selectedTopic.kpis.map((kpi, index) => (
                            <li key={index}>{kpi}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">
                          Industry Benchmarks
                        </h3>
                        <div className="text-sm text-gray-600">
                          <p>
                            <strong>High Impact Sectors:</strong>{' '}
                            {selectedTopic.industry_benchmarks.high_impact_sectors.join(
                              ', '
                            )}
                          </p>
                          <p>
                            <strong>Benchmark Threshold:</strong>{' '}
                            {
                              selectedTopic.industry_benchmarks
                                .benchmark_threshold
                            }
                            /5
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="scoring" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium mb-4">
                            Inside-Out Impact
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            How your organization affects the environment,
                            people, and society
                          </p>
                          <div className="space-y-2">
                            <label className="text-sm">
                              Impact Level:{' '}
                              {getAssessment(selectedTopic.id)
                                ?.inside_out_impact || 1}
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={
                                getAssessment(selectedTopic.id)
                                  ?.inside_out_impact || 1
                              }
                              onChange={e =>
                                updateAssessment(
                                  selectedTopic.id,
                                  parseInt(e.target.value),
                                  getAssessment(selectedTopic.id)
                                    ?.outside_in_impact || 1
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
                            Outside-In Impact
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            How sustainability issues affect your organization
                            financially and operationally
                          </p>
                          <div className="space-y-2">
                            <label className="text-sm">
                              Impact Level:{' '}
                              {getAssessment(selectedTopic.id)
                                ?.outside_in_impact || 1}
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={
                                getAssessment(selectedTopic.id)
                                  ?.outside_in_impact || 1
                              }
                              onChange={e =>
                                updateAssessment(
                                  selectedTopic.id,
                                  getAssessment(selectedTopic.id)
                                    ?.inside_out_impact || 1,
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
                                dataKey="outsideIn"
                                name="Outside-In Impact"
                                domain={[0, 5]}
                                tickCount={6}
                              />
                              <YAxis
                                type="number"
                                dataKey="insideOut"
                                name="Inside-Out Impact"
                                domain={[0, 5]}
                                tickCount={6}
                              />
                              <Tooltip
                                formatter={(value, name, props) => [
                                  value,
                                  name === 'insideOut'
                                    ? 'Inside-Out Impact'
                                    : 'Outside-In Impact',
                                ]}
                                labelFormatter={(label, props) =>
                                  `${(props as any).payload?.name} (${(props as any).payload?.code})`
                                }
                              />
                              <Scatter dataKey="insideOut" fill="#8884d8">
                                {scatterData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      entry.materiality === 'highly_material'
                                        ? '#ef4444'
                                        : entry.materiality === 'material'
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

                    <TabsContent value="stakeholders" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Stakeholder Engagement</h3>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Engagement
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {getTopicEngagements(selectedTopic.id).map(
                          engagement => (
                            <div
                              key={engagement.id}
                              className="p-3 border rounded-lg"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">
                                    {engagement.engagement_type}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {engagement.activity_date}
                                  </div>
                                  {engagement.description && (
                                    <div className="text-sm mt-1">
                                      {engagement.description}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    Influence: {engagement.influence_on_scoring}
                                    /5
                                  </Badge>
                                  <Button size="sm" variant="ghost">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="evidence" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Evidence Collection</h3>
                        <Button size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Document
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {getTopicEvidence(selectedTopic.id).map(doc => (
                          <div key={doc.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">
                                  {doc.document_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {doc.document_type}
                                </div>
                                {doc.description && (
                                  <div className="text-sm mt-1">
                                    {doc.description}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {doc.document_type}
                                </Badge>
                                <Button size="sm" variant="ghost">
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-4">
                      <h3 className="font-medium">Assessment Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">
                              Materiality Status
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-32">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={materialityChartData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={40}
                                    dataKey="count"
                                  >
                                    {materialityChartData.map(
                                      (entry, index) => (
                                        <PieCell
                                          key={`cell-${index}`}
                                          fill={entry.color}
                                        />
                                      )
                                    )}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>

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
