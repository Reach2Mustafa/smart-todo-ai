import axiosInstance from "./axiosinstance";

const VerifyOtpApi = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axiosInstance.post(
      "/api/v1/users/verify-otp/",
      data,
      { headers }
    );

    return response.data;
  } catch (error) {
    // 🧪 Add full diagnostics here:
    // console.error("VerifyOtpApi error:", {
    //   message: error.message,
    //   status: error.response?.status,
    //   data: error.response?.data,
    // });
// console.log("VerifyOtpApi error:", error);
    return error.response?.data || { error: "Unknown error occurred" };
  }
};

export default VerifyOtpApi;
