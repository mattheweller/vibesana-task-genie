
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Zap, 
  Layout, 
  Brain, 
  Search, 
  Users, 
  Target,
  Sparkles,
  Rocket
} from "lucide-react";

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  highlight?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to Vibesana!",
    description: "The future of task management is here. Let's explore what makes Vibesana incredible!",
    icon: <Rocket className="w-8 h-8 text-primary" />,
    features: [
      "AI-powered task breakdown",
      "Intuitive drag-and-drop interface", 
      "Real-time collaboration",
      "Smart filtering and search"
    ],
    highlight: "Ready to revolutionize your productivity?"
  },
  {
    title: "AI Task Breakdown",
    description: "Transform complex projects into manageable tasks with the power of AI.",
    icon: <Brain className="w-8 h-8 text-primary" />,
    features: [
      "Describe any project in natural language",
      "AI automatically breaks it into actionable steps",
      "Intelligent complexity scoring with Comet Opik",
      "Automatic sub-task generation for complex items"
    ],
    highlight: "Look for the AI assistant in the right sidebar!"
  },
  {
    title: "Dual-View Task Management",
    description: "Choose between List and Kanban Board views for optimal workflow.",
    icon: <Layout className="w-8 h-8 text-primary" />,
    features: [
      "List View: Clean, organized task listing",
      "Kanban Board: Drag-and-drop between TO DO → IN PROGRESS → REVIEW → DONE",
      "Real-time status updates",
      "Seamless view switching"
    ],
    highlight: "Toggle views with the buttons above your tasks!"
  },
  {
    title: "Advanced Search & Filtering",
    description: "Find exactly what you need with intelligent search and filtering.",
    icon: <Search className="w-8 h-8 text-primary" />,
    features: [
      "Search by title, description, or assignee",
      "Filter by status and priority",
      "Real-time results as you type",
      "One-click filter clearing"
    ],
    highlight: "Use the search bar and filter button in the task section!"
  },
  {
    title: "Team Collaboration",
    description: "Work together seamlessly with powerful collaboration features.",
    icon: <Users className="w-8 h-8 text-primary" />,
    features: [
      "Assign tasks to team members",
      "Real-time updates across all devices",
      "Progress tracking and visibility",
      "Project overview with team metrics"
    ],
    highlight: "Check out the Active Projects section!"
  },
  {
    title: "You're All Set!",
    description: "You're ready to experience the future of task management. Let's get productive!",
    icon: <Target className="w-8 h-8 text-primary" />,
    features: [
      "Click 'NEW TASK' to create your first task",
      "Try the AI Task Breakdown for complex projects",
      "Drag tasks around the Kanban board",
      "Use filters to stay organized"
    ],
    highlight: "Welcome to your productivity revolution! 🚀"
  }
];

interface TutorialModalProps {
  open: boolean;
  onClose: () => void;
}

export function TutorialModal({ open, onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const currentStepData = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleFinish = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStepData.icon}
              <DialogTitle className="text-2xl neon-text uppercase tracking-wider">
                {currentStepData.title}
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="font-mono">
              Step {currentStep + 1} of {tutorialSteps.length}
            </Badge>
            <div className="flex-1 bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              />
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <p className="text-lg text-muted-foreground font-mono leading-relaxed">
            {currentStepData.description}
          </p>

          <div className="space-y-3">
            {currentStepData.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm font-mono">{feature}</span>
              </div>
            ))}
          </div>

          {currentStepData.highlight && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">Pro Tip:</span>
              </div>
              <p className="text-sm mt-2 font-mono">{currentStepData.highlight}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentStep 
                    ? 'bg-primary w-6' 
                    : index < currentStep 
                      ? 'bg-primary/60' 
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                className="retro-button"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                PREVIOUS
              </Button>
            )}
            
            {isLastStep ? (
              <Button 
                onClick={handleFinish}
                className="retro-button neon-text font-bold"
              >
                <Rocket className="w-4 h-4 mr-2" />
                GET STARTED!
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                className="retro-button neon-text font-bold"
              >
                NEXT
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
