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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { StepIndicator } from "@/components/ui/step-indicator";
import { ExcelUploadForm } from "@/components/work-loads/create-workload/excel-upload-form";
import { WorkloadBasicForm } from "@/components/work-loads/create-workload/workload-basic-form";
import { useAddWorkload } from "@/hooks/workload/use-add-workload";
import { CreateWorkloadRequest } from "@/types/workload";

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
    // Validation states
    validatingWorkloadName,
    workloadNameValidation,
  } = useAddWorkload();

  const handleBack = () => {
    if (currentStep === 0) {
      navigate("/workloads");
    } else {
      prevStep();
    }
  };

  const handleCreateWorkload = async () => {
    try {
      const requestData: CreateWorkloadRequest = {
        workload: {
          name: formData.workload.name,
          description: formData.workload.description || "",
          os_id: formData.workload.os_id,
        },
        rules: formData.rules,
      };

      await createWorkloadWithRules(requestData);

      toast.success("Tạo workload thành công!");
      navigate("/workloads");
    } catch (error: any) {
      toast.error(error.message || "Không thể tạo workload");
    }
  };

  // Cập nhật validation trong handleNext:
  const handleNext = async () => {
    // Kiểm tra validation trước khi tiếp tục
    if (currentStep === 0) {
      if (!workloadNameValidation.isValid || validatingWorkloadName) {
        toast.error(
          "Vui lòng chờ kiểm tra tên workload hoặc sửa lỗi validation"
        );
        return;
      }

      // Kiểm tra os_version
      if (!formData.workload.os_id) {
        toast.error("Vui lòng chọn hệ điều hành");
        return;
      }
    }

    if (currentStep === steps.length - 1) {
      await handleCreateWorkload();
    } else {
      nextStep();
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
    if (loading) return "Đang xử lý...";
    if (validatingWorkloadName && currentStep === 0) return "Đang kiểm tra...";
    if (currentStep === steps.length - 1) return "Tạo Workload";
    return "Tiếp theo";
  };

  const isNextButtonDisabled = () => {
    if (loading) return true;
    if (currentStep === 0 && validatingWorkloadName) return true;
    return !canProceedToNextStep();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8" />
              Tạo Workload Mới
            </h1>
            <p className="text-gray-600">
              Tạo workload với cấu hình rules và commands từ file Excel
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={handleCancel}>
          Hủy
        </Button>
      </div>

      {/* Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Tiến trình tạo workload</CardTitle>
        </CardHeader>
        <CardContent>
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

      {/* Validation Warning for Step 1 */}
      {currentStep === 0 &&
        formData.workload.name &&
        !workloadNameValidation.isValid && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {workloadNameValidation.message}
            </AlertDescription>
          </Alert>
        )}

      {/* Step Content */}
      <div className="min-h-[400px]">{renderStepContent()}</div>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={loading || validatingWorkloadName}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 0 ? "Quay lại danh sách" : "Bước trước"}
            </Button>

            <div className="flex items-center gap-2">
              {/* Validation status indicator */}
              {currentStep === 0 && formData.workload.name && (
                <div className="flex items-center gap-2 text-sm">
                  {validatingWorkloadName ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-blue-600">
                        Đang kiểm tra tên...
                      </span>
                    </>
                  ) : workloadNameValidation.message ? (
                    workloadNameValidation.isValid ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">Tên hợp lệ</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600">Tên không hợp lệ</span>
                      </>
                    )
                  ) : null}
                </div>
              )}

              <Button
                onClick={handleNext}
                disabled={isNextButtonDisabled()}
                className="min-w-[140px]"
              >
                {validatingWorkloadName && currentStep === 0 ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : currentStep === steps.length - 1 ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                {getNextButtonText()}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
