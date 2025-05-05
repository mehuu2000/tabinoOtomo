'use client';

import React, { useRouter } from 'next/navigation';
import styles from '../components/module_css/createSelect_c.module.css';

export default function CreateSelect_c() {
  const router = useRouter();

  const renderingWithAi = () => {
    console.log("rendaringWithAi関数が呼び出されました");
    router.push('/TabinoOtomo/home/createSelect/withAi/newCreatePlan');
  };
  const renderingMySearch = () => {
    console.log("rendaringMySearch関数が呼び出されました");
    router.push('/TabinoOtomo/home/createSelect/mySearch/newCreatePlan');
  };

  return (
    <div className={styles.main}>
      <h2 className={styles.h2}>どちらの方式で作成しますか？</h2>
      <div className={styles.content}>
        <button className={styles.subject} onClick={renderingWithAi}>
          <div>
            <h3>AIと相談しながら作る</h3>
          </div>
        </button>
        <button className={styles.subject} onClick={renderingMySearch}>
          <div>
            <h3>自分で検索、選択する</h3>
          </div>
        </button>
      </div>
    </div>
  )
}