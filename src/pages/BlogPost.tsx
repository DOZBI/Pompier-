import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ArrowLeft, Eye } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client"; // Import direct de Supabase

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
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      // Appel direct à Supabase au lieu de /api/blog-posts/${slug}
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Code pour "No rows found"
          toast.error("Article non trouvé");
          navigate("/blog");
          return;
        }
        throw error;
      }

      // Incrémenter les vues
      if (data) {
        await supabase
          .from('blog_posts')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', data.id);
      }
      
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error("Erreur lors du chargement de l'article");
      navigate("/blog");
    } finally {
      setLoading(false);
    }
  };

  // ... reste du code identique ...
  
  const calculateReadTime = (content: string | null) => {
    if (!content) return "5 min";
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-8"
          onClick={() => navigate("/blog")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au blog
        </Button>

        <article className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            {post.category && (
              <Badge className="gradient-fire border-0">
                {post.category}
              </Badge>
            )}
            
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.author_name}
              </div>
              {post.published_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.published_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {calculateReadTime(post.content)}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.views} vues
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {post.image_url && (
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <img 
                src={post.image_url} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <Card className="p-6 bg-muted/50 border-l-4 border-primary">
              <p className="text-lg font-medium leading-relaxed">
                {post.excerpt}
              </p>
            </Card>
          )}

          {/* Content */}
          {post.content && (
            <Card className="p-8">
              <div className="prose prose-lg max-w-none">
                {post.content.split('\n').map((paragraph, idx) => (
                  paragraph.trim() && (
                    <p key={idx} className="mb-4 leading-relaxed text-foreground">
                      {paragraph}
                    </p>
                  )
                ))}
              </div>
            </Card>
          )}

          {/* Footer */}
          <Card className="p-6 bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Écrit par</p>
                <p className="font-semibold">{post.author_name}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/blog")}
              >
                Voir plus d'articles
              </Button>
            </div>
          </Card>
        </article>
      </div>
    </div>
  );
};

export default BlogPost;