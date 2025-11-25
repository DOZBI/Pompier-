import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminService } from "@/services/adminService";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  author_name: string;
  category: string | null;
  status: string;
  views: number;
  published_at: string | null;
  created_at: string;
}

const BlogManagement = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image_url: "",
    category: "",
    status: "draft",
    author_name: "Admin Fire Safety"
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await adminService.getBlogPosts();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error("Erreur lors du chargement des articles");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!formData.title || !formData.slug) {
      toast.error("Le titre et le slug sont requis");
      return;
    }

    try {
      if (editingPost) {
        await adminService.updateBlogPost(editingPost.id, formData);
        toast.success("Article mis à jour");
      } else {
        await adminService.createBlogPost(formData);
        toast.success("Article créé");
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error: any) {
      console.error('Error saving post:', error);
      toast.error(error.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;

    try {
      await adminService.deleteBlogPost(id);
      toast.success("Article supprimé");
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content || "",
      image_url: post.image_url || "",
      category: post.category || "",
      status: post.status,
      author_name: post.author_name
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      image_url: "",
      category: "",
      status: "draft",
      author_name: "Admin Fire Safety"
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">Gestion du blog</h1>
          <p className="text-muted-foreground mt-2">
            Créer et gérer les articles du blog
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gradient-fire border-0">
              <Plus className="mr-2 h-4 w-4" />
              Nouvel article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? "Modifier l'article" : "Nouvel article"}
              </DialogTitle>
              <DialogDescription>
                {editingPost ? "Modifiez les informations de l'article" : "Créez un nouvel article pour le blog"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      slug: generateSlug(e.target.value)
                    });
                  }}
                  placeholder="Titre de l'article"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="slug-de-l-article"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Prévention, Guide, Sécurité..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Extrait</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Court résumé de l'article"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenu</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Contenu complet de l'article"
                  rows={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL de l'image</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateOrUpdate}>
                {editingPost ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un article..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Posts Table */}
      <Card className="p-6">
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucun article trouvé</p>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary transition-smooth"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{post.title}</h3>
                    {post.category && <Badge variant="secondary">{post.category}</Badge>}
                    <Badge
                      variant={post.status === "published" ? "default" : "outline"}
                      className={post.status === "published" ? "gradient-fire border-0" : ""}
                    >
                      {post.status === "published" ? "Publié" : "Brouillon"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Par {post.author_name}</span>
                    <span>•</span>
                    {post.status === "published" && post.published_at ? (
                      <>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views} vues
                        </span>
                        <span>•</span>
                        <span>Publié le {new Date(post.published_at).toLocaleDateString('fr-FR')}</span>
                      </>
                    ) : (
                      <span>Non publié</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {post.status === "published" && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => openEditDialog(post)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default BlogManagement;