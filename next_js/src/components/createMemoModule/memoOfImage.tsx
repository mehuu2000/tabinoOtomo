'use client'

import React, { useState } from 'react'
import styles from '../../app/TabinoOtomo/home/memo/newCreateMemo/newCreateMemo.module.css'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'; //ゴミ箱
import LoopOutlinedIcon from '@mui/icons-material/LoopOutlined'; //サイクル

type MemoOfImageProps = {
    order: number;
    content: string;
    onImageChange: (order: number, newContent: string) => void;
    onDelete: (order: number) => void;
};

function MemoOfImage({ order, content, onImageChange, onDelete }: MemoOfImageProps) {

    const handleImageChange = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();

                reader.onloadend = () => {
                    const base64Image = reader.result as string;

                    // ここでbase64Imageを親コンポーネントに渡す
                    onImageChange(order, base64Image);
                };

                reader.readAsDataURL(file);
            }
        };

        input.click(); // ファイル選択ダイアログを表示
    };

    //buttonを押すと、要素を削除する
    const handleDeleteClick = () => {
        onDelete(order); // 削除処理を呼び出す
    };

    return (
        <div className={styles.insertImg}>
            <button onClick={handleImageChange}><LoopOutlinedIcon /></button>
            <img
                src={content}
                alt={`${content}の画像`}
                className={styles.img}
            />
            <button className={styles.delButton} onClick={handleDeleteClick}>
                <DeleteOutlineOutlinedIcon />
            </button>
        </div>
    )
}

export default MemoOfImage