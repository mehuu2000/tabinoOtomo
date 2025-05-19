import React, { useState, useEffect } from 'react'
import styles from '../components/module_css/memoList_c.module.css'
import MemoItem from './UI/memoItem'
import { useApp } from '../app/TabinoOtomo/home/appContext';
import { User as PrismaUser } from '@prisma/client';
import Loading from './Loading';
// import { useRouter } from 'next/navigation';


// type Item = {
//     id: number;
//     type: string;
//     content: string;
//     order: number;
// };

// type Memo = {
//     id: string;
//     title: string;
//     items: Item[];
//     favorite: boolean;
//     visited: boolean;
//     createdAt: Date;
// };

type MemoListProps = {
    currentUser: PrismaUser | null;
};

export default function MemoList_c({ currentUser }: MemoListProps) {
    const [loading, setLoading] = useState(true);
    const { selectedItems, setSelectedItems, memos, setMemos } = useApp();
    // const router = useRouter();
    

    useEffect(() => {
        const fetchMemos = async () => {
            if (!currentUser?.id) {
                return;
            }

            try {
                const response = await fetch('/api/getMemo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: currentUser.id }), // userIdをバックエンドに送信
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
    }, [currentUser]);

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
                <Loading />
            </div>
        )
    }
    
    return (
        <div className={styles.main}>
            <div className={styles.list}>
            {memos
                .sort((a, b) => {
                    const dateA = new Date(a.createdAt); // createdAtをDateオブジェクトに変換
                    const dateB = new Date(b.createdAt); // createdAtをDateオブジェクトに変換
                    return dateA.getTime() - dateB.getTime(); // 昇順に並べ替え
                })
                .map((memo) => (
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