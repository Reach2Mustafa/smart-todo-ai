import axiosInstance from "./axiosinstance";
const UserSignupApi = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/v1/users/register/`, data);
    console.log("UserSignupApi response:", response);
    localStorage.setItem("token", response.data.user.token);
    return response.data.user;
  } catch (error) {
    return {
      error:
        error?.response?.data?.error || "Please try again",
    };
  }
};

export default UserSignupApi;
