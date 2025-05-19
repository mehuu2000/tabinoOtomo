// src/store/travelAtoms.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// 旅行プランデータの型定義
export interface TravelPlanData {
  goTo: string[];
  when: string;
  days: number;
  weather: boolean;
}

// 初期状態
const initialTravelData: TravelPlanData = {
  goTo: [],
  when: '',
  days: 1,
  weather: false,
};

// 個別のatom（コンポーネント内のフォーム入力用）
export const goToAtom = atomWithStorage<string[]>('travel-goTo', []);
export const whenAtom = atomWithStorage('travel-when', '');
export const daysAtom = atomWithStorage('travel-days', 1);
export const weatherAtom = atomWithStorage('travel-weather', false);

// 完全な旅行データ（ナビゲーション時に保存するデータ全体）
export const travelDataAtom = atomWithStorage<TravelPlanData>(
  'travel-data', // ローカルストレージのキー名
  initialTravelData
);

// 派生atom 
export const isFormValidAtom = atom(
    (get) => {
      const goTo = get(goToAtom);
      const when = get(whenAtom);
      const days = get(daysAtom);
      return goTo.length > 0 && when !== '' && days > 0;
    }
  );