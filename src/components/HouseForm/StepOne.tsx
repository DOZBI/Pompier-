import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HouseFormData } from "@/hooks/useHouseForm";

interface StepOneProps {
  formData: HouseFormData;
  updateFormData: (updates: Partial<HouseFormData>) => void;
}

const StepOne = ({ formData, updateFormData }: StepOneProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="ownerName" className="required">
          Nom du propriétaire *
        </Label>
        <Input
          id="ownerName"
          value={formData.ownerName}
          onChange={(e) => updateFormData({ ownerName: e.target.value })}
          placeholder="Entrez le nom du propriétaire"
          required
        />
      </div>

      <div className="space-y-3">
        <Label className="required">Type de propriété *</Label>
        <RadioGroup
          value={formData.propertyType}
          onValueChange={(value) =>
            updateFormData({ propertyType: value as "house" | "apartment" })
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="house" id="house" />
            <Label htmlFor="house" className="font-normal cursor-pointer">
              Maison
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="apartment" id="apartment" />
            <Label htmlFor="apartment" className="font-normal cursor-pointer">
              Appartement
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

export default StepOne;