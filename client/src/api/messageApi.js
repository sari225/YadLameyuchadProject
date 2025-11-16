import apiSlice from "../app/ApiSlice";

export const messageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createMessage: builder.mutation({
      query: (messageData) => ({
        url: "/messages",
        method: "POST",
        body: messageData,
      }),
    }),
    getAllMessages: builder.query({
      query: () => ({
        url: "/messages",
        method: "GET",
      }),
    }),
    getMessageById: builder.query({
      query: (id) => ({
        url: `/messages/${id}`,
        method: "GET",
      }),
    }),
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/messages/${id}`,
        method: "PUT",
      }),
    }),
    deleteMessage: builder.mutation({
      query: (id) => ({
        url: `/messages/${id}`,
        method: "DELETE",
      }),
    }),
    replyToMessage: builder.mutation({
      query: (replyData) => ({
        url: "/messages/reply",
        method: "POST",
        body: replyData,
      }),
    }),
  }),
});

export const {
  useCreateMessageMutation,
  useGetAllMessagesQuery,
  useGetMessageByIdQuery,
  useMarkAsReadMutation,
  useDeleteMessageMutation,
  useReplyToMessageMutation,
} = messageApi;
