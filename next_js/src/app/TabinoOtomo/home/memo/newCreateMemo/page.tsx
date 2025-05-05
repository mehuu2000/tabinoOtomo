'use client';

import React, { useEffect, useState } from 'react'
import styles from './newCreateMemo.module.css';
import { useSession } from 'next-auth/react';

import MemoOfText from '@/components/createMemoModule/memoOfText';
import MemoOfImage from '@/components/createMemoModule/memoOfImage';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add'; //プラス
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined'; //テキスト
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'; //イメージ
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'; //完了
import { User as PrismaUser } from '@prisma/client';

import { useRouter } from 'next/navigation';

function CreateMemo() {
    const router = useRouter();

    const [number, setNumber] = useState(1);

    const [memoTitle, setMemoTitle] = useState("");

    const [memoForm, setMemoForm] = useState<{
        type: "text" | "img";
        content: string;
        order: number;
    }[]>([]);

    const { data: session } = useSession();
    // const { data: session, status } = useSession();
    const [currentUser, setCurrentUser] = useState<PrismaUser | null>(null);

    //サーバーサイドから情報を取得←useSessionで取れよ
    //できないんだよ
    //いや、それはauthのところのcallback, async sessionのところで設定できるやろ
    //めんどくさいんだよ！
    useEffect(() => {
        const fetchUser = async () => {
            if (session?.user?.email) {
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
    
        if (session?.user?.email) {
            fetchUser();
        }
    }, [session]);
    useEffect(() => {
        console.log(currentUser?.id)
    }, [currentUser]);

    //タイトルの変更を反映
    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMemoTitle(event.target.value);
        console.log(memoTitle);
    }

    //テキスト追加処理
    const handleInsertText = () => {
        console.log("テキスト追加ボタンが押されました。");
        const order = number;
        setNumber(number + 1);
        setMemoForm([...memoForm, { type: "text", content: "", order }]);
        console.log(memoForm);
    }

    //画像追加処理
    const handleInsertImage = () => {
        console.log("画像追加ボタンが押されました。");
    
        // ファイル選択用のinputを作成
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*'; // 画像のみ許可
    
        input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();

                reader.onloadend = () => {
                    // Base64形式の画像データを取得
                    const base64Image = reader.result as string;
                    const order = number;
                    setNumber(number + 1);

                    // memoFormにBase64画像データを追加
                    setMemoForm([
                        ...memoForm,
                        { type: "img", content: base64Image, order },
                    ]);

                    console.log(memoForm);
                };

                // Base64エンコードを開始
                reader.readAsDataURL(file);
            }
        };
    
        // ファイル選択ダイアログを表示
        input.click();
    };

    //テキストの内容が変更された場合、引数のorderに合うもののmemoFormのcontetの値を引数のnewContentで更新
    const handleMemoChange = (order: number, newContent: string) => {
        setMemoForm(prevMemoForm => 
            prevMemoForm.map(item =>
                item.order === order ? { ...item, content: newContent } : item
            )
        );
    };

    //削除ボタンを押すと、引数のorderに合うものをmemoFormから削除する
    const handleDelete = (order: number) => {
        setMemoForm(prevMemoForm => prevMemoForm.filter(item => item.order !== order));
    };

    //メモ作成
    const handleMemoCreate = async () => {
        console.log("メモ作成ボタンが押されました。");
        console.log(`識別ユーザIDは${currentUser?.id}です`);
        console.log(memoForm);
        console.log(memoTitle);

        if(currentUser?.id) {
            try {
                const filteredMemoForm = memoForm.filter(item => item.content.trim() !== '');

                if (filteredMemoForm.length != 0) {
                    const response = await fetch('/api/createMemo', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            memoTitle: memoTitle,
                            memoForm: filteredMemoForm,
                            userId: currentUser?.id,
                        }),
                    });
            
                    const data = await response.json();
            
                    if (data.success) {
                        console.log("メモが正常に保存されました:", data.memo);
                        alert("メモが正常に保存されました！");
                        setNumber(1);
                        setMemoTitle("");
                        setMemoForm([]);
                        router.back();
                    } else {
                        console.error("エラー:", data.message);
                        alert("メモの保存中にエラーが発生しました。");
                    }
                } else {
                    alert("メモの内容がありません!");
                }
            } catch (error) {
                console.error("エラー:", error);
                alert("メモの保存中にエラーが発生しました。");
            }
        } else {
            console.log("ログインしてください");
        }
    }

    return (
        <div className={styles.main}>
            <div className={styles.side}>
                {/* テキスト追加ボタン */}
                <Button 
                    variant="outlined"
                    className={`${styles.insertP} ${styles.insert}`}
                    sx={{
                        height: "50px",
                        width: "180px",
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
                    <span>テキスト挿入</span>
                </Button>

                {/* 画像追加ボタン */}
                <Button 
                    variant="outlined"
                    className={`${styles.insertImg} ${styles.insert}`}
                    sx={{
                        height: "50px",
                        width: "180px",
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
                    <span>画像挿入</span>
                </Button>
                <Button 
                    variant="outlined"
                    className={`${styles.fin} ${styles.insert}`}
                    sx={{
                        height: "50px",
                        width: "180px",
                        padding: "0",
                        borderRadius: "10px",
                        borderColor: "rgb(137, 68, 255)",
                        color: "black",
                        '&:hover': {
                            backgroundColor: 'rgba(137, 68, 255, 0.1)',
                            borderColor: 'rgba(137, 68, 255, 0.5)',
                        }
                    }}
                    onClick={handleMemoCreate}
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
                <TextField
                    id="standard-basic"
                    label=""
                    variant="standard"
                    value={memoTitle} 
                    onChange={(handleTitleChange)}
                    className={styles.titleInput}
                    slotProps={{
                        input: { 
                            style: { 
                                fontSize: '24px',
                                color: 'rgb(137, 68, 255)',
                            }
                        }, 
                        inputLabel: { style: { fontSize: '12px' } }, // ラベルのフォントサイズ
                        
                    }}
                    sx={{
                        fontSize: '24px',
                        width: '80%',
                        padding: '5px',
                        marginTop: '10px',
                        marginBottom: '30px',
                    }}
                />
                {/* memoFormの内容を開いて、MemoOfTextコンポーネントに情報を渡して表示 */}
                {memoForm.map((item) => {
                // {memoForm.map((item, index) => {
                    if (item.type === "text") {
                        return (
                            <MemoOfText
                                key={item.order}
                                order={item.order}
                                content={item.content}
                                onInputChange={handleMemoChange}
                                onDelete={handleDelete}
                            />
                        );
                    }
                    if (item.type === "img") {
                        return (
                            <MemoOfImage
                                key={item.order}
                                order={item.order}
                                content={item.content}
                                onImageChange={handleMemoChange}
                                onDelete={handleDelete}
                            />
                        );
                    }
                    return null;
                })}
            </div>
            <div className={styles.map}></div>
        </div>
    )
}

export default CreateMemo