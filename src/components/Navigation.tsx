import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  BarChart3, 
  Settings, 
  Calendar,
  Target,
  BookOpen,
  Info,
  Zap
} from 'lucide-react';

type Section = 'train' | 'stats' | 'settings';

interface NavigationProps {
  currentSection: Section;
  onSectionChange: (section: Section) => void;
}

const Navigation = ({ currentSection, onSectionChange }: NavigationProps) => {
  const sections = [
    {
      id: 'train' as Section,
      title: 'Train',
      subtitle: 'Tables & Training Plans',
      icon: Play,
      color: 'bg-blue-500',
      description: 'O2/CO2 tables, custom tables, and training programs'
    },
    {
      id: 'stats' as Section,
      title: 'Stats & Progress',
      subtitle: 'Track Your Journey',
      icon: BarChart3,
      color: 'bg-green-500',
      description: 'History, statistics, and personal bests'
    },
    {
      id: 'settings' as Section,
      title: 'Settings & More',
      subtitle: 'Customize & Learn',
      icon: Settings,
      color: 'bg-purple-500',
      description: 'Settings, integrations, tips, and about'
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4 mb-8">
      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = currentSection === section.id;
        
        return (
          <Card 
            key={section.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              isActive ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
            }`}
            onClick={() => onSectionChange(section.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${section.color} text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-primary-foreground">
                    {section.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {section.subtitle}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {section.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default Navigation;
