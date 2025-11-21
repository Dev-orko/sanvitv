import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateDemoUserData {
  user_insert: User_Key;
}

export interface GetMoviesByGenreData {
  movies: ({
    id: UUIDString;
    title: string;
    description?: string | null;
    posterUrl: string;
  } & Movie_Key)[];
}

export interface GetMoviesByGenreVariables {
  genre: string;
}

export interface GetSubscriptionPlanData {
  subscriptionPlans: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    price: number;
    accessLevel: string;
    features?: string[] | null;
  } & SubscriptionPlan_Key)[];
}

export interface Movie_Key {
  id: UUIDString;
  __typename?: 'Movie_Key';
}

export interface SubscriptionPlan_Key {
  id: UUIDString;
  __typename?: 'SubscriptionPlan_Key';
}

export interface UpdateWatchHistoryData {
  watchHistory_update?: WatchHistory_Key | null;
}

export interface UpdateWatchHistoryVariables {
  userId: UUIDString;
  movieId: UUIDString;
  progressSeconds: number;
}

export interface UserSubscription_Key {
  id: UUIDString;
  __typename?: 'UserSubscription_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface WatchHistory_Key {
  userId: UUIDString;
  movieId: UUIDString;
  __typename?: 'WatchHistory_Key';
}

interface CreateDemoUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateDemoUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateDemoUserData, undefined>;
  operationName: string;
}
export const createDemoUserRef: CreateDemoUserRef;

export function createDemoUser(): MutationPromise<CreateDemoUserData, undefined>;
export function createDemoUser(dc: DataConnect): MutationPromise<CreateDemoUserData, undefined>;

interface GetMoviesByGenreRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMoviesByGenreVariables): QueryRef<GetMoviesByGenreData, GetMoviesByGenreVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMoviesByGenreVariables): QueryRef<GetMoviesByGenreData, GetMoviesByGenreVariables>;
  operationName: string;
}
export const getMoviesByGenreRef: GetMoviesByGenreRef;

export function getMoviesByGenre(vars: GetMoviesByGenreVariables): QueryPromise<GetMoviesByGenreData, GetMoviesByGenreVariables>;
export function getMoviesByGenre(dc: DataConnect, vars: GetMoviesByGenreVariables): QueryPromise<GetMoviesByGenreData, GetMoviesByGenreVariables>;

interface UpdateWatchHistoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateWatchHistoryVariables): MutationRef<UpdateWatchHistoryData, UpdateWatchHistoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateWatchHistoryVariables): MutationRef<UpdateWatchHistoryData, UpdateWatchHistoryVariables>;
  operationName: string;
}
export const updateWatchHistoryRef: UpdateWatchHistoryRef;

export function updateWatchHistory(vars: UpdateWatchHistoryVariables): MutationPromise<UpdateWatchHistoryData, UpdateWatchHistoryVariables>;
export function updateWatchHistory(dc: DataConnect, vars: UpdateWatchHistoryVariables): MutationPromise<UpdateWatchHistoryData, UpdateWatchHistoryVariables>;

interface GetSubscriptionPlanRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetSubscriptionPlanData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetSubscriptionPlanData, undefined>;
  operationName: string;
}
export const getSubscriptionPlanRef: GetSubscriptionPlanRef;

export function getSubscriptionPlan(): QueryPromise<GetSubscriptionPlanData, undefined>;
export function getSubscriptionPlan(dc: DataConnect): QueryPromise<GetSubscriptionPlanData, undefined>;

