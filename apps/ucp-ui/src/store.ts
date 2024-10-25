import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "./baseApi";
import { tokenSlice } from "./shared/reducers/token";
import { snackbarSlice } from "./shared/reducers/snackbar";
import { institutionFilterSlice } from "./Institutions/institutionFiltersSlice";

export const createStore = () =>
  configureStore({
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
    reducer: {
      [api.reducerPath]: api.reducer,
      [institutionFilterSlice.reducerPath]: institutionFilterSlice.reducer,
      [snackbarSlice.reducerPath]: snackbarSlice.reducer,
      [tokenSlice.reducerPath]: tokenSlice.reducer,
    },
  });

export const store = createStore();

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);
