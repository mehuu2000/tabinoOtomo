'use client'

import React, { useState, useEffect } from 'react'
import MemoList_c from './memoList_c';
import OtherFunc_u from './UI/otherFunc_u';
import styles from './module_css/memo_c.module.css';
import getCurrentUser from '@/app/actions/getCurentUser';
import { User as PrismaUser } from '@prisma/client';

type Memo_cProps = {
    session: { user: { id: string } } | null; // sessionの型を定義
};

export default function Memo_c({ session }: Memo_cProps) {

    const [currentUser, setCurrentUser] = useState<PrismaUser | null>(null);;
    useEffect(() => {
        // 非同期処理をuseEffect内で実行
        const fetchUser = async () => {
            const user = await getCurrentUser();
            console.log(`カレントユーザー：${user}`);
            setCurrentUser(user); // currentUserの状態を更新
        };
        fetchUser();
    }, []); // コンポーネントがマウントされたときのみ実行

    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    return(
        <div className={styles.main}>
            <MemoList_c 
                session={session}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems} 
      />
            <OtherFunc_u 
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems} 
            />
        </div>
    )

}