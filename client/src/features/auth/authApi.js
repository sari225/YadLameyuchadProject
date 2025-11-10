import apiSlice from "../../app/ApiSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (registerUser) => ({
        url: "/auth/register",
        method: "POST",
        body: registerUser,
      }),
    }),
    login: builder.mutation({
      query: (loginData) => ({
        url: "/auth/login",
        method: "POST",
        body: loginData,
      }),
    }),
    verifyOTP: builder.mutation({
      query: (otpData) => ({
        url: "/auth/verifyOTP",
        method: "PUT",
        body: otpData,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "/auth/forgotPassword",
        method: "PUT",
        body: email,
      }),
    }),
    approveChild: builder.mutation({
      query: (childId) => ({
        url: `/auth/${childId}`,
        method: "PUT",
      }),
    }),

  }),
});

export const { useRegisterMutation, useLoginMutation, useVerifyOTPMutation, useForgotPasswordMutation, useApproveChildMutation } = authApi;
