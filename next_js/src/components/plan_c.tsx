'use client'

import React from 'react'
import styles_c from './module_css/plan_c.module.css'
import OtherFunc_u from '../components/plan/plan_otherFunction';
import Plans from './plan/plans';
import { useState } from 'react';

type Plan = {
    id: number;
    title: string;
    days: number; // 旅行日数
    fromWhen: number; // 旅行開始日
    conectMemoId: string | null; // メモへの参照
    isPublic: boolean; // 公開フラグ
    favorite: boolean; // お気に入りフラグ
    visited: boolean; // 完了フラグ
    createAt: Date;
}

export default function Plan_c() {
    const [choose, setChoose] = useState<boolean>(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);

    const SelectFounction = (func: string, selectedItems: number[]): void => {
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
        
    const FavoritElements = async (selectedItems: number[]): Promise<void> => {
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
            setPlans((prevPlans) =>
                prevPlans.map((plan) =>
                    selectedItems.includes(plan.id)
                        ? { ...plan, favorite: !plan.favorite } // favoriteを更新
                        : plan
                )
            );
        } else {
            console.error(result.message);
          }
        } catch (error) {
          console.error('お気に入り登録エラー:', error);
        }
      }
      const FinelEments = async (selectedItems: number[]): Promise<void> => {
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
            setPlans((prevPlans) =>
                prevPlans.map((plan) =>
                    selectedItems.includes(plan.id)
                        ? { ...plan, visited: !plan.visited } // visitedを更新
                        : plan
                )
            );
        } else {
            console.error(result.message);
          }
        } catch (error) {
          console.error('完了登録エラー:', error);
        }
      }
      const DeleteElements = async (selectedItems: number[]): Promise<void> => {
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
            setPlans((prevPlans) =>
              prevPlans.filter((plan) => !selectedItems.includes(plan.id))
            );
          } else {
            console.error(result.message);
          }
        } catch (error) {
          console.error('削除エラー:', error);
        }
    };
    const ChatElements = (selectedItems: number[]): void => {
        //チャット処理
    }
    
    const selectChoose = () => {
        setChoose(prevChoose => !prevChoose);
    };


    return(
        <div className={styles_c.main}>
            <Plans plans={plans} setPlans={setPlans}/>
            <OtherFunc_u choose={choose} selectChoose={selectChoose} SelectFounction={SelectFounction} selectedItems={selectedItems} setSelectedItems={setSelectedItems}/>
        </div>
    )

}