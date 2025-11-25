import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Trash2, MapPin, Home } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { HouseDetailsDialog } from "@/components/Admin/HouseDetailsDialog";

interface House {
  id: string;
  street: string;
  city: string;
  property_type: string;
  number_of_rooms: number | null;
  created_at: string | null;
  district: string;
  neighborhood: string;
  plan_url?: string;
  plan_analysis?: any;
  surface_area?: string;
  number_of_floors?: number;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  sensitive_objects?: string[];
  notes?: string;
}

interface UserHouses {
  userId: string;
  userName: string;
  userEmail: string;
  houses: House[];
}

const Houses = () => {
  const [userHouses, setUserHouses] = useState<UserHouses[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all houses with user info
      const { data: houses, error: housesError } = await supabase
        .from("houses")
        .select("*, user_id")
        .order("created_at", { ascending: false });

      if (housesError) throw housesError;

      // Group houses by user
      const housesGrouped: { [key: string]: UserHouses } = {};

      for (const house of houses || []) {
        if (!housesGrouped[house.user_id]) {
          // Fetch user profile
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", house.user_id)
            .single();

          if (!profileError && profile) {
            housesGrouped[house.user_id] = {
              userId: house.user_id,
              userName: profile.full_name || profile.email,
              userEmail: profile.email,
              houses: [],
            };
          }
        }

        if (housesGrouped[house.user_id]) {
          housesGrouped[house.user_id].houses.push(house);
        }
      }

      setUserHouses(Object.values(housesGrouped));
    } catch (err) {
      console.error("Error fetching houses:", err);
      setError("Erreur lors du chargement des maisons");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (house: House) => {
    setSelectedHouse(house);
    setDetailsDialogOpen(true);
  };

  const filteredUserHouses = userHouses.filter(
    (user) =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.houses.some(
        (house) =>
          house.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
          house.city.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des maisons</h1>
          <p className="text-muted-foreground mt-2">
            Consulter et gérer les formulaires d'enregistrement
          </p>
        </div>
        <Card className="p-6 shadow-card">
          <p className="text-red-600">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des maisons</h1>
        <p className="text-muted-foreground mt-2">
          Consulter et gérer les formulaires d'enregistrement
        </p>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une maison..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Houses by User */}
      <Card className="p-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredUserHouses.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-4">
            {filteredUserHouses.map((user) => (
              <AccordionItem
                key={user.userId}
                value={user.userId}
                className="border border-border rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-fire flex items-center justify-center text-white font-semibold">
                      {user.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{user.userName}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.houses.length} maison
                        {user.houses.length > 1 ? "s" : ""} enregistrée
                        {user.houses.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-3">
                  {user.houses.map((house) => (
                    <div
                      key={house.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary transition-smooth"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <Home className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">
                              {house.street}, {house.neighborhood}
                            </h4>
                            <Badge variant="secondary">{house.property_type}</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {house.city} - {house.district}
                            </span>
                            {house.number_of_rooms && (
                              <>
                                <span>•</span>
                                <span>{house.number_of_rooms} pièces</span>
                              </>
                            )}
                            <span>•</span>
                            <span>
                              Soumis le{" "}
                              {house.created_at
                                ? new Date(house.created_at).toLocaleDateString("fr-FR")
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(house)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "Aucune maison trouvée" : "Aucune maison enregistrée"}
          </div>
        )}
      </Card>

      {/* House Details Dialog */}
      {selectedHouse && (
        <HouseDetailsDialog
          house={selectedHouse}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}
    </div>
  );
};

export default Houses;