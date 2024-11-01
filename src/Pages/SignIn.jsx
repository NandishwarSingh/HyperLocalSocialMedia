import React, { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHistory } from "react-router-dom";

export default function SignIn() {
  const history = useHistory();
  const supabaseUrl = "https://bacidsldmsllnflxmbsq.supabase.co";
  const supabase =
    //addhere,
    // Replace with your actual Supabase anon key
    createClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Check if user already exists in the users table
          const { data: existingUser, error: fetchError } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (fetchError && fetchError.code !== "PGRST116") {
            // PGRST116 is "not found" error
            throw fetchError;
          }

          if (!existingUser) {
            // Create new user profile if it doesn't exist
            const { error: createError } = await supabase.from("users").insert([
              {
                id: session.user.id,
                username:
                  session.user.user_metadata.username ||
                  `user_${session.user.id.slice(0, 8)}`,
                avatar_url: session.user.user_metadata.avatar_url || null,
                bio: null,
              },
            ]);

            if (createError) {
              if (createError.code === "23505") {
                // Unique constraint violation
                setError(
                  "Username already exists. Please try a different one."
                );
                return;
              }
              throw createError;
            }
          }

          // Only redirect after successful user creation or if user already exists
          history.push("/feed");
        }
      } catch (error) {
        console.error("Error in checkUser:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
      }
    };

    checkUser();
  }, [history]);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/signIn`,
      },
    });

    if (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-[350px] h-[350px] p-4 flex flex-col items-center justify-center gap-[80px]">
        <CardTitle className="mb-4 text-6xl">Sign In</CardTitle>

        <Button onClick={handleLogin} className="px-4 py-2 border rounded">
          <img
            src="https://th.bing.com/th/id/R.0fa3fe04edf6c0202970f2088edea9e7?rik=joOK76LOMJlBPw&riu=http%3a%2f%2fpluspng.com%2fimg-png%2fgoogle-logo-png-open-2000.png&ehk=0PJJlqaIxYmJ9eOIp9mYVPA4KwkGo5Zob552JPltDMw%3d&risl=&pid=ImgRaw&r=0"
            width="20px"
            alt="google logo"
          />
          Login with Google{" "}
        </Button>
      </Card>
    </div>
  );
}
