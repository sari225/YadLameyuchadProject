import apiSlice from "../app/ApiSlice";

export const clubApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createClub: builder.mutation({
      query: (clubData) => ({
        url: "/club",
        method: "POST",
        body: clubData,
      }),
    }),
    getClubs: builder.query({
      query: () => ({
        url: "/club",
        method: "GET",
      }),
    }),
    getClubById: builder.query({
      query: (id) => ({
        url: `/club/${id}`,
        method: "GET",
      }),
    }),
    updateClub: builder.mutation({
      query: ({ id, clubData }) => ({
        url: `/club/${id}`,
        method: "PUT",
        body: clubData,
      }),
    }),
    deleteClub: builder.mutation({
      query: (id) => ({
        url: `/club/${id}`,
        method: "DELETE",
      }),
    }),
    addChildToClub: builder.mutation({
      query: (data) => ({
        url: "/club/addChildToClub",
        method: "PUT",
        body: data,
      }),
    }),
    refuseChildFromClub: builder.mutation({
      query: (data) => ({
        url: "/club/Refuse",
        method: "PUT",
        body: data,
      }),
    }),
    removeChildFromClub: builder.mutation({
      query: (id) => ({
        url: `/club/removeChildFromClub/${id}`,
        method: "PUT",
      }),
    }),
  }),
});

export const {
  useCreateClubMutation,
  useGetClubsQuery,
  useGetClubByIdQuery,
  useUpdateClubMutation,
  useDeleteClubMutation,
  useAddChildToClubMutation,
  useRefuseChildFromClubMutation,
  useRemoveChildFromClubMutation,
} = clubApi;
