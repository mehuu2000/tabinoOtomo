'use Client'

import React, { useEffect } from 'react'
import styles from '../module_css/otherFunc_u.module.css';
import SearchIcon from '@mui/icons-material/Search';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import StarIcon from '@mui/icons-material/Star';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import TryIcon from '@mui/icons-material/Try';
import { useApp } from '../../app/TabinoOtomo/home/appContext';

export default function OtherFunc_u() {
    const { choose, selectChoose, SelectFounction } = useApp();

    useEffect(() => {
        console.log("chooseの値が更新されました:", choose);
    }, [choose]);

  return (
    <div className={styles.main}>
        <div className={styles.search}>
            <input type="text" className={styles.input} />
            <SearchIcon sx={{ fontSize: 80 }} className={styles.searchIcon} />
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
                <button className={styles.button} id='fin'>
                    <TaskAltIcon />
                </button>
            </div>
            <div className={styles.funclist}>
                <p className={styles.p}>アイテムを削除</p>
                <button className={styles.button} id='delete'>
                    <DeleteForeverIcon />
                </button>
            </div>
            <div className={styles.funclist}>
                <p className={styles.p}>AIとチャット</p>
                <button className={styles.button} id='chat'>
                    <TryIcon />
                </button>
            </div>
        </div>
    </div>
    
  )
}