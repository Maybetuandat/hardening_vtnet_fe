// src/components/ui/step-indicator.tsx
import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkloadStep } from "@/types/add-workload";

interface StepIndicatorProps {
  steps: WorkloadStep[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle + Label */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ",
                    {
                      "bg-primary border-primary text-primary-foreground":
                        isCompleted,
                      "bg-primary border-primary text-primary-foreground animate-pulse":
                        isActive,
                      "bg-background border-muted-foreground text-muted-foreground":
                        !isCompleted && !isActive,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <div
                    className={cn(
                      "text-sm font-medium transition-colors duration-200",
                      {
                        "text-primary": isActive || isCompleted,
                        "text-muted-foreground": !isActive && !isCompleted,
                      }
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-muted-foreground mt-1 max-w-32">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-4">
                  <div
                    className={cn("h-full transition-all duration-300", {
                      "bg-primary": index < currentStep,
                      "bg-muted": index >= currentStep,
                    })}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
