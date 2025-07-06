import axiosInstance from "./axiosinstance";
const ResetPasswordApi = async (data) => {
  try {
    const response = await axiosInstance.post(
      `/api/v1/users/reset-password/`,
      data
    );
    return response.data;
  } catch (error) {
   return {
      error:
        error?.response?.data?.error || "Please try again",
    };
  }
};
export default ResetPasswordApi;
