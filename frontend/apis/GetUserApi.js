import axiosInstance from "./axiosinstance";
const GetUserApi = async (token) => {
  const headers = {
    authorization: `Bearer ${token}`,
  };
  try {
    const response = await axiosInstance.get("/api/v1/users/getuser/", {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
    return null;
  }
};
export default GetUserApi;
