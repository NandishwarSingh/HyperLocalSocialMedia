import React, { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
