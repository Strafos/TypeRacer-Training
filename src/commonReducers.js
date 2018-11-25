import { combineReducers } from "redux";

import * as ActionTypes from "./commonConstants";
import { asyncStateReducer } from "./utils/reduxUtils";

const asyncSprintListReducer = asyncStateReducer({
  [ActionTypes.FETCH_SPRINTS_REQUEST]: "pending",
  [ActionTypes.FETCH_SPRINTS_FAILURE]: "error",
  [ActionTypes.FETCH_SPRINTS_SUCCESS]: "complete",
});

const sprintListReducer = (state, action) => {
  switch (action.type) {
    // case ActionTypes.CREATE_SPRINT_SUCCESS:
    //   return {
    //     ...state,
    //     data: [...state.data, action.responseJson],
    //   };
    default:
      return asyncSprintListReducer(state, action);
  }
};

export default combineReducers({
  sprintList: sprintListReducer,
});
