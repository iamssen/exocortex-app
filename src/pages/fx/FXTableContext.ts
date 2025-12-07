import type { FormatPreset } from '@iamssen/format';
import type { ScaleContinuousNumeric } from 'd3-scale';
import type { Context } from 'react';
import { createContext, useContext } from 'react';

export interface FxTableStates {
  format?: FormatPreset | string;
  cellColor: ScaleContinuousNumeric<string, string>;
}

export const FXTableContext: Context<FxTableStates> =
  createContext<FxTableStates>(null!);

export function useFXTable(): FxTableStates {
  return useContext(FXTableContext);
}
