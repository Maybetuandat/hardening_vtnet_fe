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

import { StepIndicator } from "@/components/ui/step-indicator";
import { ExcelUploadForm } from "@/components/work-loads/add-workload/excel-upload-form";
import { WorkloadBasicForm } from "@/components/work-loads/add-workload/workload-basic-form";
import { useAddWorkload } from "@/hooks/workload/use-add-workload";

export default function AddWorkloadPage() {
  const navigate = useNavigate();

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
        description: formData.description,
        rules: formData.rules,
      });

      toast.success("Tạo workload thành công!");
      navigate("/workloads");
    } catch (error: any) {
      toast.error(error.message || "Không thể tạo workload");
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
            commands={formData.commands} // ✅ Truyền commands từ formData
            loading={loading}
            onFileUpload={parseExcelFile}
            onRulesChange={(rules) => updateFormData({ rules })}
            onCommandsChange={(commands) => updateFormData({ commands })} // ✅ Thêm handler cho commands
          />
        );
      default:
        return null;
    }
  };

  const getNextButtonText = () => {
    if (loading) return "Đang xử lý...";
    if (currentStep === steps.length - 1) return "Tạo Workload";
    return "Tiếp theo";
  };

  const getTotalItemsText = () => {
    const rulesCount = formData.rules.length;
    const commandsCount = formData.commands?.length || 0;

    if (rulesCount === 0) return null;

    if (commandsCount === 0) {
      return `${rulesCount} quy tắc sẵn sàng để import`;
    }

    return `${rulesCount} quy tắc và ${commandsCount} lệnh sẵn sàng để import`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                Thêm Workload Mới
              </CardTitle>
              <p className="text-muted-foreground">
                Tạo cấu hình workload mới với các quy tắc và chính sách bảo mật
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Step Indicator */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardContent className="py-3">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="rounded-none border-x-0">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <div className="flex-1 bg-background">
        <div className="h-full">{renderStepContent()}</div>
      </div>

      {/* Navigation */}
      <Card className="rounded-none border-x-0 border-b-0">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center space-x-2"
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{currentStep === 0 ? "Quay lại Workloads" : "Trước"}</span>
            </Button>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={handleCancel} disabled={loading}>
                Hủy
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
                Bước {currentStep + 1} / {steps.length}
              </span>
              {getTotalItemsText() && <span>{getTotalItemsText()}</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
