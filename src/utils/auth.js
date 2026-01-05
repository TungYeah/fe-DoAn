import { API_ENDPOINTS } from "../config/api";

export async function checkAuth() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const response = await fetch(API_ENDPOINTS.AUTH_CURRENT, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;

    const user = await response.json();
    return user;
  } catch (error) {
    return null;
  }
}
