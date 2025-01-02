'use client';

import React, { useState } from 'react'
import styles from './newCreateMemo.module.css';

import MemoOfText from '@/components/createMemoModule/memoOfText';

import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add'; //プラス
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined'; //テキスト
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'; //イメージ
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'; //完了

function CreateMemo() {
    const handleInsertText = () => {
        console.log("テキスト追加ボタンが押されました。");
        const order = memoForm.length + 1;
        setMemoForm([...memoForm, { type: "text", content: "", order }]);
        console.log(memoForm);
    }
    const handleInsertImage = () => {
        console.log("画像追加ボタンが押されました。");
        const order = memoForm.length + 1;
        setMemoForm([...memoForm, { type: "img", content: "", order }]);
        console.log(memoForm);
    }
    const handleFinish = () => {
        console.log("完了ボタンが押されました。");
    }

    //テキストの内容が変更された場合、引数のorderに合うもののmemoFormのcontetの値を引数のnewContentで更新
    const handleInputChange = (order: number, newContent: string) => {
        setMemoForm(prevMemoForm => 
            prevMemoForm.map(item =>
                item.order === order ? { ...item, content: newContent } : item
            )
        );
    };

    const [memoForm, setMemoForm] = useState<{
        type: string;
        content: string;
        order: number;
    }[]>([]);

    return (
        <div className={styles.main}>
            <div className={styles.side}>
                {/* テキスト追加ボタン */}
                <Button 
                    variant="outlined"
                    className={`${styles.insertP} ${styles.insert}`}
                    sx={{
                        height: "50px",
                        width: "150px",
                        padding: "0",
                        borderRadius: "10px",
                        borderColor: "rgb(137, 68, 255)",
                        color: "black",
                        '&:hover': {
                            backgroundColor: 'rgba(137, 68, 255, 0.1)',
                            borderColor: 'rgba(137, 68, 255, 0.5)',
                        }
                    }}
                    onClick={handleInsertText}
                >
                    <div className={styles.icon}>
                        <AddIcon 
                            sx={{
                                color: "black",
                                fontSize: "18px",
                                marginTop: "-16px",
                            }}
                        />
                        <CreateOutlinedIcon 
                            sx={{
                                color: "black",
                                fontSize: "24px", // アイコンのサイズ調整
                                marginLeft: "-10px", // 少し重ねるためにアイコン間の距離調整
                            }}
                        />
                    </div>
                    <span>テキスト</span>
                </Button>

                {/* 画像追加ボタン */}
                <Button 
                    variant="outlined"
                    className={`${styles.insertImg} ${styles.insert}`}
                    sx={{
                        height: "50px",
                        width: "150px",
                        padding: "0",
                        borderRadius: "10px",
                        borderColor: "rgb(137, 68, 255)",
                        color: "black",
                        '&:hover': {
                            backgroundColor: 'rgba(137, 68, 255, 0.1)',
                            borderColor: 'rgba(137, 68, 255, 0.5)',
                        }
                    }}
                    onClick={handleInsertImage}
                >
                    <div className={styles.icon}>
                        <AddIcon 
                            sx={{
                                color: "black",
                                fontSize: "18px",
                                marginTop: "-22px",
                            }}
                        />
                        <ImageOutlinedIcon 
                            sx={{
                                color: "black",
                                fontSize: "24px", // アイコンのサイズ調整
                                marginLeft: "-10px", // 少し重ねるためにアイコン間の距離調整
                            }}
                        />
                    </div>
                    <span>画像</span>
                </Button>
                <Button 
                    variant="outlined"
                    className={`${styles.fin} ${styles.insert}`}
                    sx={{
                        height: "50px",
                        width: "150px",
                        padding: "0",
                        borderRadius: "10px",
                        borderColor: "rgb(137, 68, 255)",
                        color: "black",
                        '&:hover': {
                            backgroundColor: 'rgba(137, 68, 255, 0.1)',
                            borderColor: 'rgba(137, 68, 255, 0.5)',
                        }
                    }}
                    onClick={handleFinish}
                >
                    <div className={styles.icon}>
                        <AddIcon 
                            sx={{
                                color: "black",
                                fontSize: "18px",
                                marginTop: "-22px",
                                visibility: "hidden",  // アイコンを非表示にするが、サイズは維持
                            }}
                        />
                        <CheckCircleOutlineOutlinedIcon
                            sx={{
                                color: "black",
                                fontSize: "24px", // アイコンのサイズ調整
                                marginLeft: "-10px", // 少し重ねるためにアイコン間の距離調整
                            }}
                        />
                    </div>
                    <span>完了</span>
                </Button>
            </div>

            <div className={styles.memo}>
            {/* memoFormの内容を開いて、MemoOfTextコンポーネントに情報を渡して表示 */}
            {memoForm.map((item, index) => {
                    if (item.type === "text") {
                        return (
                            <MemoOfText
                                key={item.order}
                                order={item.order}
                                content={item.content}
                                onInputChange={handleInputChange}
                            />
                        );
                    }
                    if (item.type === "img") {
                        return (
                            <p>imgだよ</p>
                        )
                    }
                    return null;
                })}
            </div>
            <div className={styles.map}></div>
        </div>
    )
}

export default CreateMemo

{/* <p>flaskdjflakwejfa;lkjd;laskjfal;skjfa;lkdjsafadsfkjekjsdnfaea;oiewj awiojawe;foijas  ;oiasef;oijwaer;ijawef:aif;piojga:piojreg:piaj  v:pijef:paijfa:wpoj</p>
<p>fslakjkl;kjdf;lkasf;;al;bef;ajwefj;oijds</p>
<img className= {styles.img} src='/default.png' alt="試し" /> */}