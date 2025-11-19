import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	selectedClub: null,
	clubDetailsOpen: false,
	addClubDialogOpen: false,
	clubRequestsDialogOpen: false,
};

const clubManagementSlice = createSlice({
	name: "clubManagement",
	initialState,
	reducers: {
		setSelectedClub: (state, action) => {
			state.selectedClub = action.payload;
		},
		openClubDetails: (state, action) => {
			state.selectedClub = action.payload;
			state.clubDetailsOpen = true;
		},
		closeClubDetails: (state) => {
			state.clubDetailsOpen = false;
		},
		openAddClubDialog: (state) => {
			state.addClubDialogOpen = true;
		},
		closeAddClubDialog: (state) => {
			state.addClubDialogOpen = false;
		},
		openClubRequestsDialog: (state) => {
			state.clubRequestsDialogOpen = true;
		},
		closeClubRequestsDialog: (state) => {
			state.clubRequestsDialogOpen = false;
		},
	},
});

export const {
	setSelectedClub,
	openClubDetails,
	closeClubDetails,
	openAddClubDialog,
	closeAddClubDialog,
	openClubRequestsDialog,
	closeClubRequestsDialog,
} = clubManagementSlice.actions;

export default clubManagementSlice.reducer;
