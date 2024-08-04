import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export const usePermissions = () => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const getPermissions = async () => {
      if (isAuthenticated && !isLoading) {
        try {
          const token = await getAccessTokenSilently({
            audience: "https://studenttrackapi.com",
          });
          const decodedToken = JSON.parse(atob(token.split(".")[1]));
          setPermissions(decodedToken.permissions || []);
        } catch (error) {
          console.error("Error getting permissions", error);
        }
      }
    };

    getPermissions();
  }, [getAccessTokenSilently, isAuthenticated, isLoading]);

  const hasPermission = (permission) => permissions.includes(permission);

  return { permissions, hasPermission };
};
