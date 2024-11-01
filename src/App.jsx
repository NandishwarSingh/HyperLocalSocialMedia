import SignIn from "./Pages/SignIn";
import Feed from "./Pages/Feed";
import Profile from "./Pages/Profile";
import { useEffect } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Rocket, Users, CheckCircle } from "lucide-react";
import {
  BrowserRouter,
  Route,
  Switch,
  NavLink,
  Redirect,
  useHistory,
} from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase =
  //addhere,
  // Replace with your actual Supabase anon key
  createClient();
function ProtectedRoute({ children, ...rest }) {
  const session = supabase.auth.getSession();

  return (
    <Route
      {...rest}
      render={() => (session ? children : <Redirect to="/signIn" />)}
    />
  );
}

// Separate component for routes that need access to router hooks
function AppRoutes() {
  const history = useHistory();

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

  return (
    <Switch>
      <Route exact path="/">
        <div className="min-h-screen bg-black text-green">
          {/* Navigation */}
          <nav className="px-6 py-4 flex justify-between items-center border-b border-green/20">
            <div className="flex items-center space-x-4">
              <span className="text-xl font-bold text-green-300">
                Shoolini Connect
              </span>
            </div>
            <div className="space-x-4">
              <NavLink to="/signIn">
                {" "}
                <Button>SignIn</Button>
              </NavLink>
            </div>
          </nav>

          {/* Hero Section */}
          <div className="container mx-auto px-6 py-16 text-center">
            <h1 className="text-5xl font-bold mb-4">
              <span className="text-green">Shoolini Connect</span>
            </h1>
            <p className="text-xl text-green-300 mb-8">
              Gossip Anonymously and Comment on your Favorite Posts
            </p>
            <div className="space-x-4">
              <NavLink to="/signIn">
                <Button size="lg">
                  SignIn <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </NavLink>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-green/5 py-16">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold text-center mb-12">
                Why Should You Use This App
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="bg-black border border-green/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-green">
                      <Users className="mr-3 h-6 w-6 text-green" />
                      Completely Anonymous
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-300">
                      Talk about your classmates or anyone without then knowing
                      your real identity
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-black border border-green/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-green">
                      <CheckCircle className="mr-3 h-6 w-6 text-green" />
                      Comments on Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-300">
                      Comment and Gossip on posts Anonymously
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-black border border-green/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-green">
                      <Rocket className="mr-3 h-6 w-6 text-green" />
                      Open Source
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-300">
                      This React and Tailwind CSS Project is Completely Open
                      Sourced
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="container mx-auto px-6 py-16 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-green-300 mb-8">
              Join and Chat Anonymously Today.
            </p>
            <NavLink to="/signIn">
              <Button size="lg">
                SignIn <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </NavLink>
          </div>

          {/* Footer */}
          <footer className="bg-green/5 py-8">
            <div className="container mx-auto px-6 text-center">
              <p className="text-green-300">
                © 2024 Shoolini Connect. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </Route>
      <Route path="/signIn">
        <SignIn />
      </Route>
      <ProtectedRoute path="/profile">
        <Profile />
      </ProtectedRoute>
      <ProtectedRoute path="/feed">
        <Feed />
      </ProtectedRoute>

      <ProtectedRoute path="*">
        <Redirect to="/signIn" />
      </ProtectedRoute>
    </Switch>
  );
}

// Main App component
function App() {
  return (
    <div>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;
