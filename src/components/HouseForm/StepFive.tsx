import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { HouseFormData } from "@/hooks/useHouseForm";

interface StepFiveProps {
  formData: HouseFormData;
  updateFormData: (updates: Partial<HouseFormData>) => void;
}

const StepFive = ({ formData, updateFormData }: StepFiveProps) => {
  const sensitiveObjectOptions = [
    { id: "gas", label: "Bouteilles de gaz" },
    { id: "chemicals", label: "Produits chimiques" },
    { id: "fuel", label: "Réservoir de carburant" },
    { id: "electrical", label: "Installation électrique ancienne" },
  ];

  const toggleSensitiveObject = (objectId: string) => {
    const currentObjects = formData.sensitiveObjects || [];
    const updated = currentObjects.includes(objectId)
      ? currentObjects.filter((id) => id !== objectId)
      : [...currentObjects, objectId];
    updateFormData({ sensitiveObjects: updated });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Objets sensibles / dangereux</Label>
        <div className="space-y-3">
          {sensitiveObjectOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={option.id}
                checked={formData.sensitiveObjects?.includes(option.id)}
                onCheckedChange={() => toggleSensitiveObject(option.id)}
              />
              <label htmlFor={option.id} className="text-sm cursor-pointer">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes de sécurité supplémentaires</Label>
        <Textarea
          id="notes"
          value={formData.securityNotes}
          onChange={(e) => updateFormData({ securityNotes: e.target.value })}
          placeholder="Ajoutez toute information importante pour les pompiers..."
          className="min-h-[120px]"
        />
      </div>
    </div>
  );
};

export default StepFive;