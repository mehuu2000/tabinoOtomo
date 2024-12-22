// 'use client'

import getCurrentUser from "../actions/getCurentUser";
import Header_c from "@/components/header_c";
import { Suspense } from 'react';

const Top = async() => {
    const currentUser = await getCurrentUser()

    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <Header_c />
            </Suspense>
            <div className="text-center">
                {currentUser ? <div>認証中</div> : <div>未認証</div>}
            </div>
        </>
    )

}

export default Top