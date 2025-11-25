import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { HouseFormData } from "@/hooks/useHouseForm";

interface StepTwoProps {
  formData: HouseFormData;
  updateFormData: (updates: Partial<HouseFormData>) => void;
}

const StepTwo = ({ formData, updateFormData }: StepTwoProps) => {
  const isApartment = formData.propertyType === "apartment";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="city" className="required">
          Ville *
        </Label>
        <Input
          id="city"
          value={formData.city}
          onChange={(e) => updateFormData({ city: e.target.value })}
          placeholder="Entrez la ville"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="district" className="required">
          District / Village *
        </Label>
        <Input
          id="district"
          value={formData.district}
          onChange={(e) => updateFormData({ district: e.target.value })}
          placeholder="Entrez le district ou village"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="neighborhood" className="required">
          Quartier *
        </Label>
        <Input
          id="neighborhood"
          value={formData.neighborhood}
          onChange={(e) => updateFormData({ neighborhood: e.target.value })}
          placeholder="Entrez le quartier"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="street" className="required">
          Rue *
        </Label>
        <Input
          id="street"
          value={formData.street}
          onChange={(e) => updateFormData({ street: e.target.value })}
          placeholder="Entrez la rue"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="parcelNumber" className="required">
          Numéro de la parcelle *
        </Label>
        <Input
          id="parcelNumber"
          value={formData.parcelNumber}
          onChange={(e) => updateFormData({ parcelNumber: e.target.value })}
          placeholder="Entrez le numéro de parcelle"
          required
        />
      </div>

      {isApartment && (
        <>
          <div className="space-y-2">
            <Label htmlFor="buildingName">
              Nom du bâtiment
            </Label>
            <Input
              id="buildingName"
              value={formData.buildingName || ""}
              onChange={(e) => updateFormData({ buildingName: e.target.value })}
              placeholder="Tour A, Résidence..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floorNumber">
                Étage
              </Label>
              <Input
                id="floorNumber"
                type="number"
                value={formData.floorNumber || ""}
                onChange={(e) => updateFormData({ floorNumber: parseInt(e.target.value) || undefined })}
                placeholder="3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apartmentNumber">
                Numéro d'appartement
              </Label>
              <Input
                id="apartmentNumber"
                value={formData.apartmentNumber || ""}
                onChange={(e) => updateFormData({ apartmentNumber: e.target.value })}
                placeholder="A12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalFloors">
              Nombre d'étages total
            </Label>
            <Input
              id="totalFloors"
              type="number"
              value={formData.totalFloors || ""}
              onChange={(e) => updateFormData({ totalFloors: parseInt(e.target.value) || undefined })}
              placeholder="10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="elevator"
              checked={formData.elevatorAvailable || false}
              onCheckedChange={(checked) =>
                updateFormData({ elevatorAvailable: checked as boolean })
              }
            />
            <Label htmlFor="elevator" className="font-normal cursor-pointer">
              Ascenseur disponible
            </Label>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="phone" className="required">
          Numéro de téléphone *
        </Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => updateFormData({ phone: e.target.value })}
          placeholder="+33 1 23 45 67 89"
          required
        />
      </div>
    </div>
  );
};

export default StepTwo;
