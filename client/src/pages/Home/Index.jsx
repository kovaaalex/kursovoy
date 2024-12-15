import Header from "../../components/Header/Index";
import Players from "./Players/Index";
import styles from './Home.module.css'
import Employee from "./Employees/Index";
function Home() {
    return (
      <div className={styles.home}>
        <Header />
        <section>
          <h1>Welcome to the FC Barcelona page!</h1>
          <Players />
          <Employee />
        </section>
      </div>
    );
  }
  
  export default Home;