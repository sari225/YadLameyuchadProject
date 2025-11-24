import { createSlice } from "@reduxjs/toolkit";

// =============================
//  Slice
// =============================

const initialState = {
	searchQuery: "",
	searchField: "", // ריק = חיפוש חופשי
	showPending: false,
};

const childManagementSlice = createSlice({
	name: "childManagement",
	initialState,
	reducers: {
		setSearchQuery: (state, action) => {
			state.searchQuery = action.payload;
		},
		setSearchField: (state, action) => {
			state.searchField = action.payload;
		},
		setShowPending: (state, action) => {
			state.showPending = action.payload;
		},
		resetFilters: (state) => {
			state.searchQuery = "";
			state.searchField = "";
		},
	},
});

export const { setSearchQuery, setSearchField, setShowPending, resetFilters } = childManagementSlice.actions;

export default childManagementSlice.reducer;
