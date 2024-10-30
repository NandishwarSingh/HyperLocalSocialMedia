import React, { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useHistory } from "react-router-dom";

const supabase = createClient(
  "https://bacidsldmsllnflxmbsq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhY2lkc2xkbXNsbG5mbHhtYnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzMTA0ODEsImV4cCI6MjA0NTg4NjQ4MX0.IyqnSmv4OLKYEClc1mBIKYjjYuWd9CRDZhHcJHbhrYs"
);

export default function Feed() {
  const history = useHistory();

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
      <h1>Success</h1>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
}
