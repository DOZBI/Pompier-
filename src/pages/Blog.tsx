import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { adminService } from "@/services/adminService"; // Import du service

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  author_name: string;
  category: string | null;
  views: number;
  published_at: string | null;
  created_at: string;
  status: string; // Ajouté pour le filtrage
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // Remplacé fetch('/api/blog-posts') par adminService
      const data = await adminService.getBlogPosts();
      // Filtrer côté client pour ne montrer que les publiés
      // Idéalement, créez une méthode getPublishedBlogPosts dans le service
      const publishedPosts = data.posts.filter((p: any) => p.status === 'published');
      setPosts(publishedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error("Erreur lors du chargement des articles");
    } finally {
      setLoading(false);
    }
  };

  // ... reste du code (calculateReadTime et le return) identique ...
  
  const calculateReadTime = (content: string | null) => {
    if (!content) return "5 min";
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="space-y-6 mb-12 text-center">
          <h1 className="text-4xl font-bold">Blog des pompiers</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conseils, guides et actualités sur la prévention incendie
          </p>
        </div>

        {posts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Aucun article publié pour le moment</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <Card className="overflow-hidden shadow-card hover:shadow-fire transition-smooth h-full">
                  <div className="aspect-video relative overflow-hidden">
                    {post.image_url ? (
                      <img 
                        src={post.image_url} 
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="text-4xl">📰</span>
                      </div>
                    )}
                    {post.category && (
                      <Badge className="absolute top-4 left-4 gradient-fire border-0">
                        {post.category}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold line-clamp-2 hover:text-primary transition-smooth">
                      {post.title}
                    </h3>
                    
                    {post.excerpt && (
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author_name}
                      </div>
                      {post.published_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.published_at).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {calculateReadTime(post.content)}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;