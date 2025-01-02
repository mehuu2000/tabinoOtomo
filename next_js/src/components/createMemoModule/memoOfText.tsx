'use client'

import React, { useState } from 'react'
import styles from '../../app/TabinoOtomo/home/memo/newCreateMemo/newCreateMemo.module.css'

type MemoOfTextProps = {
    order: number;
    content: string;
    onInputChange: (order: number, newContent: string) => void;
};

function MemoOfText({ order, content, onInputChange }: MemoOfTextProps) {

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
    return (
        <div className={styles.insertText}>
            <li></li>
            <textarea
                value={content}
                onChange={handleInputChange}
                onInput={handleResize}
                className={styles.textarea}
            />
        </div>
    )
}

export default MemoOfText