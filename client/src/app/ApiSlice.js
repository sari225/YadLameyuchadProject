import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const apiSlice = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",

    // ⭐⭐ המקום שבו שולחים את הטוקן לשרת
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token; // לוקחים את הטוקן מרידקס

      if (token) {
        headers.set("authorization", `Bearer ${token}`); // שולחים אותו לשרת
      }

      return headers;
    }
  }),

  endpoints: () => ({}),
});

export default apiSlice;
