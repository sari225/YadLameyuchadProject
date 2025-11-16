import apiSlice from "../app/ApiSlice"

export const childManagementApi = apiSlice.injectEndpoints({
	  endpoints: (builder) => ({	
		createChild: builder.mutation({
			query: (childData) => ({
				url: "/child",
				method: "POST",
				body: childData,
			}),
		}),
		getChildren: builder.query({
			query: () => ({
				url: "/child",
				method: "GET",
			}),
		}),
		getChildById: builder.query({
			query: (id) => ({
				url: `/child/${id}`,
				method: "GET",
			}),
		}),
		updateChild:builder.mutation({
			query: ({ id, childData }) => ({
				url: `/child/${id}`,
				method: "PUT",
				body: childData
			})
		}),
		updatePassword:builder.mutation({
			query:(password)=>({
				url:"/child",
				method:"PUT",
				body:password
			})
		}),
		deleteChild:builder.mutation({
			query: (id)=>({
				url: `/child/${id}`,
				method:"DELETE"
			}),
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