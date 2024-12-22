'use client'

import { useCallback, useState } from 'react'
import { signOut } from 'next-auth/react'
import { User } from '@prisma/client'

import useLoginModal from '../../app/hooks/useLoginModal'
import useSignupModal from '../../app/hooks/useSignupModal'
import useProfileModal from '../../app/hooks/useProfileModal'
import MenuItem from './MenuItem'
import Image from 'next/image'

// 引数の型付け
type MenuProps = {
  currentUser: User | null
}

// メニュー
const Menu: React.FC<MenuProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false)
  const loginModal = useLoginModal()
  const signupModal = useSignupModal()
  const profileModal = useProfileModal()

  // メニューオープン
  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value)
  }, [])

  return (
    <div className="relative">
        {/* アバターをクリックするとトグルが開閉する */}
      <div className="relative h-10 w-10 cursor-pointer" onClick={toggleOpen}>
        <Image
          src={currentUser?.image || '/default.png'}
          className="rounded-full object-cover"
          alt="avatar"
          fill
          sizes="(max-width: 600px) 25vw, (max-width: 1200px) 10vw, 5vw" 
        />
      </div>

      {/* トグルがtrueの場合はメニューが開く */}
      {isOpen && (
        <div className="absolute right-0 z-10 w-40 overflow-hidden rounded-lg bg-white text-sm shadow-lg shadow-gray-100 text-black">
          <div className="cursor-pointer">
            {/* currentUserがいるならメニュー,プロフィール いないならログイン,サインアップ */}
            {currentUser ? (
              <>
                <MenuItem
                  label="プロフィール"
                  onClick={() => {
                    profileModal.onOpen()
                    setIsOpen(false)
                  }}
                />
                <MenuItem
                  label="ログアウト"
                  onClick={() => {
                    signOut()
                    setIsOpen(false)
                  }}
                />
              </>
            ) : (
              <>
                <MenuItem
                  label="ログイン"
                  onClick={() => {
                    loginModal.onOpen()
                    setIsOpen(false)
                  }}
                />
                <MenuItem
                  label="サインアップ"
                  onClick={() => {
                    signupModal.onOpen()
                    setIsOpen(false)
                  }}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Menu