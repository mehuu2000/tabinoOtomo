import React, { useState, useEffect } from 'react'
import MemoList_c from './memoList_c';
import OtherFunc_u from './UI/otherFunc_u';
import styles from './module_css/memo_c.module.css';
import { User as PrismaUser } from '@prisma/client';
import { useSession } from 'next-auth/react';
// import prisma from '@/app/lib/prisma';

export default function Memo_c() {
    const { data: sessionData } = useSession();
    const [currentUser, setCurrentUser] = useState<PrismaUser | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
          if (sessionData?.user?.email) {
            try {
              const response = await fetch('/api/getUser');
              const data = await response.json();
              
              if (response.ok) {
                setCurrentUser(data); // サーバーから返されたユーザー情報を状態にセット
              } else {
                console.error('ユーザー情報の取得に失敗しました:', data.message);
              }
            } catch (error) {
              console.error('API呼び出しエラー:', error);
            }
          }
        };
    
        if (sessionData?.user?.email) {
          fetchUser();
        }
    }, [sessionData]);

    useEffect(() => {
        console.log(`カレントユーザー1：${currentUser?.id}`);
    }, [currentUser]);

    return(
        <div className={styles.main}>
            <MemoList_c currentUser={currentUser} />
            <OtherFunc_u />
        </div>
    )

}