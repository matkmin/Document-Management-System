import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axios";

const AuthContext = createContext({
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
    isLoading: true,
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));
    const [isLoading, setIsLoading] = useState(true);

    const setUserAndToken = (user, token) => {
        if (token) {
            localStorage.setItem("ACCESS_TOKEN", token);
            setToken(token);
            setUser(user);
        } else {
            localStorage.removeItem("ACCESS_TOKEN");
            setToken(null);
            setUser(null);
        }
    };

    const login = async (email, password) => {
        try {
            const { data } = await axiosClient.post("/login", { email, password });
            setUserAndToken(data.user, data.access_token);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await axiosClient.post("/logout");
        } catch (e) { /* ignore logout errors */ }
        setUserAndToken(null, null);
    };

    useEffect(() => {
        if (token) {
            // Fetch user if we have a token but no user data (e.g. refresh)
            if (!user) {
                axiosClient.get("/user")
                    .then(({ data }) => {
                        setUser(data);
                        setIsLoading(false);
                    })
                    .catch(() => {
                        setUserAndToken(null, null);
                        setIsLoading(false);
                    });
            } else {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, setUser, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
