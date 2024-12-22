// AppContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import Plan_c from '../../../components/plan_c';
import Search_c from '../../../components/search_c';
import Memo_c from '../../../components/memo_c';
import Inquiry_c from '../../../components/inquiry_c';
import Setting_c from '../../../components/setting_c';
import NotFound_c from '../../../components/notFound_c';

// コンテキストの型定義
interface AppContextType {
  select: string;
  setSelect: React.Dispatch<React.SetStateAction<string>>;
  displayContent: () => JSX.Element;
  choose: boolean;
  setChoose: React.Dispatch<React.SetStateAction<boolean>>;
  selectChoose: () => void;  // 戻り値は void に変更
  SelectFounction: (func: string) => void;
}

// コンテキストの作成
const AppContext = createContext<AppContextType | undefined>(undefined);

// プロバイダーコンポーネントの型定義
interface AppProviderProps {
  children: ReactNode;
}

// プロバイダーコンポーネント
export function AppProvider({ children }: AppProviderProps) {
  const [select, setSelect] = useState<string>("plan");
  

  const displayContent = () => {
    switch (select) {
      case "plan":
        return <Plan_c />;
      case "search":
        return <Search_c />;
      case "memo":
        return <Memo_c />;
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

  const selectChoose = () => {
    setChoose(prevChoose => !prevChoose);
    console.log("setChoose関数が実行されました");
  };

  const SelectFounction = (func: string) => {
    switch (func) {
      case "favorite":
        console.log("お気に入りボタンが押されました。");
        RemoveElements();
      case "fin":
        console.log("終了ボタンが押されました");
        FinelEments();
      case "delete":
        console.log("削除ボタンが押されました");
        DeleteElements();
      case "chat":
        console.log("チャットボタンが押されました");
        ChatElements();
        break;
    }
  }
    
  const RemoveElements = () => {
  }
  const FinelEments = () => {
  }
  const DeleteElements = () => {
  }
  const ChatElements = () => {
  }
  
  const value = {
    select,
    setSelect,
    displayContent,
    choose,
    setChoose,
    selectChoose,
    SelectFounction,
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