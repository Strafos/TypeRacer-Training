import { combineReducers } from "redux";

import * as ActionTypes from "./commonConstants";
import { asyncStateReducer } from "./utils/reduxUtils";

const asyncTextReducer = asyncStateReducer({
  [ActionTypes.FETCH_TEXT_REQUEST]: "pending",
  [ActionTypes.FETCH_TEXT_FAILURE]: "error",
  [ActionTypes.FETCH_TEXT_SUCCESS]: "complete",
});

const textReducer = (state, action) => {
  switch (action.type) {
    // case ActionTypes.CREATE_SPRINT_SUCCESS:
    //   return {
    //     ...state,
    //     data: [...state.data, action.responseJson],
    //   };
    default:
      return asyncTextReducer(state, action);
  }
};

export default combineReducers({
  text: textReducer,
});
