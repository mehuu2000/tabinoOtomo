
// ログイン用
import { create } from 'zustand'
import { ModalType } from '@/app/types'

// ログイン状態管理
//zustandはグローバルで使えるuseStateみたいなもの
const useLoginModal = create<ModalType>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))

export default useLoginModal