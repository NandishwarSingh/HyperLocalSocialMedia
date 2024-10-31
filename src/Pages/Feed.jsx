import React, { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useHistory, NavLink } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

const supabase = createClient(
  "https://bacidsldmsllnflxmbsq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhY2lkc2xkbXNsbG5mbHhtYnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzMTA0ODEsImV4cCI6MjA0NTg4NjQ4MX0.IyqnSmv4OLKYEClc1mBIKYjjYuWd9CRDZhHcJHbhrYs"
);

const CreatePostDialog = () => (
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
          <Input id="image" type="file" accept="image/*" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="caption">Caption</Label>
          <Textarea
            id="caption"
            placeholder="Write a caption for your post..."
            className="resize-none"
          />
        </div>
        <Button className="w-full">Post</Button>
      </div>
    </DialogContent>
  </Dialog>
);

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
          {/* Example comments - replace with actual comments */}
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

export default function Feed() {
  const history = useHistory();
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

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        history.push("/signIn");
      }
    };

    checkUser();
  }, [history]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    history.push("/signIn");
  };

  return (
    <div>
      <nav className="bg-background shadow-xl">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <NavLink to="/feed">Logo</NavLink>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <CreatePostDialog />
                <Button onClick={handleSignOut}>Sign Out</Button>
                <NavLink to="/profile">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>Profile</AvatarFallback>
                  </Avatar>
                </NavLink>
              </div>
            </div>

            <div className="md:hidden">
              <CreatePostDialog />
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
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>Profile</AvatarFallback>
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
      <div className="pt-5 flex flex-row gap-5 flex-wrap items-center justify-center">
        {visiblePosts.map((post, index) => {
          const postContent = (
            <Card key={index} className="w-[350px] h-[250px] p-4 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>Profile</AvatarFallback>
                </Avatar>
                <span className="font-medium">Name</span>
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
                <CommentsDialog postId={post} />
              </div>
            </Card>
          );

          if (visiblePosts.length === index + 1 && hasMore) {
            return (
              <div key={index} ref={lastPostElementRef}>
                {postContent}
              </div>
            );
          }
          return <div key={index}>{postContent}</div>;
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
