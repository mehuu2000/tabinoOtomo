'use client';

import React, { useEffect } from 'react'
import styles from '../module_css/otherFunc_u.module.css';
import SearchIcon from '@mui/icons-material/Search';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import StarIcon from '@mui/icons-material/Star';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Button from '@mui/material/Button';
import TryIcon from '@mui/icons-material/Try';
import { useApp } from '../../app/TabinoOtomo/home/appContext';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';

export default function OtherFunc_u() {
    const { choose, selectChoose, SelectFounction } = useApp();
    const router = useRouter();

    const handleClick = () => {
        router.push('/TabinoOtomo/home/memo/newCreateMemo');
      };

    useEffect(() => {
        console.log("chooseの値が更新されました:", choose);
    }, [choose]);

  return (
    <div className={styles.main}>
        <div className={styles.sub}>
            <div className={styles.search}>
                <input type="text" className={styles.input} />
                <SearchIcon sx={{ fontSize: 80 }} className={styles.searchIcon} />
            </div>
            <div className={styles.newCreate}>
                <Button 
                    variant="outlined"
                    sx={{
                        height: '50px',
                        width: '150px',
                        fontSize: '18px',
                        borderColor: 'rgba(137, 68, 255, 0.4)',
                        color: 'black',
                        display: 'flex',
                        alignItems: 'center',
                        '&:hover': {
                            backgroundColor: 'rgba(137, 68, 255, 0.1)',
                            color: 'rgb(137, 68, 255)'
                        },
                    }}
                    onClick={handleClick}
                >
                    <AddIcon />新規作成
                </Button>
            </div>
        </div>
        <div className={styles.func}>
            <div className={styles.funclist}>
                <p className={styles.p}>アイテムを選択</p>
                <button className={styles.button} onClick={() => selectChoose()}>
                    <TouchAppIcon />
                </button>
            </div>
            <div className={styles.funclist}>
                <p className={styles.p}>お気に入り</p>
                <button className={styles.button} onClick={() => SelectFounction('favorite')} disabled={!choose}>
                    <StarIcon />
                </button>
            </div>
            <div className={styles.funclist}>
                <p className={styles.p}>アイテム完了</p>
                <button className={styles.button} onClick={() => SelectFounction('fin')} disabled={!choose}>
                    <TaskAltIcon />
                </button>
            </div>
            <div className={styles.funclist}>
                <p className={styles.p}>アイテムを削除</p>
                <button className={styles.button} onClick={() => SelectFounction('delete')} disabled={!choose}>
                    <DeleteForeverIcon />
                </button>
            </div>
            <div className={styles.funclist}>
                <p className={styles.p}>AIとチャット</p>
                <button className={styles.button} onClick={() => SelectFounction('chat')} disabled={!choose}>
                    <TryIcon />
                </button>
            </div>
        </div>
    </div>
    
  )
}