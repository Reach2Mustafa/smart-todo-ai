import axiosInstance from "./axiosinstance";
const SendOtpApi = async (data) => {
  try {
    const response = await axiosInstance.post(
      `/api/v1/users/send-otp/`,
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
export default SendOtpApi;
