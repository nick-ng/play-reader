export const openTTS = async (
  voice: string,
  text: string,
): Promise<ReadableStream<Uint8Array>> => {
  const denoiserStrength = 0.2;

  const url = `http://localhost:5500/api/tts?voice=${
    encodeURIComponent(voice)
  }&text=${
    encodeURIComponent(text)
  }&vocoder=high&denoiserStrength=${denoiserStrength}&cache=false`;

  const res = await fetch(url);

  if (res.status !== 200 || !res.body) {
    console.log("res", res);
    throw new Error("error with OpenTTS");
  }

  return res.body;
};
