"use client";
import GetUserApi from "@/apis/GetUserApi";
import Loading from "@/components/Loading";
import { useRouter, usePathname } from "next/navigation";
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

const initialState = {
  user: null,
};

const userReducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const [loading, setLoading] = useState(true);
  const [routingComplete, setRoutingComplete] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ["/","/auth/login", "/auth/signup", "/auth/forgotpassword","/auth/reset-password"];

  // Fetch user from token
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (!publicRoutes.includes(pathname)) {
          router.push("/auth/login");
        }
        setLoading(false);
        return;
      }

      try {
        const data = await GetUserApi(token);
        if (data) {
          dispatch({ type: "SET_USER", payload: data });
        } else {
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router, pathname]);

  // Route logic after user is fetched
  useEffect(() => {
    const { user } = state;
    if (loading) return;

    const isVerified = user?.verified;

    // 🔒 If user exists, disallow access to /auth/forgotpassword
    if (user && pathname === "/auth/forgotpassword") {
      if (isVerified) {
        router.push("/dashboard");
      } else {
        router.push("/auth/otp");
      }
      return;
    }

    // 🔐 If logged-in user tries to access login or signup
   if (user && ["/", "/auth/login", "/auth/signup"].includes(pathname)) {

      if (!isVerified) {
        router.push("/auth/otp");
      } else {
        router.push("/dashboard");
      }
      return;
    }

    // 🧾 Unverified users should only access /auth/otp
    if (user && !isVerified && pathname !== "/auth/otp") {
      router.push("/auth/otp");
      return;
    }

    // ✅ Verified user shouldn't access /auth/otp
    if (user && isVerified && pathname === "/auth/otp") {
      router.push("/dashboard");
      return;
    }

    // 🚫 If not logged in and route is protected
    if (!user && !publicRoutes.includes(pathname)) {
      router.push("/auth/login");
      return;
    }

    setRoutingComplete(true);
  }, [state.user, loading, pathname, router]);

  if (loading || !routingComplete) {
    return <Loading />;
  }

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};
