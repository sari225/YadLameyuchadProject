import apiSlice from "../app/ApiSlice";

export const dayCampApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createDayCamp: builder.mutation({
      query: (formData) => ({
        url: "/daycamp",
        method: "POST",
        body: formData,
      }),
    }),
    getDayCamps: builder.query({
      query: () => ({
        url: "/daycamp",
        method: "GET",
      }),
    }),
    getDayCampById: builder.query({
      query: (id) => ({
        url: `/daycamp/${id}`,
        method: "GET",
      }),
    }),
    updateDayCamp: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/daycamp/${id}`,
        method: "PUT",
        body: formData,
      }),
    }),
    deleteDayCamp: builder.mutation({
      query: (id) => ({
        url: `/daycamp/${id}`,
        method: "DELETE",
      }),
    }),
    addChildToDayCamp: builder.mutation({
      query: (data) => ({
        url: "/daycamp/addChildToDayCamp",
        method: "PUT",
        body: data,
      }),
    }),
    removeChildFromDayCamp: builder.mutation({
      query: (data) => ({
        url: "/daycamp/removeChildFromDayCamp",
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const {
  useCreateDayCampMutation,
  useGetDayCampsQuery,
  useGetDayCampByIdQuery,
  useUpdateDayCampMutation,
  useDeleteDayCampMutation,
  useAddChildToDayCampMutation,
  useRemoveChildFromDayCampMutation,
} = dayCampApi;
