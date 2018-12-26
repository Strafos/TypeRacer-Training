import { asyncActionCreator } from "./utils/reduxUtils";

import * as ActionTypes from "./commonConstants";

import * as API from "./utils/api";

export const getText = () =>
  asyncActionCreator(
    {
      pending: ActionTypes.FETCH_TEXT_REQUEST,
      complete: ActionTypes.FETCH_TEXT_SUCCESS,
      error: ActionTypes.FETCH_TEXT_FAILURE,
    },
    API.getText
  )();
