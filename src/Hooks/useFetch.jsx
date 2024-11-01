import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://bacidsldmsllnflxmbsq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhY2lkc2xkbXNsbG5mbHhtYnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzMTA0ODEsImV4cCI6MjA0NTg4NjQ4MX0.IyqnSmv4OLKYEClc1mBIKYjjYuWd9CRDZhHcJHbhrYs" // Replace with your actual Supabase anon key
);

export const useFetch = (table) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Fetch data from the specified table (post_details) with sorting
        const { data: posts, error } = await supabase
          .from(table)
          .select("*")
          .order("created_at", { ascending: false }); // Sort by created_at in descending order

        if (error) throw error;
        if (isMounted) {
          setData(posts || []);
        }
      } catch (error) {
        if (isMounted) {
          setError(error);
          setData([]); // Reset data on error
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Cleanup function to prevent state update
    };
  }, [table]);

  return { data, loading, error };
};
