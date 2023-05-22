import { Map } from "@/entities";
import Header from "@/widgets/header";
import Page from "@/shared/ui/page";
import ActionBox from "src/widgets/action-box";

function MainPage() {
  return (
    <Page>
      <Header />

      <div className="absolute z-50 top-20 left-4">
        <ActionBox />
      </div>

      <Map />
    </Page>
  );
}

export default MainPage;
