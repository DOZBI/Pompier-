import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import StepOne from "@/components/HouseForm/StepOne";
import StepTwo from "@/components/HouseForm/StepTwo";
import StepThree from "@/components/HouseForm/StepThree";
import StepFour from "@/components/HouseForm/StepFour";
import StepFive from "@/components/HouseForm/StepFive";
import { useHouseForm } from "@/hooks/useHouseForm";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const RegisterHouse = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [submitting, setSubmitting] = useState(false);
  const { formData, updateFormData, resetForm } = useHouseForm();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Vous devez être connecté pour enregistrer une maison");
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const steps = [
    { number: 1, title: "Informations générales" },
    { number: 2, title: "Localisation" },
    { number: 3, title: "Documents & description" },
    { number: 4, title: "Détails de la maison" },
    { number: 5, title: "Objets sensibles" },
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.from("houses").insert({
        user_id: user.id,
        owner_name: formData.ownerName,
        property_type: formData.propertyType,
        city: formData.city,
        district: formData.district,
        neighborhood: formData.neighborhood,
        street: formData.street,
        parcel_number: formData.parcelNumber,
        phone: formData.phone,
        building_name: formData.buildingName,
        floor_number: formData.floorNumber,
        apartment_number: formData.apartmentNumber,
        total_floors: formData.totalFloors,
        elevator_available: formData.elevatorAvailable,
        description: formData.description,
        documents_urls: formData.documentsUrls,
        photos_urls: formData.photosUrls,
        plan_url: formData.planUrl,
        number_of_rooms: formData.numberOfRooms,
        surface_area: formData.surfaceArea,
        construction_year: formData.constructionYear,
        heating_type: formData.heatingType,
        sensitive_objects: formData.sensitiveObjects,
        security_notes: formData.securityNotes,
      }).select().single();

      if (error) throw error;

      toast.success("Maison enregistrée avec succès!");

      // If a plan was uploaded, trigger AI analysis
      if (formData.planUrl && data) {
        toast.info("Analyse du plan en cours...");
        
        try {
          const response = await fetch(
            'https://sfgncyerlcditfepasjo.supabase.co/functions/v1/analyze-plan',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                planUrl: formData.planUrl,
                houseId: data.id
              })
            }
          );

          if (response.ok) {
            toast.success("Analyse du plan terminée!");
          } else {
            const errorData = await response.json();
            console.error('Analysis error:', errorData);
            toast.warning("Analyse du plan échouée, vous pourrez la relancer plus tard");
          }
        } catch (analysisError) {
          console.error('Analysis error:', analysisError);
          toast.warning("Analyse du plan échouée, vous pourrez la relancer plus tard");
        }
      }

      resetForm();
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen py-8 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Enregistrer une maison</h1>
            <p className="text-muted-foreground">
              Remplissez les informations pour enregistrer votre maison
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`flex flex-col items-center gap-2 ${
                    step.number === currentStep
                      ? "text-primary font-semibold"
                      : step.number < currentStep
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      step.number === currentStep
                        ? "border-primary bg-primary text-primary-foreground"
                        : step.number < currentStep
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground"
                    }`}
                  >
                    {step.number < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className="hidden md:block text-xs">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <Card className="p-6 md:p-8 gradient-card shadow-card border-border/50">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">
                {steps[currentStep - 1].title}
              </h2>

              {/* Form Steps */}
              {currentStep === 1 && (
                <StepOne formData={formData} updateFormData={updateFormData} />
              )}
              {currentStep === 2 && (
                <StepTwo formData={formData} updateFormData={updateFormData} />
              )}
              {currentStep === 3 && (
                <StepThree formData={formData} updateFormData={updateFormData} />
              )}
              {currentStep === 4 && (
                <StepFour formData={formData} updateFormData={updateFormData} />
              )}
              {currentStep === 5 && (
                <StepFive formData={formData} updateFormData={updateFormData} />
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Précédent
                </Button>

                {currentStep < totalSteps ? (
                  <Button onClick={handleNext} className="gradient-fire border-0">
                    Suivant
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="gradient-fire border-0"
                    disabled={submitting}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {submitting ? "En cours..." : "Soumettre"}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterHouse;
