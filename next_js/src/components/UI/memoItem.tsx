import React from 'react'
import { useApp } from '../../app/TabinoOtomo/home/appContext';
import StarIcon from '@mui/icons-material/Star';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import styles from '../../components/module_css/memoList_c.module.css';

type Item = {
    id: number;
    type: string; // 'text' または 'image'
    content: string; // テキストまたは画像URL
    order: number;
};

type MemoItemProps = {
    id: string;
    title: string;
    items: Item[];
    favorite: boolean;
    visited: boolean;
    onClick: () => void;
    isSelected: boolean;
};

function MemoItem({ id, title, items, favorite, visited, onClick, isSelected }: MemoItemProps) {
    const { choose } = useApp();

    const handleClick = () => {
        if(choose) {
            onClick();
        } else {
            console.log("選択ボタンが押されていません");
        }
    }
    return (
        <div 
            className={`${styles.memo} ${isSelected ? styles.selected : ''}`} 
            onClick={handleClick}
        >
            <div className={styles.contents}>
                <h3 className={styles.h3}>
                    {title}
                    {favorite && <StarIcon className={styles.icon} />}
                    {visited && <TaskAltIcon className={styles.icon} />}
                </h3>
                {items
                    .sort((a, b) => a.order - b.order) // 順序に従って並べ替え
                    .map((item) => (
                        <div key={item.id}>
                            {item.type === 'text' ? (
                                <p className={styles.itemP}>{item.content}</p>
                            ) : item.type === 'img' ? (
                                <img className={styles.itemImg} src={item.content} alt="メモ画像" />
                            ) : null}
                        </div>
                ))}
            </div>
        </div>
    )
}

export default MemoItem