import apiSlice from "../app/ApiSlice";

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createAdmin: builder.mutation({
      query: (adminData) => ({
        url: "/admin",
        method: "POST",
        body: adminData,
      }),
    }),
    getAdmins: builder.query({
      query: () => ({
        url: "/admin",
        method: "GET",
      }),
    }),
    updateAdmin: builder.mutation({
      query: ({ id, adminData }) => ({
        url: `/admin/${id}`,
        method: "PUT",
        body: adminData,
      }),
    }),
    deleteAdmin: builder.mutation({
      query: (id) => ({
        url: `/admin/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateAdminMutation,
  useGetAdminsQuery,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
} = adminApi;
