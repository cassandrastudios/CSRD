import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  BarChart3, 
  Trophy, 
  Bell,
  Target,
  Clock,
  Zap,
  Award
} from 'lucide-react';

type StatsView = 'history' | 'statistics' | 'personal-bests' | 'reminders';

const Stats = () => {
  const [currentView, setCurrentView] = useState<StatsView>('history');
  const [currentStreak, setCurrentStreak] = useState(3);
  const [longestStreak, setLongestStreak] = useState(7);

  // Mock data for calendar
  const practiceDays = [
    '2024-01-01', '2024-01-02', '2024-01-03', '2024-01-05', '2024-01-06',
    '2024-01-08', '2024-01-09', '2024-01-10', '2024-01-12', '2024-01-13'
  ];

  // Mock statistics data
  const stats = {
    totalSessions: 45,
    totalTime: '12:30:45',
    averageHold: '2:15',
    longestHold: '4:32',
    weeklyGoal: 5,
    weeklyProgress: 3
  };

  // Mock personal bests
  const personalBests = [
    { category: 'Longest Hold', value: '4:32', date: '2024-01-15', type: 'time' },
    { category: 'Most Rounds', value: '12', date: '2024-01-10', type: 'number' },
    { category: 'Longest Session', value: '45:30', date: '2024-01-12', type: 'time' },
    { category: 'Weekly Streak', value: '7 days', date: '2024-01-08', type: 'streak' }
  ];

  const isStreakRewardEligible = currentStreak >= 7;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary-foreground mb-2">
          Stats & Progress
        </h1>
        <p className="text-muted-foreground">
          Track your journey and celebrate your achievements
        </p>
      </div>

      {/* Streak Reward Banner */}
      {isStreakRewardEligible && (
        <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Award className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold">🎉 Streak Reward Unlocked!</h3>
                <p className="text-yellow-100">
                  You've practiced for 7 days straight! Enjoy 7 days without ads as our token of appreciation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as StatsView)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="personal-bests">Personal Bests</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-6 h-6" />
                <span>Practice Calendar</span>
              </CardTitle>
              <CardDescription>
                Track your daily practice consistency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Calendar would go here - simplified for now */}
                <div className="grid grid-cols-7 gap-2 text-center">
                  {Array.from({ length: 31 }, (_, i) => {
                    const date = `2024-01-${String(i + 1).padStart(2, '0')}`;
                    const isPracticeDay = practiceDays.includes(date);
                    return (
                      <div
                        key={i}
                        className={`p-2 rounded ${
                          isPracticeDay 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Can you stay consistent for 7 days in a row?</strong><br />
                    Get 7 days without ads if you do! 🎁
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{currentStreak}</div>
                    <div className="text-sm text-muted-foreground">Current Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{longestStreak}</div>
                    <div className="text-sm text-muted-foreground">Longest Streak</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSessions}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTime}</div>
                <p className="text-xs text-muted-foreground">Training time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Hold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageHold}</div>
                <p className="text-xs text-muted-foreground">Per round</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Longest Hold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.longestHold}</div>
                <p className="text-xs text-muted-foreground">Personal best</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.weeklyProgress}/{stats.weeklyGoal}</div>
                <p className="text-xs text-muted-foreground">Sessions this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Consistency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">Practice rate</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="personal-bests" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {personalBests.map((best, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span>{best.category}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {best.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Achieved on {best.date}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-6 h-6" />
                <span>Practice Reminders</span>
              </CardTitle>
              <CardDescription>
                Set reminders to maintain your practice consistency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Daily Reminder Time</label>
                <div className="flex space-x-2">
                  <input 
                    type="time" 
                    className="px-3 py-2 border rounded-md"
                    defaultValue="18:00"
                  />
                  <Button>Set Reminder</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Weekly Goal</label>
                <div className="flex space-x-2">
                  <input 
                    type="number" 
                    className="px-3 py-2 border rounded-md w-20"
                    defaultValue="5"
                    min="1"
                    max="7"
                  />
                  <span className="flex items-center text-sm text-muted-foreground">sessions per week</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> Consistent daily practice is more effective than sporadic long sessions. 
                  Even 10-15 minutes daily can significantly improve your breath-hold capacity.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Stats;
