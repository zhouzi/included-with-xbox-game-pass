export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Time: string;
};


export type Query = {
  __typename?: 'Query';
  allGames: Array<Game>;
  allPosts: Array<Post>;
};

export type Game = {
  __typename?: 'Game';
  id: Scalars['ID'];
  name: Scalars['String'];
  url: Scalars['String'];
  image: Scalars['String'];
  availability: GameAvailability;
  releaseDate: Scalars['Time'];
  addedAt: Scalars['Time'];
  removedAt?: Maybe<Scalars['Time']>;
};

export type GameAvailability = {
  __typename?: 'GameAvailability';
  pc: Scalars['Boolean'];
  console: Scalars['Boolean'];
};

export type Post = {
  __typename?: 'Post';
  url: Scalars['String'];
  title: Scalars['String'];
  publishedAt: Scalars['Time'];
};
