export async function checkAuth() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const response = await fetch("http://20.249.208.207:8080/api/v1/auth/current", {
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
