import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HouseFormData } from "@/hooks/useHouseForm";
import { useState } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface StepThreeProps {
  formData: HouseFormData;
  updateFormData: (updates: Partial<HouseFormData>) => void;
}

const StepThree = ({ formData, updateFormData }: StepThreeProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [planPreview, setPlanPreview] = useState<string | null>(
    formData.planUrl || null
  );

  const handlePlanUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !user) return;

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Format non supporté. Utilisez JPG, PNG ou PDF');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Fichier trop volumineux (max 10MB)');
        return;
      }

      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('house-plans')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('house-plans')
        .getPublicUrl(data.path);

      updateFormData({ planUrl: urlData.publicUrl });
      setPlanPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
      
      toast.success('Plan téléchargé avec succès');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Erreur lors du téléchargement: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removePlan = () => {
    updateFormData({ planUrl: undefined });
    setPlanPreview(null);
    toast.success('Plan retiré');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="description" className="required">
          Description de la propriété *
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Décrivez votre propriété..."
          className="min-h-[120px]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="plan">
          Plan de la maison (recommandé)
        </Label>
        <div className="text-sm text-muted-foreground mb-2">
          Téléchargez un plan pour une analyse automatique par IA
        </div>

        {planPreview ? (
          <div className="relative border-2 border-primary/20 rounded-lg p-4 bg-card">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removePlan}
            >
              <X className="h-4 w-4" />
            </Button>
            {planPreview.startsWith('blob:') ? (
              <img
                src={planPreview}
                alt="Plan preview"
                className="w-full h-48 object-contain rounded"
              />
            ) : (
              <div className="flex items-center gap-3 p-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Plan téléchargé</p>
                  <p className="text-sm text-muted-foreground">
                    Le plan sera analysé après l'enregistrement
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              type="file"
              id="plan-upload"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={handlePlanUpload}
              className="hidden"
              disabled={uploading}
            />
            <label
              htmlFor="plan-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              {uploading ? (
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              ) : (
                <Upload className="h-10 w-10 text-muted-foreground" />
              )}
              <p className="text-muted-foreground">
                {uploading
                  ? 'Téléchargement...'
                  : 'Cliquez pour sélectionner un plan (JPG, PNG, PDF)'}
              </p>
              <p className="text-xs text-muted-foreground">Max 10MB</p>
            </label>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="documents">
          Photos et documents supplémentaires
        </Label>
        <div className="text-sm text-muted-foreground mb-2">
          Ajoutez des photos de l'intérieur, extérieur, etc.
        </div>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            À venir : upload de photos multiples
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepThree;