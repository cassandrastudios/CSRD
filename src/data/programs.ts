import { TrainingProgram } from "@/types/training";

export const trainingPrograms: TrainingProgram[] = [
  {
    id: "beginner-4week",
    name: "Beginner Foundation",
    level: "beginner",
    description: "Perfect for those new to breath-hold training. Build your baseline and learn proper technique.",
    duration: "4 weeks",
    weeks: [
      {
        week: 1,
        goal: "Establish baseline and learn breathing technique",
        sessions: [
          {
            day: 1,
            type: "O2",
            table: {
              rounds: 6,
              holdTimes: [30, 35, 40, 45, 50, 55],
              restTimes: Array(6).fill(120),
            },
            notes: "Focus on relaxation during holds",
          },
          {
            day: 3,
            type: "CO2",
            table: {
              rounds: 6,
              holdTimes: Array(6).fill(45),
              restTimes: [120, 105, 90, 75, 60, 60],
            },
            notes: "Stay calm as rest time decreases",
          },
          {
            day: 5,
            type: "O2",
            table: {
              rounds: 6,
              holdTimes: [30, 40, 50, 60, 70, 75],
              restTimes: Array(6).fill(120),
            },
          },
        ],
      },
      {
        week: 2,
        goal: "Increase hold times gradually",
        sessions: [
          {
            day: 1,
            type: "O2",
            table: {
              rounds: 7,
              holdTimes: [40, 45, 50, 55, 60, 65, 70],
              restTimes: Array(7).fill(120),
            },
          },
          {
            day: 3,
            type: "CO2",
            table: {
              rounds: 7,
              holdTimes: Array(7).fill(60),
              restTimes: [120, 105, 90, 75, 60, 45, 45],
            },
          },
          {
            day: 5,
            type: "O2",
            table: {
              rounds: 7,
              holdTimes: [45, 55, 65, 75, 85, 90, 90],
              restTimes: Array(7).fill(120),
            },
          },
        ],
      },
      {
        week: 3,
        goal: "Push past initial comfort zone",
        sessions: [
          {
            day: 1,
            type: "O2",
            table: {
              rounds: 8,
              holdTimes: [50, 55, 60, 70, 80, 90, 95, 100],
              restTimes: Array(8).fill(120),
            },
          },
          {
            day: 3,
            type: "CO2",
            table: {
              rounds: 8,
              holdTimes: Array(8).fill(75),
              restTimes: [120, 105, 90, 75, 60, 45, 30, 30],
            },
            notes: "CO2 tolerance is building",
          },
          {
            day: 5,
            type: "O2",
            table: {
              rounds: 8,
              holdTimes: [60, 70, 80, 90, 100, 105, 110, 110],
              restTimes: Array(8).fill(120),
            },
          },
        ],
      },
      {
        week: 4,
        goal: "Consolidate gains and test limits",
        sessions: [
          {
            day: 1,
            type: "O2",
            table: {
              rounds: 8,
              holdTimes: [60, 75, 90, 105, 115, 120, 120, 120],
              restTimes: Array(8).fill(150),
            },
            notes: "Longer rest - focus on max holds",
          },
          {
            day: 3,
            type: "CO2",
            table: {
              rounds: 8,
              holdTimes: Array(8).fill(90),
              restTimes: [120, 105, 90, 75, 60, 45, 30, 30],
            },
          },
          {
            day: 5,
            type: "O2",
            table: {
              rounds: 8,
              holdTimes: [70, 85, 100, 115, 125, 130, 135, 135],
              restTimes: Array(8).fill(150),
            },
            notes: "Final test - aim for personal best!",
          },
        ],
      },
    ],
  },
  {
    id: "intermediate-6week",
    name: "Intermediate Progression",
    level: "intermediate",
    description: "For those comfortable with 2+ minute holds. Build endurance and mental toughness.",
    duration: "6 weeks",
    weeks: [
      {
        week: 1,
        goal: "Establish 2-minute baseline",
        sessions: [
          {
            day: 1,
            type: "O2",
            table: {
              rounds: 8,
              holdTimes: [90, 100, 110, 120, 130, 140, 145, 150],
              restTimes: Array(8).fill(120),
            },
          },
          {
            day: 3,
            type: "CO2",
            table: {
              rounds: 8,
              holdTimes: Array(8).fill(120),
              restTimes: [120, 105, 90, 75, 60, 45, 30, 30],
            },
          },
          {
            day: 5,
            type: "O2",
            table: {
              rounds: 8,
              holdTimes: [100, 115, 130, 145, 155, 160, 165, 165],
              restTimes: Array(8).fill(120),
            },
          },
        ],
      },
      {
        week: 2,
        goal: "Extend maximum hold capacity",
        sessions: [
          {
            day: 1,
            type: "O2",
            table: {
              rounds: 8,
              holdTimes: [100, 120, 135, 150, 165, 175, 180, 180],
              restTimes: Array(8).fill(150),
            },
          },
          {
            day: 3,
            type: "CO2",
            table: {
              rounds: 8,
              holdTimes: Array(8).fill(135),
              restTimes: [120, 100, 80, 60, 45, 30, 20, 20],
            },
          },
          {
            day: 5,
            type: "O2",
            table: {
              rounds: 8,
              holdTimes: [110, 130, 150, 165, 180, 190, 195, 200],
              restTimes: Array(8).fill(150),
            },
          },
        ],
      },
      {
        week: 3,
        goal: "Mental toughness - short rest periods",
        sessions: [
          {
            day: 1,
            type: "CO2",
            table: {
              rounds: 10,
              holdTimes: Array(10).fill(120),
              restTimes: [100, 90, 80, 70, 60, 50, 40, 30, 25, 25],
            },
            notes: "Challenge week - embrace discomfort",
          },
          {
            day: 3,
            type: "O2",
            table: {
              rounds: 8,
              holdTimes: [120, 140, 160, 175, 190, 200, 205, 210],
              restTimes: Array(8).fill(150),
            },
          },
          {
            day: 5,
            type: "CO2",
            table: {
              rounds: 10,
              holdTimes: Array(10).fill(135),
              restTimes: [100, 90, 80, 70, 60, 50, 40, 30, 25, 20],
            },
          },
        ],
      },
      {
        week: 4,
        goal: "Recovery and consolidation",
        sessions: [
          {
            day: 1,
            type: "O2",
            table: {
              rounds: 6,
              holdTimes: [120, 150, 165, 180, 195, 195],
              restTimes: Array(6).fill(180),
            },
            notes: "Lighter week - quality over quantity",
          },
          {
            day: 4,
            type: "CO2",
            table: {
              rounds: 6,
              holdTimes: Array(6).fill(120),
              restTimes: [120, 90, 75, 60, 45, 45],
            },
          },
        ],
      },
      {
        week: 5,
        goal: "Push to 3+ minutes",
        sessions: [
          {
            day: 1,
            type: "O2",
            table: {
              rounds: 8,
              holdTimes: [120, 150, 170, 185, 200, 215, 225, 230],
              restTimes: Array(8).fill(180),
            },
          },
          {
            day: 3,
            type: "CO2",
            table: {
              rounds: 8,
              holdTimes: Array(8).fill(150),
              restTimes: [120, 105, 90, 75, 60, 45, 30, 30],
            },
          },
          {
            day: 5,
            type: "O2",
            table: {
              rounds: 8,
              holdTimes: [135, 165, 185, 200, 220, 235, 245, 250],
              restTimes: Array(8).fill(180),
            },
          },
        ],
      },
      {
        week: 6,
        goal: "Test maximum capacity",
        sessions: [
          {
            day: 1,
            type: "O2",
            table: {
              rounds: 8,
              holdTimes: [150, 175, 195, 215, 235, 250, 260, 270],
              restTimes: Array(8).fill(210),
            },
            notes: "Peak week - give it everything!",
          },
          {
            day: 3,
            type: "CO2",
            table: {
              rounds: 10,
              holdTimes: Array(10).fill(150),
              restTimes: [120, 105, 90, 75, 60, 45, 30, 25, 20, 20],
            },
          },
          {
            day: 5,
            type: "O2",
            table: {
              rounds: 8,
              holdTimes: [165, 190, 210, 230, 250, 270, 285, 300],
              restTimes: Array(8).fill(240),
            },
            notes: "Final challenge - 5 minute goal!",
          },
        ],
      },
    ],
  },
  {
    id: "advanced-8week",
    name: "Advanced Mastery",
    level: "advanced",
    description: "Elite training for 3+ minute holders. Push your limits and achieve extraordinary breath control.",
    duration: "8 weeks",
    weeks: [
      {
        week: 1,
        goal: "Baseline assessment at advanced level",
        sessions: [
          {
            day: 1,
            type: "O2",
            table: {
              rounds: 8,
              holdTimes: [180, 200, 220, 240, 260, 275, 285, 300],
              restTimes: Array(8).fill(180),
            },
          },
          {
            day: 3,
            type: "CO2",
            table: {
              rounds: 10,
              holdTimes: Array(10).fill(180),
              restTimes: [120, 105, 90, 75, 60, 45, 30, 25, 20, 20],
            },
          },
          {
            day: 5,
            type: "O2",
            table: {
              rounds: 8,
              holdTimes: [195, 220, 245, 265, 285, 300, 315, 330],
              restTimes: Array(8).fill(180),
            },
          },
        ],
      },
      {
        week: 2,
        goal: "Build 4-minute capacity",
        sessions: [
          {
            day: 1,
            type: "O2",
            table: {
              rounds: 10,
              holdTimes: [180, 210, 230, 250, 270, 285, 300, 315, 330, 345],
              restTimes: Array(10).fill(210),
            },
          },
          {
            day: 3,
            type: "CO2",
            table: {
              rounds: 10,
              holdTimes: Array(10).fill(200),
              restTimes: [120, 105, 90, 75, 60, 45, 30, 25, 20, 15],
            },
          },
          {
            day: 5,
            type: "O2",
            table: {
              rounds: 10,
              holdTimes: [200, 230, 255, 275, 295, 315, 335, 355, 370, 380],
              restTimes: Array(10).fill(210),
            },
          },
        ],
      },
      {
        week: 3,
        goal: "Extreme CO2 tolerance",
        sessions: [
          {
            day: 1,
            type: "CO2",
            table: {
              rounds: 12,
              holdTimes: Array(12).fill(180),
              restTimes: [120, 105, 90, 75, 60, 45, 35, 30, 25, 20, 15, 15],
            },
            notes: "Mental warfare - stay strong",
          },
          {
            day: 3,
            type: "O2",
            table: {
              rounds: 8,
              holdTimes: [210, 245, 275, 300, 330, 360, 380, 400],
              restTimes: Array(8).fill(240),
            },
          },
          {
            day: 5,
            type: "CO2",
            table: {
              rounds: 12,
              holdTimes: Array(12).fill(200),
              restTimes: [100, 90, 80, 70, 60, 50, 40, 30, 25, 20, 15, 15],
            },
          },
        ],
      },
      // Weeks 4-8 continue with progressive overload
      {
        week: 4,
        goal: "Recovery and adaptation",
        sessions: [
          {
            day: 1,
            type: "O2",
            table: {
              rounds: 6,
              holdTimes: [200, 240, 280, 320, 340, 360],
              restTimes: Array(6).fill(240),
            },
            notes: "Deload week - focus on technique",
          },
          {
            day: 4,
            type: "CO2",
            table: {
              rounds: 6,
              holdTimes: Array(6).fill(180),
              restTimes: [120, 90, 75, 60, 45, 45],
            },
          },
        ],
      },
      {
        week: 5,
        goal: "5-minute threshold training",
        sessions: [
          {
            day: 1,
            type: "O2",
            table: {
              rounds: 10,
              holdTimes: [220, 260, 285, 310, 340, 370, 400, 425, 450, 470],
              restTimes: Array(10).fill(270),
            },
          },
          {
            day: 3,
            type: "CO2",
            table: {
              rounds: 10,
              holdTimes: Array(10).fill(220),
              restTimes: [120, 100, 85, 70, 55, 40, 30, 25, 20, 15],
            },
          },
          {
            day: 5,
            type: "O2",
            table: {
              rounds: 10,
              holdTimes: [240, 280, 310, 345, 375, 405, 435, 460, 485, 500],
              restTimes: Array(10).fill(270),
            },
          },
        ],
      },
      {
        week: 6,
        goal: "Extreme endurance",
        sessions: [
          {
            day: 1,
            type: "O2",
            table: {
              rounds: 10,
              holdTimes: [250, 290, 325, 360, 395, 425, 455, 485, 510, 530],
              restTimes: Array(10).fill(300),
            },
          },
          {
            day: 3,
            type: "CO2",
            table: {
              rounds: 12,
              holdTimes: Array(12).fill(240),
              restTimes: [120, 105, 90, 75, 60, 45, 35, 30, 25, 20, 15, 15],
            },
          },
          {
            day: 5,
            type: "O2",
            table: {
              rounds: 10,
              holdTimes: [270, 315, 355, 390, 425, 460, 490, 520, 545, 560],
              restTimes: Array(10).fill(300),
            },
          },
        ],
      },
      {
        week: 7,
        goal: "Pre-peak taper",
        sessions: [
          {
            day: 1,
            type: "O2",
            table: {
              rounds: 6,
              holdTimes: [240, 300, 350, 400, 440, 470],
              restTimes: Array(6).fill(300),
            },
            notes: "Reduce volume, maintain intensity",
          },
          {
            day: 4,
            type: "CO2",
            table: {
              rounds: 6,
              holdTimes: Array(6).fill(220),
              restTimes: [120, 90, 70, 50, 35, 30],
            },
          },
        ],
      },
      {
        week: 8,
        goal: "Peak performance - 6+ minute attempts",
        sessions: [
          {
            day: 1,
            type: "O2",
            table: {
              rounds: 10,
              holdTimes: [270, 330, 375, 420, 465, 510, 545, 575, 600, 630],
              restTimes: Array(10).fill(360),
            },
            notes: "Everything you've trained for!",
          },
          {
            day: 3,
            type: "CO2",
            table: {
              rounds: 8,
              holdTimes: Array(8).fill(240),
              restTimes: [120, 90, 70, 50, 35, 25, 20, 20],
            },
          },
          {
            day: 5,
            type: "O2",
            table: {
              rounds: 10,
              holdTimes: [300, 360, 405, 450, 495, 540, 580, 615, 645, 660],
              restTimes: Array(10).fill(360),
            },
            notes: "Final test - reach for the stars!",
          },
        ],
      },
    ],
  },
];
