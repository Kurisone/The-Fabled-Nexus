// src/store/session.js
import { csrfFetch } from "./csrf";

// Action Types
const SET_USER = "session/setUser";
const REMOVE_USER = "session/removeUser";

// Action Creators
const setUser = (user) => ({
    type: SET_USER,
    payload: user,
});

const removeUser = () => ({
    type: REMOVE_USER,
});

// Thunks
export const login = (user) => async (dispatch) => {
    const { credential, password } = user;
    try {
        const response = await csrfFetch("/api/session", {
            method: "POST",
            body: JSON.stringify({ credential, password }),
        });
        const data = await response.json();

        if (data.errors) {
            return { errors: data.errors };
        }

        dispatch(setUser(data.user));
        return data;
    } catch (err) {
        let data;
        try {
            data = await err.json();
            if (data?.errors) return { errors: data.errors };
        } catch (parseErr) {
            console.error("Error parsing login error:", parseErr); // satisfies ESLint
        }
        return { errors: ["An unexpected error occurred."] };
    }
};

export const signup = ({ username, email, password, firstName, lastName }) => async (dispatch) => {
  try {
    const response = await csrfFetch("/api/session/signup", {
      method: "POST",
      body: JSON.stringify({ username, email, password, firstName, lastName }),
    });
    const data = await response.json();

    if (data.errors) return { errors: Object.values(data.errors) }; // validation errors

    dispatch(setUser(data.user));
    return data;
  } catch (err) {
    try {
      const data = await err.json();
      if (data?.errors) return { errors: Object.values(data.errors) };
    } catch (parseErr) {
      console.error("Error parsing signup error:", parseErr); // satisfies ESLint
    }
    return { errors: ["An unexpected error occurred."] };
  }
};

export const logout = () => async (dispatch) => {
    await csrfFetch("/api/session", { method: "DELETE" });
    dispatch(removeUser());
};

export const restoreUser = () => async (dispatch) => {
    const response = await csrfFetch("/api/session"); // GET
    const data = await response.json();
    dispatch(setUser(data.user));
    return data;
};

// Reducer
const initialState = { user: null };

const sessionReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_USER:
            return { user: action.payload };
        case REMOVE_USER:
            return { user: null };
        default:
            return state;
    }
};

export default sessionReducer;
