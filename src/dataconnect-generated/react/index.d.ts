import { CreateDemoUserData, GetMoviesByGenreData, GetMoviesByGenreVariables, UpdateWatchHistoryData, UpdateWatchHistoryVariables, GetSubscriptionPlanData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateDemoUser(options?: useDataConnectMutationOptions<CreateDemoUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateDemoUserData, undefined>;
export function useCreateDemoUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateDemoUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateDemoUserData, undefined>;

export function useGetMoviesByGenre(vars: GetMoviesByGenreVariables, options?: useDataConnectQueryOptions<GetMoviesByGenreData>): UseDataConnectQueryResult<GetMoviesByGenreData, GetMoviesByGenreVariables>;
export function useGetMoviesByGenre(dc: DataConnect, vars: GetMoviesByGenreVariables, options?: useDataConnectQueryOptions<GetMoviesByGenreData>): UseDataConnectQueryResult<GetMoviesByGenreData, GetMoviesByGenreVariables>;

export function useUpdateWatchHistory(options?: useDataConnectMutationOptions<UpdateWatchHistoryData, FirebaseError, UpdateWatchHistoryVariables>): UseDataConnectMutationResult<UpdateWatchHistoryData, UpdateWatchHistoryVariables>;
export function useUpdateWatchHistory(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateWatchHistoryData, FirebaseError, UpdateWatchHistoryVariables>): UseDataConnectMutationResult<UpdateWatchHistoryData, UpdateWatchHistoryVariables>;

export function useGetSubscriptionPlan(options?: useDataConnectQueryOptions<GetSubscriptionPlanData>): UseDataConnectQueryResult<GetSubscriptionPlanData, undefined>;
export function useGetSubscriptionPlan(dc: DataConnect, options?: useDataConnectQueryOptions<GetSubscriptionPlanData>): UseDataConnectQueryResult<GetSubscriptionPlanData, undefined>;
