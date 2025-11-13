import adze, { setup } from "adze";

setup({
  levels: {
    debug: {
      levelName: "Debug",
      level: 1,
      style: "",
      emoji: "",
      method: "debug",
      terminalStyle: ["white", "bgCyanBright"],
    },
  },
});

const logger = adze.seal();
export default logger;
