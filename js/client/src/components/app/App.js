import React from "react";
import MainMap from "./map/Map";
import Geosearch from "./Geosearch";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Instructions from "./Instructions";

import "../../sass/main.scss";

function App() {
  return (
    <div className="App">
      <Header />
      <Instructions />
      <Sidebar />
      <Geosearch />
      <MainMap />
    </div>
  );
}

export default App;
