import React, { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { NavLink, useHistory } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFetch } from "../Hooks/useFetch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";

const supabase =
  //addhere,
  // Replace with your actual Supabase anon key
  createClient();

const EditProfileDialog = ({ session }) => {
  const [username, setUsername] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    // Fetch existing profile data if available
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("users")
        .select("username")
        .eq("id", session.user.id)
        .single();
      if (data) setUsername(data.username);
    };
    fetchProfile();
  }, [session]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const updates = { username };
      if (image) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("images")
          .upload(`profile_${session.user.id}`, image);
        if (uploadError) throw uploadError;
        updates.avatar_url = uploadData.path;
      }

      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", session.user.id);
      if (error) throw error;

      console.log("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile information</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={session.user.avatar_url} />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <Input
              id="picture"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="max-w-[250px]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CommentsDialog = ({ postId, comments = [], onCommentAdded, session }) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState(comments);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("comments").insert([
        {
          post_id: postId,
          user_id: session.user.id,
          content: newComment,
        },
      ]);

      if (error) throw error;

      // Optimistically update local comments
      setLocalComments((prev) => [
        { content: newComment, created_at: new Date() }, // Simulated new comment object
        ...prev,
      ]);
      if (onCommentAdded) onCommentAdded();
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
          <DialogDescription>Join the conversation</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto">
            {localComments
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((comment, index) => (
                <div key={index} className="flex items-start gap-2">
                  <p className="text-sm text-muted-foreground">
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

const PostActionsDialog = ({ caption, onSaveCaption, onDelete }) => {
  const [editedCaption, setEditedCaption] = useState(caption);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ caption: editedCaption })
        .eq("id", postId);
      if (error) throw error;

      console.log("Caption updated successfully!");
    } catch (error) {
      console.error("Error updating caption:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Caption</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            value={editedCaption}
            onChange={(e) => setEditedCaption(e.target.value)}
            placeholder="Edit your caption"
          />
          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
          <Button onClick={onDelete} variant="destructive" className="w-full">
            Delete Post
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Profile() {
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
    const fetchSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        history.push("/signIn");
      } else {
        setSession(session);
      }
    };
    fetchSession();
  }, [history]);

  useEffect(() => {
    if (data) {
      setAllPosts(data);
      setVisiblePosts(data.slice(0, POSTS_PER_PAGE));
      setCurrentPage(1);
      setHasMore(data.length > POSTS_PER_PAGE);
    }
  }, [data]);

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
    const newPosts = allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

    if (newPosts.length > 0) {
      setVisiblePosts((prev) => [...prev, ...newPosts]);
      setCurrentPage((prev) => prev + 1);
      setHasMore(startIndex + newPosts.length < allPosts.length);
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

  if (loading) return <div className="w-full text-center py-4">Loading...</div>;
  if (error)
    return (
      <div className="w-full text-center py-4 text-red-500">
        Error loading posts: {error.message}
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <NavLink to="/feed" className="inline-flex items-center">
        <Button>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Feed
        </Button>
      </NavLink>
      <h1 className="text-4xl font-bold mt-4 mb-8 flex justify-center items-center wrap">
        This page is Incomplete because its made in a Single Day,Complete it
        YourSelf and Place a Pull Request
      </h1>{" "}
      <a
        href="https://github.com/NandishwarSingh/HyperLocalSocialMedia/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <h1 className="text-2xl font-bold mt-4 mb-8 flex justify-center items-center wrap">
          Click Here to Go to its GitHub Repo
        </h1>
      </a>
      <div className="flex flex-col items-center mb-8">
        <Avatar className="h-32 w-32 mb-4">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>UN</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold mb-4">
          {session?.user?.username || "Username"}
        </h1>
        <div className="flex gap-4 mb-4">
          <div className="text-center">
            <div className="font-semibold">{allPosts.length}</div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </div>
        </div>
        {session && <EditProfileDialog session={session} />}
      </div>
      <Separator className="my-8" />
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Your Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePosts
            .filter((post) => post.created_by === session?.user?.id)
            .map((post, index) => {
              const postContent = (
                <Card
                  key={post.id}
                  className="w-full h-[250px] p-4 flex flex-col"
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
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt={post.caption}
                        className="h-full w-full object-cover rounded-md"
                      />
                    )}
                  </div>

                  <Separator className="my-2" />

                  <div className="flex flex-row justify-between items-center">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.caption}
                    </p>
                    <CommentsDialog
                      postId={post.id}
                      comments={post.comments}
                      session={session}
                      onCommentAdded={refetch}
                    />
                  </div>
                </Card>
              );

              if (index === visiblePosts.length - 1) {
                return (
                  <div ref={lastPostElementRef} key={post.id}>
                    {postContent}
                  </div>
                );
              } else {
                return <div key={post.id}>{postContent}</div>;
              }
            })}
        </div>
        {isLoading && <div>Loading more posts...</div>}
      </div>
    </div>
  );
}
