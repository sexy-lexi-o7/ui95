import { h } from "preact";
import { storiesOf } from "@storybook/react";
import Wizard from "./index.js";

function generateStep() {
  return {
    mode: "update",
    content: faker.lorem.paragraph(),
    wizardOptions: {},
    buttonText: "Finish"
  };
}

const wizardOptions = {
  "I would like to find out more about the thing": generateStep(),
  "I would like to play a game": generateStep(),
  "No thanks, I will explore by myself": generateStep()
};

storiesOf("App/Wizard", module).add("Wizard style", () => (
  <Wizard
    title="Wizard post"
    image="http://placekitten.com/100/300"
    wizardOptions={wizardOptions}
    error={new Error("an error")}
    onFocus={() => {}}
    onClose={() => {}}
    content={faker.lorem.paragraph() + "<br><br>"}
  >
    Test
  </Wizard>
));
