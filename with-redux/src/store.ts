import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  Action,
  PayloadAction,
  configureStore,
  ThunkAction,
} from "@reduxjs/toolkit";
import { createWrapper, HYDRATE } from "next-redux-wrapper";

interface Pokemon {
  id: number;
  name: string;
  image: string;
}

export type PokemonState = {
  pokemon: Pokemon[];
  search: string;
  filteredPokemon: Pokemon[];
  pending: boolean;
  error: boolean;
};

const initialState: PokemonState = {
  pokemon: [],
  filteredPokemon: [],
  search: "",
  pending: false,
  error: false,
};

export const getPokemon = createAsyncThunk("pokemon/getPokemon", async () => {
  const response = await fetch(
    "https://jherr-pokemon.s3.us-west-1.amazonaws.com/index.json"
  );
  return await response.json();
});

export const pokemonSlice = createSlice({
  name: "pokemon",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.filteredPokemon = state.pokemon.filter(({ name }) =>
        name.toLowerCase().includes(state.search.toLowerCase())
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPokemon.pending, (state) => {
        state.pending = true;
      })
      .addCase(getPokemon.fulfilled, (state, { payload }) => {
        state.pending = false;
        state.pokemon = payload;
        state.filteredPokemon = payload;
      })
      .addCase(getPokemon.rejected, (state) => {
        state.pending = false;
        state.error = true;
      })
      .addCase(HYDRATE, (state, action: any) => {
        return {
          ...state,
          ...action.payload.pokemon,
        };
      });
  },
});

export const wrapper = createWrapper(() =>
  configureStore({
    reducer: {
      pokemon: pokemonSlice.reducer,
    },
  })
);

export type RootState = ReturnType<any>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export const { setSearch } = pokemonSlice.actions;

export const selectSearch = (state: RootState) => state.pokemon.search;
export const selectFilteredPokemon = (state: RootState) =>
  state.pokemon.filteredPokemon;
