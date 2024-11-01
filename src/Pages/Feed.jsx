import React, { useState, useEffect, useRef, useCallback } from "react";
import { useHistory, NavLink } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "../Hooks/use-toast";
import { useFetch } from "../Hooks/useFetch";
const supabase = createClient(
  "https://bacidsldmsllnflxmbsq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhY2lkc2xkbXNsbG5mbHhtYnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzMTA0ODEsImV4cCI6MjA0NTg4NjQ4MX0.IyqnSmv4OLKYEClc1mBIKYjjYuWd9CRDZhHcJHbhrYs" // Replace with your actual Supabase anon key
);
const CreatePostDialog = ({ onPostCreated }) => {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { toast } = useToast();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create preview URL for the selected image
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    if (!image || !caption.trim()) {
      toast({
        title: "Missing Required Fields",
        description: "Please select an image and add a caption",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Get current user
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) throw new Error("User not authenticated");

      // 2. Upload image to Supabase Storage
      const fileExt = image.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("posts")
        .upload(filePath, image, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 3. Get public URL for the uploaded image
      const {
        data: { publicUrl },
      } = supabase.storage.from("posts").getPublicUrl(filePath);

      // 4. Insert post record in the database
      const { error: insertError, data: newPost } = await supabase
        .from("posts")
        .insert([
          {
            user_id: session.user.id,
            image_url: publicUrl,
            caption: caption,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // 5. Success handling
      toast({
        title: "Post Created",
        description: "Your post has been successfully created!",
      });

      // 6. Reset form
      setImage(null);
      setCaption("");
      setPreviewUrl(null);
      window.location.reload();

      // 7. Trigger refresh
      if (onPostCreated) onPostCreated();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error Creating Post",
        description:
          error.message ||
          "There was an error creating your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create +</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Share your thoughts with the community
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {previewUrl && (
              <div className="mt-2 relative w-full h-[200px] rounded-md overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              placeholder="Write a caption for your post..."
              className="resize-none"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting || !image || !caption.trim()}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CommentsDialog = ({
  postId,
  comments = [],
  onCommentAdded,
  avatar,
  username,
}) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState(comments);

  // Update local comments when props change
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) throw new Error("User not authenticated");

      const { error, data } = await supabase
        .from("comments")
        .insert([
          {
            post_id: postId,
            user_id: session.user.id,
            content: newComment,
          },
        ])
        .select("*");

      if (error) {
        throw error;
      }

      // Optimistically update local comments
      const newCommentObj = data[0];
      setLocalComments((prev) => [newCommentObj, ...prev]);

      // Signal comment added to parent component
      if (onCommentAdded) onCommentAdded();

      // Clear new comment input
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">Comments</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription>
            Join the conversation anonymously
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto">
            {localComments
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((comment, index) => (
                <div key={index} className="flex items-start gap-2">
                  <p className="text-sm text-muted-foreground ">
                    <Card className="p-2">{comment.content}</Card>
                  </p>
                </div>
              ))}
          </div>
          <Separator />
          <div className="grid gap-2">
            <Textarea
              placeholder="Write a comment..."
              className="resize-none"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={handleSubmitComment}
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Feed() {
  const history = useHistory();
  const [session, setSession] = useState(null);
  const { data, error, loading, refetch } = useFetch("post_details");
  const [allPosts, setAllPosts] = useState([]);
  const [visiblePosts, setVisiblePosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const observer = useRef();
  const POSTS_PER_PAGE = 6;

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (data) {
      setAllPosts(data);
      setVisiblePosts(data.slice(0, POSTS_PER_PAGE));
      setCurrentPage(1);
      setHasMore(data.length > POSTS_PER_PAGE);
    }
  }, [data]);

  const checkUser = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      if (!session) {
        history.push("/signIn");
      } else {
        setSession(session);
      }
    } catch (error) {
      console.error("Error checking user session:", error);
      history.push("/signIn");
    }
  };

  const lastPostElementRef = useCallback(
    (node) => {
      if (loading || !node || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts();
        }
      });
      observer.current.observe(node);
    },
    [hasMore, loading]
  );

  const loadMorePosts = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const startIndex = currentPage * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const newPosts = allPosts.slice(startIndex, endIndex);

    if (newPosts.length > 0) {
      setVisiblePosts((prev) => [...prev, ...newPosts]);
      setCurrentPage((prev) => prev + 1);
      setHasMore(endIndex < allPosts.length);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  }, [currentPage, hasMore, isLoading, allPosts]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      history.push("/signIn");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handlePostCreated = () => {
    refetch();
  };

  if (loading) {
    return <div className="w-full text-center py-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="w-full text-center py-4 text-red-500">
        Error loading posts: {error.message}
      </div>
    );
  }

  return (
    <div>
      <nav class="fixed bg-background shadow-xl  left-0 right-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <NavLink to="/feed">
                <b>ShooliniConnect</b>
              </NavLink>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <CreatePostDialog onPostCreated={handlePostCreated} />
                <Button onClick={handleSignOut}>Sign Out</Button>
                <NavLink to="/profile">
                  <Avatar>
                    <AvatarImage
                      src={session?.user?.user_metadata?.avatar_url}
                      alt="Profile"
                    />
                    <AvatarFallback>
                      {session?.user?.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </NavLink>
              </div>
            </div>

            <div className="md:hidden">
              <CreatePostDialog onPostCreated={handlePostCreated} />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-2">
                    <span className="sr-only">Open menu</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="mt-6 flex flex-col space-y-2">
                    <NavLink to="/profile">
                      <Avatar>
                        <AvatarImage
                          src={session?.user?.user_metadata?.avatar_url}
                          alt="Profile"
                        />
                        <AvatarFallback>
                          {session?.user?.email?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </NavLink>
                    <Button onClick={handleSignOut}>Sign Out</Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 flex flex-row gap-5 flex-wrap items-center justify-center">
        {visiblePosts.map((post, index) => {
          const postContent = (
            <Card
              key={post.id}
              className="w-[350px] h-[250px] p-4 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.avatar_url} alt={post.username} />
                  <AvatarFallback>{post.username?.[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{post.username}</span>
              </div>

              <Separator className="my-2" />

              <div className="flex-grow">
                <div className="h-[120px] bg-muted rounded-md flex items-center justify-center">
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt={post.caption}
                      className="h-full w-full object-cover rounded-md"
                    />
                  )}
                </div>
              </div>

              <Separator className="my-2" />

              <div className="flex flex-row justify-between items-center">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.caption}
                </p>
                <CommentsDialog
                  postId={post.id}
                  comments={post.comments}
                  username={post.username}
                  avatar={post.avatar_url}
                  onCommentAdded={handlePostCreated}
                />
              </div>
            </Card>
          );

          if (visiblePosts.length === index + 1) {
            return (
              <div key={post.id} ref={lastPostElementRef}>
                {postContent}
              </div>
            );
          }
          return <div key={post.id}>{postContent}</div>;
        })}

        {isLoading && (
          <div className="w-full text-center py-4">Loading more posts...</div>
        )}

        {!hasMore && visiblePosts.length > 0 && (
          <div className="w-full text-center py-4 text-gray-500">
            No more posts to load
          </div>
        )}
      </div>
    </div>
  );
}
