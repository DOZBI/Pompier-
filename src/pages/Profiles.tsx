import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, User } from "lucide-react";

// Mock data - will be replaced with real data
const mockProfiles = [
  { id: "1", name: "Anthony Dupont", avatar: null, housesCount: 3, visible: true },
  { id: "2", name: "Marie Laurent", avatar: null, housesCount: 2, visible: true },
  { id: "3", name: "Pierre Martin", avatar: null, housesCount: 5, visible: true },
  { id: "4", name: "Sophie Bernard", avatar: null, housesCount: 1, visible: true },
];

const Profiles = () => {
  return (
    <div className="min-h-screen py-8 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-foreground">Profils des utilisateurs</h1>
          <p className="text-muted-foreground">
            Découvrez les citoyens engagés dans la prévention incendie
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockProfiles.map((profile) => (
            <Card key={profile.id} className="p-6 gradient-card shadow-card hover:shadow-glow transition-smooth border-border/50">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    <User className="h-10 w-10" strokeWidth={1.5} />
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {profile.id}</p>
                </div>

                <Badge variant="secondary" className="gap-2 bg-secondary/50 border-border/30">
                  <Home className="h-4 w-4" />
                  {profile.housesCount} maison{profile.housesCount > 1 ? 's' : ''} enregistrée{profile.housesCount > 1 ? 's' : ''}
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        {mockProfiles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun profil visible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profiles;
