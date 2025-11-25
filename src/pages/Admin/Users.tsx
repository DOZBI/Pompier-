import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Home, FileText, Eye } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { adminService } from "@/services/adminService";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  status: string;
  views: number;
  category: string | null;
  published_at: string | null;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: number;
  updated_at: number;
  housesCount: number;
  houses: Array<{
    id: number;
    address: string;
    city: string;
    status: string;
    created_at: string;
  }>;
  blogPosts: BlogPost[];
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers(searchQuery);
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground mt-2">
            Gérer les profils et consulter leurs maisons et articles
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un utilisateur..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Users List */}
      <Card className="p-6">
        {users.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Aucun utilisateur trouvé</p>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {users.map((user) => (
              <AccordionItem key={user.id} value={user.id} className="border border-border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4 w-full">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="gradient-fire text-white">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{user.name}</h3>
                        <Badge variant="secondary">{user.role}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.housesCount} maison{user.housesCount > 1 ? 's' : ''} • 
                        {user.blogPosts.length} article{user.blogPosts.length > 1 ? 's' : ''} • 
                        Inscrit le {new Date(user.created_at * 1000).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  {/* Houses Section */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Maisons enregistrées ({user.housesCount})
                    </h4>
                    {user.houses.length > 0 ? (
                      <div className="space-y-2">
                        {user.houses.map((house) => (
                          <div
                            key={house.id}
                            className="flex items-center justify-between p-3 border border-border rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium">{house.address}</p>
                                <Badge variant="secondary">{house.city}</Badge>
                                <Badge variant={house.status === "approved" ? "default" : "outline"}>
                                  {house.status === "approved" ? "Approuvé" : 
                                   house.status === "pending" ? "En attente" : "Rejeté"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Soumis le {new Date(house.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucune maison enregistrée</p>
                    )}
                  </div>

                  {/* Blog Posts Section */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Articles du blog ({user.blogPosts.length})
                    </h4>
                    {user.blogPosts.length > 0 ? (
                      <div className="space-y-2">
                        {user.blogPosts.map((post) => (
                          <div
                            key={post.id}
                            className="flex items-center justify-between p-3 border border-border rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium">{post.title}</p>
                                {post.category && <Badge variant="secondary">{post.category}</Badge>}
                                <Badge variant={post.status === "published" ? "default" : "outline"}>
                                  {post.status === "published" ? "Publié" : "Brouillon"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                {post.status === "published" && (
                                  <>
                                    <span className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      {post.views} vues
                                    </span>
                                    <span>•</span>
                                  </>
                                )}
                                <span>
                                  {post.status === "published" && post.published_at
                                    ? `Publié le ${new Date(post.published_at).toLocaleDateString('fr-FR')}`
                                    : `Créé le ${new Date(post.created_at).toLocaleDateString('fr-FR')}`}
                                </span>
                              </div>
                            </div>
                            {post.status === "published" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucun article de blog</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </Card>
    </div>
  );
};

export default Users;