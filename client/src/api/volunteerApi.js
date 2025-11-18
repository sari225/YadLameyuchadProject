import apiSlice from "../app/ApiSlice";

export const volunteerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createVolunteer: builder.mutation({
      query: (volunteerData) => ({
        url: "/volunteer",
        method: "POST",
        body: volunteerData,
      }),
    }),
    getVolunteers: builder.query({
      query: () => ({
        url: "/volunteer",
        method: "GET",
      }),
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
    }),
    deleteVolunteer: builder.mutation({
      query: (id) => ({
        url: `/volunteer/${id}`,
        method: "DELETE",
      }),
    }),
    addClubToVolunteer: builder.mutation({
      query: ({ volunteerId, clubName, child }) => ({
        url: `/volunteer/addClubToVolunteer/${volunteerId}`,
        method: "PUT",
        body: { clubName, child },
      }),
    }),
    updateClubInVolunteer: builder.mutation({
      query: ({ volunteerId, clubId, clubData }) => ({
        url: `/volunteer/${volunteerId}/updateClub/${clubId}`,
        method: "PUT",
        body: clubData,
      }),
    }),
    removeClubFromVolunteer: builder.mutation({
      query: ({ volunteerId, clubId }) => ({
        url: `/volunteer/${volunteerId}/removeClub/${clubId}`,
        method: "DELETE",
      }),
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
