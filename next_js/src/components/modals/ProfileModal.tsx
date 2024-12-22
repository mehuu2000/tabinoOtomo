'use client'
import styles from './ProfileModal.module.css'
import React, { useEffect, useState } from 'react'
import { User } from '@prisma/client'
import Image from 'next/image'
import Button from '@mui/material/Button';
import AutorenewIcon from '@mui/icons-material/Autorenew';

type ProfileModalProps = {
    currentUser: User | null
}

const ProfileModal: React.FC<ProfileModalProps> = ({ currentUser }) => {
    //ユーザー情報
    const [userImage, setUserImage] = useState<string>("")
    const [userName, setUserName] = useState<string>("")
    const [userIntro, setUserIntro] = useState<string>("")

    //入力情報
    const [image, setImage ] = useState<string>("")
    const [name, setName] = useState<string>("")
    const [intro, setIntro] = useState<string>("")

    //初期設定
    useEffect(() => {
        if (currentUser) {
          setUserImage(currentUser.image || "")
          setUserName(currentUser.name || "")
          setUserIntro(currentUser.intro || "")

          setImage(currentUser.image || "")
          setName(currentUser.name || "")
          setIntro(currentUser.intro || "")
        }
    }, [currentUser])

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; // 選択されたファイルを取得
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // 画像のURLを状態に設定
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file); // 画像をDataURLとして読み込む
        }
    };


  return (
    <div className={styles.main}>
        <div className={styles.profile}>
            <div className={styles.image}>
                <div className={styles.img}>
                    <Image
                        src={image || '/default.png'}
                        alt="プロフィール画像"
                        width={250}  // 画像の横幅を指定
                        height={250} // 画像の高さを指定
                        objectFit="cover" // 画像をカバーするようにフィットさせる
                        style={{ maxWidth: '250px', maxHeight: '250px' }}
                    />
                </div>
                <Button 
                    variant="outlined" 
                    startIcon={<AutorenewIcon />}
                    sx={{
                        height: 'auto',
                        width: 'auto',
                        fontSize: '12px',
                    }}
                    onClick={() => document.getElementById('file-input')?.click()} // クリックでファイル選択
                >変更
                </Button>
                {/* ファイル入力（非表示） */}
                <input
                    type="file"
                    accept="image/*" // 画像のみ選択
                    style={{ display: 'none' }} // 非表示にする
                    onChange={handleImageChange} // 画像選択時の処理
                    id="file-input"
                />
            </div>
            <div className={styles.name_intro}>
                <h2>{name ? name : '名無し'}</h2>
                <p>{intro ? intro : '私はたびとも太郎です。現在旅共国際大学農学部でITの勉強をしています。よろしくお願いします。'}</p>
            </div>
        </div>
        <div className={styles.operation}>
            <p>元に戻す</p>
            <p>完了</p>
        </div>
    </div>
  )
}

export default ProfileModal