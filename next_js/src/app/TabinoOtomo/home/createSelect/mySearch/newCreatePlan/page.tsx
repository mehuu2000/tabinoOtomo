'use client'

import styles from './page.module.css';

// import Header_c from '../../../../../../components/header_c';
import MySearch_c from '../../../../../../components/mySearch_c';
// import Footer_c from '../../../../../../components/footer_c';


export default function MySearch() {

  // const [goTo, setGoTo] = useState<string>("");
  // const [when, setWhen] = useState<string>("");
  // const [days, setDays] = useState<number>(1);
  // const [weather, setWeather] = useState<boolean>(false);

  // const [flaskResponse, setFlaskResponse] = useState<string>("");

  // const displayMySearch = async () => {
  //   console.log("displayMySearch関数")
  //   console.log("行き先:", goTo);
  //   console.log("いつから:", when);
  //   console.log("何日間:", days);
  //   console.log("天気予報表示:", weather);
  //   console.log("--------------------");

    // try {
    //   const response = await fetch('/api/hello', {
    //     method: 'GET',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     }
    //   });
  
    //   if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    //   }
  
    //   const data = await response.json();
    //   setFlaskResponse(data.message);
    // } catch (error) {
    //   console.error('API 呼び出し中のエラー:', error);
    //   setFlaskResponse('API 呼び出しに失敗しました');
    // }
  // };

  // useEffect(() => {
  //   if (flaskResponse) {
  //     console.log('Flask サーバーからの応答:', flaskResponse); // 状態が変更されるたびに表示
  //   }
  // }, [flaskResponse]);

  return (
    <div className={styles.main}>
        <MySearch_c />
    </div>
  )
}