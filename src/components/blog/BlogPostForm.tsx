import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { BlogFormHeader } from "./form/BlogFormHeader";
import { BlogImageUpload } from "./form/BlogImageUpload";
import { BlogContent } from "./form/BlogContent";
import { BlogFormProps } from "./types";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Add word count utility function
const calculateReadTime = (content: string): number => {
  // Strip HTML tags if any
  const strippedContent = content.replace(/<[^>]*>/g, '');
  
  // Count words (split by spaces and filter empty strings)
  const words = strippedContent.split(/\s+/).filter(word => word.length > 0);
  
  // Average reading speed is 200-250 words per minute
  // We'll use 225 as a middle ground
  const wordsPerMinute = 225;
  
  // Calculate reading time and round up to the nearest minute
  const readTime = Math.ceil(words.length / wordsPerMinute);
  
  // Return at least 1 minute
  return Math.max(1, readTime);
};

export const BlogPostForm = ({
  title,
  setTitle,
  content,
  setContent,
  excerpt,
  setExcerpt,
  category,
  setCategory,
  categories,
  image,
  setImage,
  imagePreview,
  setImagePreview,
  keyTakeaways,
  setKeyTakeaways,
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  keywords,
  setKeywords,
  postId,
  isSimpleMode,
}: BlogFormProps & { isSimpleMode: boolean }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogData = async () => {
      if (postId) {
        const { data, error } = await supabase
          .from('blogs')
          .select('image_url')
          .eq('id', postId)
          .single();

        if (!error && data?.image_url) {
          console.log("Found existing image URL:", data.image_url);
          setExistingImageUrl(data.image_url);
          setImagePreview(data.image_url);
        }
      }
    };

    fetchBlogData();
  }, [postId, setImagePreview]);

  // Parse markdown content when in simple mode
  const parseMarkdownContent = (markdownContent: string) => {
    console.log("Parsing markdown content...");

    // Extract title (first h1)
    const titleMatch = markdownContent.match(/^#\s*([^\n]+)/);
    if (titleMatch && setTitle) {
      console.log("Found title:", titleMatch[1]);
      setTitle(titleMatch[1].trim());
    }

    // Extract meta information
    const metaTitleMatch = markdownContent.match(/\*\*Meta Title:\*\*\s*([^\n]+)/);
    if (metaTitleMatch && setMetaTitle) {
      console.log("Found meta title:", metaTitleMatch[1]);
      setMetaTitle(metaTitleMatch[1].trim());
    }

    const metaDescriptionMatch = markdownContent.match(/\*\*Meta Description:\*\*\s*([^\n]+)/);
    if (metaDescriptionMatch && setMetaDescription) {
      console.log("Found meta description:", metaDescriptionMatch[1]);
      setMetaDescription(metaDescriptionMatch[1].trim());
    }

    const keywordsMatch = markdownContent.match(/\*\*Keywords:\*\*\s*([^\n]+)/);
    if (keywordsMatch && setKeywords) {
      const keywordsArray = keywordsMatch[1].split(',').map(k => k.trim());
      console.log("Found keywords:", keywordsArray);
      setKeywords(keywordsArray);
    }

    // Extract excerpt (between **Excerpt:** and the next section)
    const excerptMatch = markdownContent.match(/\*\*Excerpt:\*\*\s*\n\n([^#]+)/);
    if (excerptMatch && setExcerpt) {
      console.log("Found excerpt:", excerptMatch[1]);
      setExcerpt(excerptMatch[1].trim());
    }

    // Extract key takeaways
    const keyTakeawaysMatch = markdownContent.match(/## Key Takeaways\n\n([\s\S]+?)(?=\n##|$)/);
    if (keyTakeawaysMatch && setKeyTakeaways) {
      console.log("Found key takeaways:", keyTakeawaysMatch[1]);
      setKeyTakeaways(keyTakeawaysMatch[1].trim());
    }

    // The main content will be everything between the first ## and ## Key Takeaways
    const mainContentMatch = markdownContent.match(/^(?:.*\n)*?##\s*[^\n]+\n\n([\s\S]+?)(?=\n##\s*Key Takeaways|$)/);
    if (mainContentMatch && setContent) {
      console.log("Found main content");
      setContent(mainContentMatch[1].trim());
    }
  };

  // Handle markdown content changes
  const handleMarkdownChange = (value: string) => {
    console.log("Markdown content changed");
    parseMarkdownContent(value);
  };

  const handleSubmit = async (isDraft: boolean = true) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create a post",
      });
      return;
    }

    if (!title || !content || !excerpt) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Starting blog post submission...");

    try {
      let imageUrl = existingImageUrl;

      // Only upload new image if one is selected
      if (image) {
        console.log("Processing new image upload...");
        const fileExt = image.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        console.log("Uploading image to storage:", fileName);
        const { error: uploadError, data } = await supabase.storage
          .from('blog-images')
          .upload(fileName, image, {
            upsert: false,
            contentType: image.type
          });

        if (uploadError) {
          console.error("Image upload error:", uploadError);
          throw uploadError;
        }

        console.log("Image upload successful:", data);
        
        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
        console.log("New image URL saved:", imageUrl);
      }

      const keywordsArray = keywords?.length ? keywords : title.toLowerCase().split(' ');
      const readTimeMinutes = calculateReadTime(content);
      console.log("Calculated read time:", readTimeMinutes, "minutes");

      const updateData = {
        title,
        content,
        excerpt,
        category: category || 'uncategorized',
        is_published: !isDraft,
        meta_title: metaTitle || title,
        meta_description: metaDescription || excerpt,
        keywords: keywordsArray,
        key_takeaways: keyTakeaways || '',
        read_time_minutes: readTimeMinutes,
        updated_at: new Date().toISOString(),
        ...(imageUrl && { image_url: imageUrl }),
      };

      let error;
      
      if (postId) {
        console.log("Updating existing blog post:", postId);
        const { error: updateError } = await supabase
          .from('blogs')
          .update(updateData)
          .eq('id', postId);
        error = updateError;
      } else {
        console.log("Creating new blog post");
        const timestamp = new Date().getTime();
        const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${timestamp}`;
        
        const { error: insertError } = await supabase
          .from('blogs')
          .insert({
            ...updateData,
            author_id: user.id,
            slug,
          });
        error = insertError;
      }

      if (error) {
        console.error("Blog post operation error:", error);
        throw error;
      }

      console.log("Blog post operation completed successfully");
      toast({
        title: "Success",
        description: postId 
          ? "Post updated successfully" 
          : (isDraft ? "Draft saved successfully" : "Post published successfully"),
      });

      navigate('/admin/blogs');
    } catch (error) {
      console.error('Error with blog post operation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: postId 
          ? "Failed to update post. Please try again." 
          : "Failed to create post. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSimpleMode) {
    return (
      <div className="space-y-6">
        {/* Simplified Category Selection */}
        <Card className="p-6">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded-md mt-2"
          >
            <option value="">Select a category</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </Card>

        {/* Image Upload */}
        <BlogImageUpload
          setImage={setImage}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          existingImageUrl={existingImageUrl}
        />

        {/* Markdown Content */}
        <Card className="p-6">
          <Label htmlFor="markdownContent">Blog Content (Markdown)</Label>
          <Textarea
            id="markdownContent"
            value={content}
            onChange={(e) => handleMarkdownChange(e.target.value)}
            placeholder={`# Title

**Meta Title:** Your SEO title

**Meta Description:** Your SEO description

**Keywords:** keyword1, keyword2, keyword3

**Excerpt:**

Brief summary of your post

## Content

Your blog post content here...

## Key Takeaways

* Key point 1
* Key point 2
* Key point 3`}
            className="h-[500px] font-mono mt-2"
          />
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Publish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <BlogFormHeader
        title={title}
        setTitle={setTitle}
        category={category}
        setCategory={setCategory}
        categories={categories}
      />

      <div className="space-y-4 bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-semibold text-gray-900">SEO Settings</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
            <Input
              id="metaTitle"
              placeholder="Meta title for search engines"
              value={metaTitle}
              onChange={(e) => setMetaTitle && setMetaTitle(e.target.value)}
              className="max-w-2xl"
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave blank to use the post title
            </p>
          </div>

          <div>
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Input
              id="metaDescription"
              placeholder="Brief description for search engines"
              value={metaDescription}
              onChange={(e) => setMetaDescription && setMetaDescription(e.target.value)}
              className="max-w-2xl"
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave blank to use the post excerpt
            </p>
          </div>

          <div>
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              placeholder="e.g., debt management, financial planning, savings"
              value={keywords?.join(', ')}
              onChange={(e) => {
                if (setKeywords) {
                  const keywordsString = e.target.value;
                  setKeywords(keywordsString.split(',').map(k => k.trim()));
                }
              }}
              className="max-w-2xl"
            />
          </div>
        </div>
      </div>

      <BlogImageUpload
        setImage={setImage}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        existingImageUrl={existingImageUrl}
      />

      <BlogContent
        excerpt={excerpt}
        setExcerpt={setExcerpt}
        content={content}
        setContent={setContent}
        keyTakeaways={keyTakeaways}
        setKeyTakeaways={setKeyTakeaways}
      />

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => handleSubmit(true)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          {postId ? "Update as Draft" : "Save as Draft"}
        </Button>
        <Button
          onClick={() => handleSubmit(false)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          {postId ? "Update & Publish" : "Publish"}
        </Button>
      </div>
    </div>
  );
};
