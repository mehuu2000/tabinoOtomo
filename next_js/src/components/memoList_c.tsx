import React, { useState, useEffect } from 'react'
import styles from '../components/module_css/memoList_c.module.css'
import MemoItem from './UI/memoItem'

type Memo_cProps = {
    session: { user: { id: string } } | null; // sessionの型を定義
    selectedItems: string[];
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
};

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
};
export default function MemoList_c({ session, selectedItems, setSelectedItems }: Memo_cProps) {
    const [memos, setMemos] = useState<Memo[]>([]);
    const [loading, setLoading] = useState(true);
    

    useEffect(() => {
        console.log(session)
        const fetchMemos = async () => {
            if (!session?.user.id) {
                console.log("セッションないよ");
                return;
            }

            try {
                const response = await fetch('/api/getMemo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: session.user.id }), // userIdをバックエンドに送信
                });

                if (!response.ok) {
                    throw new Error('fetchできませんでした。ここ？');
                }

                const data = await response.json();
                setMemos(data.memos); // データを状態にセット
            } catch (error) {
                console.error('fetchのエラーメッセージ:', error);
            } finally {
                setLoading(false); // ローディング終了
            }
        };

        fetchMemos();
    }, []);

    const itemSelection = (itemId: string) => {
        setSelectedItems((prevSelectedItems) => {
            const isSelected = prevSelectedItems.includes(itemId);
            if (isSelected) {
                // 既に選択されていたら解除
                return prevSelectedItems.filter((id) => id !== itemId);
            } else {
                // 新たに選択された場合
                return [...prevSelectedItems, itemId];
            }
        });
    };

    if (loading) {
        return (
            <div className={styles.main}>
                <p>Loading...☆☆☆</p>
            </div>
        )
    }
    
    return (
        <div className={styles.main}>
            <div className={styles.list}>
                {memos.map((memo) => (
                    <MemoItem
                        key={memo.id}
                        id={memo.id}
                        title={memo.title}
                        items={memo.items}
                        favorite={memo.favorite}
                        visited={memo.visited}
                        onClick={() => itemSelection(memo.id)}
                        isSelected={selectedItems.includes(memo.id)}
                    />
                ))}
            </div>
        </div>
    )
}