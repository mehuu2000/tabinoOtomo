import React from 'react'

import styles from "./createSelect.module.css";
// import Header_c from "../../../../components/header_c";
import CreateSelect_c from "../../../../components/createSelect_c";
// import Footer_c from "../../../../components/footer_c";

export default function CreateSelect() {
    return (
        <>
          <div className={styles.main}>
              <CreateSelect_c />
          </div>
        </>
      );
}