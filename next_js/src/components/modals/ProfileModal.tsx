'use client'
import styles from './ProfileModal.module.css'
import React, { useCallback, useEffect, useState } from 'react'
import { User } from '@prisma/client'
import Image from 'next/image'
import Button from '@mui/material/Button';
import AutorenewIcon from '@mui/icons-material/Autorenew';
// import Modal from '../../components/modals/Modal';
import useProfileModal from '../../app/hooks/useProfileModal';
import Modal from './Modal'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

type ProfileModalProps = {
    currentUser: User | null
}

const ProfileModal: React.FC<ProfileModalProps> = ({ currentUser }) => {
    const router = useRouter()
    const profileModal = useProfileModal()
    const [loading, setLoading] = useState(false)

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

    const onCloseProlile = useCallback(() => {
        profileModal.onClose()
    }, [profileModal])

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handleIntroChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setIntro(e.target.value); // 入力値を更新
    };


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

    const onSubmit = async (image: string, name: string, intro: string) => {
        setLoading(true)
        try {
            console.log(`image:${image}`)
            console.log(`name:${name}`)
            console.log(`intro:${intro}`)
            console.log("--------------------")

            const data = {
                submitImage: image !== userImage ? image : null,  // imageの値を代入
                submitName: name !== userName ? name : null,     // nameの値を代入
                submitIntro: intro !== userIntro ? intro : null,   // introの値を代入
                userId: currentUser?.id,
            };

            const response = await fetch('/api/updateProfile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('プロフィールを変更しました!')
                console.log('ユーザー情報が更新されました', result);
                onCloseProlile();  // モーダルを閉じる
                router.refresh()
            } else {
                console.error('更新エラー', result);
            }
        } catch (error) {
        console.error('エラー:', error);
        } finally {
            setLoading(false); // 非同期処理の終了後に実行
        }
    }

    const resetFild = () => {
        setImage(userImage)
        setName(userName)
        setIntro(userIntro)
    }

    const bodyContent = (
        <form 
            className={styles.main}
            onSubmit={(e) => {
                console.log("データ送信されたよ");
                e.preventDefault(); // デフォルト動作をキャンセル
                onSubmit(image, name, intro);
            }}
        >
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
                    <label htmlFor="name">名前</label>
                    <input 
                        className={styles.name}
                        value={name || ''}
                        onChange={handleNameChange}
                        id='name'
                    />
                    <label htmlFor="intor">自己紹介</label>
                    <textarea 
                        className={styles.intro} 
                        value={intro || ''}
                        onChange={handleIntroChange}
                        id='intro'
                    />
                </div>
            </div>
            <div className={styles.operation}>
                <Button 
                    variant="contained"
                    onClick={() => resetFild()}
                    >元に戻す
                </Button>
                <Button 
                    variant="contained" 
                    type='submit'
                    >完了
                </Button>
            </div>
        </form>
    )

    return(
        <Modal
        disabled={loading}
        isOpen={profileModal.isOpen}
        title="サインアップ"
        primaryLabel="サインアップ"
        onClose={profileModal.onClose}
        onSubmit={() => onSubmit(image, name, intro)}
        body={bodyContent}
        />
    )
}

export default ProfileModal