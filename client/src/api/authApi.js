import apiSlice from "../app/ApiSlice";

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
    googleLogin: builder.mutation({
      query: (credential) => ({
        url: "/auth/google-login",
        method: "POST",
        body: credential,
      }),
    }),

  }),
});

export const { useRegisterMutation, useLoginMutation, useVerifyOTPMutation, useForgotPasswordMutation, useApproveChildMutation, useGoogleLoginMutation } = authApi;
