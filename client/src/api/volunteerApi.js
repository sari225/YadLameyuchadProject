import apiSlice from "../app/ApiSlice";

export const volunteerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createVolunteer: builder.mutation({
      query: (volunteerData) => ({
        url: "/volunteer",
        method: "POST",
        body: volunteerData,
      }),
      invalidatesTags: ['Volunteer'],
    }),
    getVolunteers: builder.query({
      query: () => ({
        url: "/volunteer",
        method: "GET",
      }),
      providesTags: ['Volunteer'],
    }),
    getVolunteerById: builder.query({
      query: (id) => ({
        url: `/volunteer/${id}`,
        method: "GET",
      }),
    }),
    updateVolunteer: builder.mutation({
      query: ({ id, volunteerData }) => ({
        url: `/volunteer/${id}`,
        method: "PUT",
        body: volunteerData,
      }),
      invalidatesTags: ['Volunteer'],
    }),
    deleteVolunteer: builder.mutation({
      query: (id) => ({
        url: `/volunteer/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Volunteer', 'Club'],
    }),
    addClubToVolunteer: builder.mutation({
      query: ({ volunteerId, clubName, child }) => ({
        url: `/volunteer/addClubToVolunteer/${volunteerId}`,
        method: "PUT",
        body: { clubName, child },
      }),
      invalidatesTags: ['Volunteer', 'Club'],
    }),
    updateClubInVolunteer: builder.mutation({
      query: ({ volunteerId, clubId, clubData }) => ({
        url: `/volunteer/${volunteerId}/updateClub/${clubId}`,
        method: "PUT",
        body: clubData,
      }),
      invalidatesTags: ['Volunteer'],
    }),
    removeClubFromVolunteer: builder.mutation({
      query: ({ volunteerId, clubId }) => ({
        url: `/volunteer/${volunteerId}/removeClub/${clubId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Volunteer', 'Club'],
    }),
  }),
});

export const {
  useCreateVolunteerMutation,
  useGetVolunteersQuery,
  useGetVolunteerByIdQuery,
  useUpdateVolunteerMutation,
  useDeleteVolunteerMutation,
  useAddClubToVolunteerMutation,
  useUpdateClubInVolunteerMutation,
  useRemoveClubFromVolunteerMutation,
} = volunteerApi;
