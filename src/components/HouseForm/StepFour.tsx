import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HouseFormData } from "@/hooks/useHouseForm";

interface StepFourProps {
  formData: HouseFormData;
  updateFormData: (updates: Partial<HouseFormData>) => void;
}

const StepFour = ({ formData, updateFormData }: StepFourProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="rooms">Nombre de pièces</Label>
        <Input
          id="rooms"
          type="number"
          value={formData.numberOfRooms || ""}
          onChange={(e) => updateFormData({ numberOfRooms: parseInt(e.target.value) || undefined })}
          placeholder="5"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="surface">Surface (m²)</Label>
        <Input
          id="surface"
          type="number"
          value={formData.surfaceArea || ""}
          onChange={(e) => updateFormData({ surfaceArea: parseFloat(e.target.value) || undefined })}
          placeholder="120"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="year">Année de construction</Label>
        <Input
          id="year"
          type="number"
          value={formData.constructionYear || ""}
          onChange={(e) => updateFormData({ constructionYear: parseInt(e.target.value) || undefined })}
          placeholder="2010"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="heating">Type de chauffage</Label>
        <Select
          value={formData.heatingType || ""}
          onValueChange={(value) => updateFormData({ heatingType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="electric">Électrique</SelectItem>
            <SelectItem value="gas">Gaz</SelectItem>
            <SelectItem value="fuel">Fioul</SelectItem>
            <SelectItem value="wood">Bois</SelectItem>
            <SelectItem value="heat-pump">Pompe à chaleur</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default StepFour;