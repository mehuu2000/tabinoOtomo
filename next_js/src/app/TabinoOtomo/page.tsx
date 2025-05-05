// 'use client'

import getCurrentUser from "../actions/getCurentUser";

const Top = async () => {
    const currentUser = await getCurrentUser()

    return (
        <>
            <div className="text-center pt-[60px]">
                {currentUser ? <div>認証中</div> : <div>未認証</div>}
            </div>
        </>
    )

}

export default Top