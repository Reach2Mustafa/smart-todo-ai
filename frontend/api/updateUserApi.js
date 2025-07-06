import axiosInstance from "./axiosinstance";

const UpdateUserApi = async (data) => {
  const headers = {
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };
  try {
    const response = await axiosInstance.put(
      `/api/v1/users/updateuser/`,
      data,
      { headers }
    );
    return response.data;
  } catch (error) {
    return {
      error:
        error?.response?.data?.error || "Failed to Update. Please try again",
    };
  }
};

export default UpdateUserApi;
