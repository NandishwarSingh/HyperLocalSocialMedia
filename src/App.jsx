import SignIn from "./Pages/SignIn";
import Feed from "./Pages/Feed";
import Profile from "./Pages/Profile";
import { useEffect } from "react";
import {
  BrowserRouter,
  Route,
  Switch,
  NavLink,
  Redirect,
  useHistory,
} from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://bacidsldmsllnflxmbsq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhY2lkc2xkbXNsbG5mbHhtYnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzMTA0ODEsImV4cCI6MjA0NTg4NjQ4MX0.IyqnSmv4OLKYEClc1mBIKYjjYuWd9CRDZhHcJHbhrYs"
);

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
        <NavLink to="/signIn">Go</NavLink>
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
