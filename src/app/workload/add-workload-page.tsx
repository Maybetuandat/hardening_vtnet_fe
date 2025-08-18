import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { StepIndicator } from "@/components/ui/step-indicator";
import { ExcelUploadForm } from "@/components/work-loads/add-workload/excel-upload-form";
import { WorkloadBasicForm } from "@/components/work-loads/add-workload/workload-basic-form";
import { useAddWorkload } from "@/hooks/use-add-workload";

export default function AddWorkloadPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("workload");

  const {
    currentStep,
    steps,
    formData,
    loading,
    error,
    parseExcelFile,
    createWorkloadWithRules,
    updateFormData,
    nextStep,
    prevStep,
    resetForm,
    canProceedToNextStep,
  } = useAddWorkload();

  const handleBack = () => {
    if (currentStep === 0) {
      navigate("/workloads");
    } else {
      prevStep();
    }
  };

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      // Final step - create workload
      await handleCreateWorkload();
    } else {
      nextStep();
    }
  };

  const handleCreateWorkload = async () => {
    try {
      await createWorkloadWithRules({
        name: formData.name,
        display_name: formData.display_name,
        description: formData.description,
        workload_type: formData.workload_type as any,
        is_active: formData.is_active,
        rules: formData.rules,
      });

      toast.success("Workload created successfully!");
      navigate("/workloads");
    } catch (error: any) {
      toast.error(error.message || "Failed to create workload");
    }
  };

  const handleCancel = () => {
    resetForm();
    navigate("/workloads");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <WorkloadBasicForm
            formData={formData}
            onUpdateFormData={updateFormData}
          />
        );
      case 1:
        return (
          <ExcelUploadForm
            rules={formData.rules}
            loading={loading}
            onFileUpload={parseExcelFile}
            onRulesChange={(rules) => updateFormData({ rules })}
          />
        );
      default:
        return null;
    }
  };

  const getNextButtonText = () => {
    if (loading) return "Processing...";
    if (currentStep === steps.length - 1) return "Create Workload";
    return "Next";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                Add New Workload
              </CardTitle>
              <p className="text-muted-foreground">
                Create a new workload configuration with security rules and
                policies
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Step Indicator */}
      <Card>
        <CardContent className="p-2">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <div className="min-h-[400px]">{renderStepContent()}</div>

      {/* Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center space-x-2"
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>
                {currentStep === 0 ? "Back to Workloads" : "Previous"}
              </span>
            </Button>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceedToNextStep()}
                className="flex items-center space-x-2"
              >
                <span>{getNextButtonText()}</span>
                {currentStep < steps.length - 1 ? (
                  <ArrowRight className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Progress Summary */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              {formData.rules.length > 0 && (
                <span>{formData.rules.length} rules ready for import</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
