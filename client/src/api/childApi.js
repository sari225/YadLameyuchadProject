import apiSlice from "../app/ApiSlice"

export const childManagementApi = apiSlice.injectEndpoints({
	  endpoints: (builder) => ({	
		createChild: builder.mutation({
			query: (childData) => ({
				url: "/child",
				method: "POST",
				body: childData,
			}),
			invalidatesTags: ['Child'],
		}),
		getChildren: builder.query({
			query: () => ({
				url: "/child",
				method: "GET",
			}),
			providesTags: ['Child'],
		}),
		getChildById: builder.query({
			query: (id) => ({
				url: `/child/${id}`,
				method: "GET",
			}),
			providesTags: ['Child'],
		}),
		updateChild:builder.mutation({
			query: ({ id, childData }) => ({
				url: `/child/${id}`,
				method: "PUT",
				body: childData
			}),
			invalidatesTags: ['Child'],
		}),
		updatePassword:builder.mutation({
			query:(password)=>({
				url:"/child",
				method:"PUT",
				body:password
			}),
			invalidatesTags: ['Child'],
		}),
		deleteChild:builder.mutation({
			query: (id)=>({
				url: `/child/${id}`,
				method:"DELETE"
			}),
			invalidatesTags: ['Child', 'Club', 'Volunteer'],
		})
	})
})
export const {
	useCreateChildMutation,
	useGetChildrenQuery,	
	useGetChildByIdQuery,
	useUpdateChildMutation,
	useUpdatePasswordMutation,
	useDeleteChildMutation,
} = childManagementApi;