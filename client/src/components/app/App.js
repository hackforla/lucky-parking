import React from "react";
import MainMap from "./map/Map";
import Geosearch from "./Geosearch";
import Header from "./Header";
import Sidebar from "./Sidebar";

import "../../sass/main.scss";

function App() {
  return (
    <div className="App">
      <Header />
      <Sidebar />
      <Geosearch />
      <MainMap />
    </div>
  );
}

export default App;
