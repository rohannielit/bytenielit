import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    const s = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:8080", {
      auth: { token },
      transports: ["websocket"],
    });
    s.on("connect", () => console.log("Socket connected"));
    s.on("onlineUsers", (users) => setOnlineUsers(users));
    setSocket(s);
    return () => s.disconnect();
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
