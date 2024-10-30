import React, { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardTitle } from "@/components/ui/card";
import { useHistory } from "react-router-dom";

export default function SignIn() {
  const history = useHistory();
  const supabaseUrl = "https://bacidsldmsllnflxmbsq.supabase.co";
  const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhY2lkc2xkbXNsbG5mbHhtYnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzMTA0ODEsImV4cCI6MjA0NTg4NjQ4MX0.IyqnSmv4OLKYEClc1mBIKYjjYuWd9CRDZhHcJHbhrYs";

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        history.push("/feed");
      }
    };

    checkUser();
  }, [history]);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/feed`,
      },
    });

    if (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-[350px] h-[350px] p-4">
        <CardTitle className="mb-4">Sign In</CardTitle>
        <button onClick={handleLogin} className="px-4 py-2 border rounded">
          Login with Google
        </button>
      </Card>
    </div>
  );
}
