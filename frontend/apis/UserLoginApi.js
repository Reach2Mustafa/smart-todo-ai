import axiosInstance from "./axiosinstance";
const UserLoginApi = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/v1/users/login/`, data);
    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    return {
      error:
        error?.response?.data?.error || "Please try again",
    };
  }
};

export default UserLoginApi;
