import { delay } from "./utils.ts";
import { cereProc, oddcast, openTTS, streamlabs } from "./voice-engines.ts";

interface play {
  characters: { name: string; voice: string; voiceEngine: string }[];
  characterLineStart: string;
  characterLineSplit: string;
  ignoreStart: string[];
  lineSplit: string;
  files: string[];
}

const DEBUG = false;

const main = async (playName: string, skipOutput = false) => {
  await Deno.mkdir(`./audio/${playName}`, { recursive: true });

  const play = (await import(`./plays/${playName}.json`, {
    assert: { type: "json" },
  })).default as play;

  for (let n = 0; n < play.files.length; n++) {
    const fileName = play.files[n];
    const file = await Deno.readTextFile(`./plays/${fileName}`);

    const lines = file.split(play.lineSplit).map((l) => {
      for (let m = 0; m < play.characters.length; m++) {
        const character = play.characters[m];

        if (l.startsWith(`${play.characterLineStart}${character.name}`)) {
          return {
            character: character.name,
            voice: character.voice,
            voiceEngine: character.voiceEngine,
            line: l.replace(
              `${play.characterLineStart}${character.name}${play.characterLineSplit}`,
              "",
            ),
          };
        }
      }

      for (let m = 0; m < play.ignoreStart.length; m++) {
        if (l.startsWith(play.ignoreStart[m])) {
          return null;
        }
      }

      throw new Error(`No character for ${l.trim().slice(0, 50)}...`);
    }).filter((a) => a);

    DEBUG && console.debug("lines", lines);

    for (let m = 0; m < lines.length; m++) {
      const line = lines[m];

      DEBUG && console.debug("line", line);

      if (line?.voice) {
        const subLines = line.line.split("\n").map((l) => l.trim()).filter(
          (l) => l
        );

        for (let i = 0; i < subLines.length; i++) {
          let extension = "";
          switch (line.voiceEngine) {
            case "streamlabs":
            case "cereproc":
            case "oddcast":
              extension = ".mp3";
              break;
            case "opentts":
              extension = ".wav";
              break;
            default:
              throw new Error(`unrecognised voice engine ${line.voiceEngine}`);
          }

          const soundFilename = `./audio/${playName}/${
            n.toString().padStart(4, "0")
          }-${m.toString().padStart(3, "0")}-${
            i.toString().padStart(3, "0")
          }-${line?.character}${extension}`;

          if (skipOutput) {
            continue;
          }

          try {
            await Deno.lstat(soundFilename);

            console.info("already have", soundFilename);
            continue;
          } catch (err) {
            if (!(err instanceof Deno.errors.NotFound)) {
              throw err;
            }
          }

          console.info("getting", soundFilename);

          let stream: ReadableStream<Uint8Array> | null = null;

          switch (line.voiceEngine) {
            case "streamlabs":
              stream = await streamlabs(line.voice, subLines[i]);
              break;
            case "opentts":
              stream = await openTTS(line.voice, subLines[i]);
              break;
            case "cereproc":
              stream = await cereProc(line.voice, subLines[i]);
              break;
            case "oddcast":
              stream = await oddcast(line.voice, subLines[i]);
              break;
            default:
              throw new Error("no voice engine");
          }

          if (!stream) {
            throw new Error("No voice file stream");
          }

          await Deno.writeFile(
            soundFilename,
            stream,
          );

          console.info(
            "subLines",
            ((i + 1) / subLines.length).toFixed(2),
            "lines",
            ((m + 1) / lines.length).toFixed(2),
            "files",
            ((n + 1) / play.files.length).toFixed(2),
          );
          await delay(3000);
        }
      }
    }
  }
};

main("hamlet");
