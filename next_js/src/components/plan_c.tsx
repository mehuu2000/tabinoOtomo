'use client'

import React from 'react'
import styles_c from './module_css/plan_c.module.css'
import OtherFunc_u from '../components/plan/plan_otherFunction';
import Plans from './plan/plans';
import { useState, useEffect } from 'react';


export interface Plan {
  id: number;
  title: string;
  days: number;
  fromWhen: number;
  conectMemoId: string | null;
  isPublic: boolean;
  favorite: boolean;
  visited: boolean;
  createAt: string | Date; // 文字列またはDate型を許容
  spots: PlanItem[];
}

export interface PlanItem {
  id: number;
  spotId: number;
  planId: number;
  day: number;
  order: number;
  spot: Spot;
}

export interface Spot {
  id: number;
  prectures: string;
  name: string;
  description: string;
  imageUrl: string;
  updatedAt: string | Date;
  createdAt: string | Date;
}

export default function Plan_c() {
    const [choose, setChoose] = useState<boolean>(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // plansのデバック
    useEffect(() => {
        console.log("現在のプラン:", plans);
    }, [plans]);

    const fetchPlans = async () => {
        setIsLoading(true);
        try {
            const response = await fetch ('/api/planApi', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            if (!response.ok) {
                throw new Error('Failed to fetch plans');
            }
            const responseData = await response.json();
            if (responseData.data && Array.isArray(responseData.data)) {
                // Date型への変換処理を追加
                const formattedPlans = responseData.data.map((plan: Plan) => ({
                    ...plan,
                    // 文字列の日付をDate型に変換
                    createAt: new Date(plan.createAt)
                }));
                setPlans(formattedPlans);
            } else {
                console.error('予期しないデータ形式:', responseData);
                setPlans([]);
            }
        } catch (error) {
            console.error('プランの取得に失敗しました:', error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchPlans();
    }, []);

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
            const response = await fetch('/api/updatePlanFavorite', {
              method: 'PUT',
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
        const response = await fetch('/api/updatePlanVisited', {
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
      const isConfirmed = window.confirm(`選択した${selectedItems.length}件のプランを削除しますか？\nこの操作は取り消せません。`);
      if (!isConfirmed) {
        return;
      }
      try {
        const response = await fetch('/api/deleteSpot', {
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
            <div className={styles_c.main}>
        <Plans 
            plans={plans} 
            setPlans={setPlans} 
            isLoading={isLoading}
            choose={choose}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
        />
        <OtherFunc_u 
            choose={choose} 
            selectChoose={selectChoose} 
            SelectFounction={SelectFounction} 
            selectedItems={selectedItems} 
            setSelectedItems={setSelectedItems}
        />
    </div>
        </div>
    )

}