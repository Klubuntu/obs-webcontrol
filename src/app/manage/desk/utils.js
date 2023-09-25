import styles from '../../page.module.css'

function BoxGenerator({ col, row, color }) {

    const handleBoxClick = (num_box) => {
      window.location.href = `desk/set?btn=${num_box}`;
    };

    const boxes = [];
    let a=0;
    for (let i = 0; i < row; i++) {
      const rowBoxes = [];
      for (let j = 0; j < col; j++){
        const num_box = col * i + j;
        rowBoxes.push(
          <div
            key={`${i}+${j}`}
            className={styles.deckbox}
            onClick={() => handleBoxClick(num_box)}
          >{a}</div>
        );
        a++;
      }
      boxes.push(<div key={i}>{rowBoxes}</div>);
    }
  
    return <div className={styles.deck}>{boxes}</div>;
  }
  
  export default BoxGenerator;