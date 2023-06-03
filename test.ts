import { cereProc, openTTS, streamlabs } from "./voice-engines.ts";

const main = async () => {
  console.log("getting test cereProc file");
  const cereProcStream = await cereProc(
    "Andrew-CereWave",
    "You come most carefully upon your hour.",
  );

  await Deno.writeFile("./cereProc-test.mp3", cereProcStream);

  console.log("getting test streamlabs file");
  const streamlabsStream = await streamlabs(
    "Geraint",
    "You come most carefully upon your hour.",
  );

  await Deno.writeFile("./streamlabs-test.mp3", streamlabsStream);

  console.log("got test streamlabs file");

  console.log("getting test opentts file");

  const openTTSStream = await openTTS(
    "marytts:cmu-rms-hsmm",
    "You come most carefully upon your hour.",
  );

  await Deno.writeFile("./opentts-test.wav", openTTSStream);

  console.log("got test opentts file");
};

main();
