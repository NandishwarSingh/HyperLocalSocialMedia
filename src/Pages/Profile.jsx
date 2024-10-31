import React, { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

const EditProfileDialog = () => {
  const [username, setUsername] = useState("Username");
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = () => {
    console.log("Update profile with:", { username, image });
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
              <AvatarImage src="https://github.com/shadcn.png" />
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

const CommentsDialog = ({ postId }) => (
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
          <div className="flex items-start gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">Username</span>
              <p className="text-sm text-muted-foreground">
                This is a comment!
              </p>
            </div>
          </div>
        </div>
        <Separator />
        <div className="grid gap-2">
          <Textarea placeholder="Write a comment..." className="resize-none" />
          <Button className="w-full">Post Comment</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const PostActionsDialog = ({ caption, onSaveCaption, onDelete }) => {
  const [editedCaption, setEditedCaption] = useState(caption);

  const handleSave = () => {
    onSaveCaption(editedCaption);
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
  const [allPosts] = useState([1, 2, 3, 4, 5, 67, 8, 9, 0, 6, 4]);
  const [visiblePosts, setVisiblePosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observer = useRef();
  const POSTS_PER_PAGE = 6;

  const lastPostElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts();
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, isLoading]
  );

  const loadMorePosts = () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    setTimeout(() => {
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
    }, 500);
  };

  useEffect(() => {
    loadMorePosts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button>
        <NavLink to="/feed" className="inline-flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Feed
        </NavLink>
      </Button>
      <div className="flex flex-col items-center mb-8">
        <Avatar className="h-32 w-32 mb-4">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>UN</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold mb-4">Username</h1>
        <div className="flex gap-4 mb-4">
          <div className="text-center">
            <div className="font-semibold">{allPosts.length}</div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </div>
        </div>
        <EditProfileDialog />
      </div>

      <Separator className="my-8" />

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Your Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePosts.map((post, index) => {
            const postContent = (
              <Card className="w-full h-[250px] p-4 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>Profile</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">Username</span>
                </div>

                <Separator className="my-2" />

                <div className="flex-grow">
                  <div className="h-[120px] bg-muted rounded-md flex items-center justify-center">
                    Post data
                  </div>
                </div>

                <Separator className="my-2" />

                <div className="flex flex-row justify-between items-center">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    Caption
                  </p>
                  <div className="flex gap-2">
                    <PostActionsDialog
                      onEdit={() => console.log(`Edit post ${post}`)}
                      onDelete={() => console.log(`Delete post ${post}`)}
                    />
                    <CommentsDialog postId={post} />
                  </div>
                </div>
              </Card>
            );

            if (visiblePosts.length === index + 1 && hasMore) {
              return (
                <div key={index} ref={lastPostElementRef}>
                  {postContent}
                </div>
              );
            } else {
              return <div key={index}>{postContent}</div>;
            }
          })}
        </div>
        {isLoading && <div className="text-center">Loading...</div>}
      </div>
    </div>
  );
}
