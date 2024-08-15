import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { createSelector } from "@reduxjs/toolkit";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export const createAppSelector = createSelector.withTypes<RootState>();
