import apiSlice from "../app/ApiSlice";

export const clubApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createClub: builder.mutation({
      query: (clubData) => ({
        url: "/club",
        method: "POST",
        body: clubData,
      }),
      invalidatesTags: ['Club'],
    }),
    getClubs: builder.query({
      query: () => ({
        url: "/club",
        method: "GET",
      }),
      providesTags: ['Club'],
    }),
    getClubById: builder.query({
      query: (id) => ({
        url: `/club/${id}`,
        method: "GET",
      }),
      providesTags: ['Club'],
    }),
    updateClub: builder.mutation({
      query: ({ id, clubData }) => ({
        url: `/club/${id}`,
        method: "PUT",
        body: clubData,
      }),
      invalidatesTags: ['Club'],
    }),
    deleteClub: builder.mutation({
      query: (id) => ({
        url: `/club/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Club', 'Volunteer'],
    }),
    requestJoinClub: builder.mutation({
      query: (data) => ({
        url: "/club/requestJoin",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Club'],
    }),
    addChildToClub: builder.mutation({
      query: (data) => ({
        url: "/club/addChildToClub",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ['Club', 'Child'],
    }),
    refuseChildFromClub: builder.mutation({
      query: (data) => ({
        url: "/club/Refuse",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ['Club', 'Child'],
    }),
    removeChildFromClub: builder.mutation({
      query: ({ clubId, childId }) => ({
        url: `/club/removeChildFromClub/${clubId}`,
        method: "PUT",
        body: { childId },
      }),
      invalidatesTags: ['Club', 'Child'],
    }),
    addVolunteerToClub: builder.mutation({
      query: (data) => ({
        url: "/club/addVolunteerToClub",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ['Club', 'Volunteer'],
    }),
    removeVolunteerFromClub: builder.mutation({
      query: (data) => ({
        url: "/club/removeVolunteerFromClub",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ['Club', 'Volunteer'],
    }),
  }),
});

export const {
  useCreateClubMutation,
  useGetClubsQuery,
  useGetClubByIdQuery,
  useUpdateClubMutation,
  useDeleteClubMutation,
  useRequestJoinClubMutation,
  useAddChildToClubMutation,
  useRefuseChildFromClubMutation,
  useRemoveChildFromClubMutation,
  useAddVolunteerToClubMutation,
  useRemoveVolunteerFromClubMutation,
} = clubApi;
