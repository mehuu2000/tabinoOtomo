// AppContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import Plan_c from '../../../components/plan_c';
import Search_c from '../../../components/search_c';
import Memo_c from '../../../components/memo_c';
import Inquiry_c from '../../../components/inquiry_c';
import Setting_c from '../../../components/setting_c';
import NotFound_c from '../../../components/notFound_c';
import Memo from './memo/page';

// コンテキストの型定義
interface AppContextType {
  select: string;
  setSelect: React.Dispatch<React.SetStateAction<string>>;
  displayContent: () => JSX.Element;
  choose: boolean;
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>
  setChoose: React.Dispatch<React.SetStateAction<boolean>>;
  selectChoose: () => void;  // 戻り値は void に変更
  SelectFounction: (func: string, selectedItems: string[]) => void;
  memos: Memo[];
  setMemos: React.Dispatch<React.SetStateAction<Memo[]>>
}

type Item = {
  id: number;
  type: string;
  content: string;
  order: number;
};

type Memo = {
  id: string;
  title: string;
  items: Item[];
  favorite: boolean;
  visited: boolean;
  createdAt: Date;
};

// コンテキストの作成
const AppContext = createContext<AppContextType | undefined>(undefined);

// プロバイダーコンポーネントの型定義
interface AppProviderProps {
  children: ReactNode;
}

// プロバイダーコンポーネント
export function AppProvider({ children }: AppProviderProps) {
  const [select, setSelect] = useState<string>("plan");
  

  const displayContent = (): JSX.Element => {
    switch (select) {
      case "plan":
        return <Plan_c />;
      case "search":
        return <Search_c />;
      case "memo":
        return <Memo />;
      case "inquiry":
        return <Inquiry_c />;
      case "setting":
        return <Setting_c />;
      default:
        return <NotFound_c />;
    }
  };

//   const [chooseFunc, setChooseFunc] = useState<string>("");
  const [choose, setChoose] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);

  const selectChoose = () => {
    setChoose(prevChoose => !prevChoose);
  };

  const SelectFounction = (func: string, selectedItems: string[]): void => {
    switch (func) {
      case "favorite":
        console.log("お気に入りボタンが押されました。");
        FavoritElements(selectedItems);
        break;
      case "fin":
        console.log("終了ボタンが押されました");
        FinelEments(selectedItems);
        break;
      case "delete":
        console.log("削除ボタンが押されました");
        DeleteElements(selectedItems);
        break;
      case "chat":
        console.log("チャットボタンが押されました");
        ChatElements(selectedItems);
        break;
    }
  }
    
  const FavoritElements = async (selectedItems: string[]): Promise<void> => {
    //お気に入り登録
    try {
      const response = await fetch('/api/updateMemoFavorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedItems }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        console.log(result.message);
        // Memoの状態を更新
        setMemos((prevMemos) =>
            prevMemos.map((memo) =>
                selectedItems.includes(memo.id)
                    ? { ...memo, favorite: !memo.favorite } // favoriteを更新
                    : memo
            )
        );
    } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error('お気に入り登録エラー:', error);
    }
  }
  const FinelEments = async (selectedItems: string[]): Promise<void> => {
    //完了処理
    try {
      const response = await fetch('/api/updateMemoVisited', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedItems }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        console.log(result.message);
        // Memoの状態を更新
        setMemos((prevMemos) =>
            prevMemos.map((memo) =>
                selectedItems.includes(memo.id)
                    ? { ...memo, visited: !memo.visited } // visitedを更新
                    : memo
            )
        );
    } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error('完了登録エラー:', error);
    }
  }
  const DeleteElements = async (selectedItems: string[]): Promise<void> => {
    //メモ削除
    try {
      const response = await fetch('/api/deleteMemo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedItems }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log(result.message);
        // クライアント側の状態を更新
        setMemos((prevMemos) =>
          prevMemos.filter((memo) => !selectedItems.includes(memo.id))
        );
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error('削除エラー:', error);
    }
};
  const ChatElements = (selectedItems: string[]): void => {
    //チャット処理
  }
  
  const value = {
    select,
    setSelect,
    displayContent,
    choose,
    setChoose,
    selectedItems,
    setSelectedItems,
    selectChoose,
    SelectFounction,
    memos,
    setMemos,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// カスタムフック
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}