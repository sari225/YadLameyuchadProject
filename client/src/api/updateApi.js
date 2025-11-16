import apiSlice from "../app/ApiSlice";

export const updateApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createUpdating: builder.mutation({
      query: (formData) => ({
        url: "/update",
        method: "POST",
        body: formData,
      }),
    }),
    getUpdatings: builder.query({
      query: () => ({
        url: "/update",
        method: "GET",
      }),
    }),
    getUpdatingById: builder.query({
      query: (id) => ({
        url: `/update/${id}`,
        method: "GET",
      }),
    }),
    updateUpdating: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/update/${id}`,
        method: "PUT",
        body: formData,
      }),
    }),
    deleteUpdating: builder.mutation({
      query: (id) => ({
        url: `/update/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateUpdatingMutation,
  useGetUpdatingsQuery,
  useGetUpdatingByIdQuery,
  useUpdateUpdatingMutation,
  useDeleteUpdatingMutation,
} = updateApi;
