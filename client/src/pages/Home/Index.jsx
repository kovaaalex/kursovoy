import Header from "../../components/Header/Index";
import Players from "../../components/Players/Index";
function Home() {
    return (
      <>
        <Header />
        <div>
          <h1>Welcome to the FC Barcelona page!</h1>
          <Players></Players>
        </div>
      </>
    );
  }
  
  export default Home;