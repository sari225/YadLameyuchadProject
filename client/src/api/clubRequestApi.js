import apiSlice from "../app/ApiSlice";

export const clubRequestApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createClubRequest: builder.mutation({
      query: (requestData) => ({
        url: "/clubRequest",
        method: "POST",
        body: requestData,
      }),
    }),
    getAllClubRequests: builder.query({
      query: () => ({
        url: "/clubRequest",
        method: "GET",
      }),
    }),
    getClubRequestById: builder.query({
      query: (id) => ({
        url: `/clubRequest/${id}`,
        method: "GET",
      }),
    }),
    deleteClubRequest: builder.mutation({
      query: (id) => ({
        url: `/clubRequest/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateClubRequestMutation,
  useGetAllClubRequestsQuery,
  useGetClubRequestByIdQuery,
  useDeleteClubRequestMutation,
} = clubRequestApi;
