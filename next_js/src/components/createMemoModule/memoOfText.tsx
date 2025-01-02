'use client'

import React, { useState } from 'react'
import styles from '../../app/TabinoOtomo/home/memo/newCreateMemo/newCreateMemo.module.css'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'; //ゴミ箱

type MemoOfTextProps = {
    order: number;
    content: string;
    onInputChange: (order: number, newContent: string) => void;
    onDelete: (order: number) => void;
};

function MemoOfText({ order, content, onInputChange, onDelete }: MemoOfTextProps) {

    //textarea変更時に親要素のuseStateのmemoFormを更新
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onInputChange(order, e.target.value);
    };

    //内容に合わせてtextareaの高さを動的に変更
    const handleResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        textarea.style.height = '24px';
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    //buttonを押すと、要素を削除する
    const handleDeleteClick = () => {
        onDelete(order); // 削除処理を呼び出す
    };

    return (
        <div className={styles.insertText}>
            <li></li>
            <textarea
                value={content}
                onChange={handleInputChange}
                onInput={handleResize}
                className={styles.textarea}
            />
            <button onClick={handleDeleteClick}>
                <DeleteOutlineOutlinedIcon />
            </button>
        </div>
    )
}

export default MemoOfText