import apiSlice from "../app/ApiSlice";

export const documentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createDocument: builder.mutation({
      query: (formData) => ({
        url: "/documents",
        method: "POST",
        body: formData,
      }),
    }),
    getAllDocuments: builder.query({
      query: () => ({
        url: "/documents",
        method: "GET",
      }),
    }),
    getDocumentById: builder.query({
      query: (id) => ({
        url: `/documents/${id}`,
        method: "GET",
      }),
    }),
    deleteDocument: builder.mutation({
      query: (id) => ({
        url: `/documents/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateDocumentMutation,
  useGetAllDocumentsQuery,
  useGetDocumentByIdQuery,
  useDeleteDocumentMutation,
} = documentApi;
